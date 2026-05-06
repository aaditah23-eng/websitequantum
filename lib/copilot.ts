export type CopilotSeverity = 'Critical' | 'High' | 'Medium' | 'Low' | 'Info' | 'Positive';

export type CopilotFinding = {
  id: string;
  title: string;
  severity: CopilotSeverity;
  category:
    | 'RSA'
    | 'ECDSA'
    | 'ECDH'
    | 'Hardcoded Key'
    | 'TLS'
    | 'JWT'
    | 'OpenSSL'
    | 'Crypto Library'
    | 'Dependency'
    | 'Certificate'
    | 'PQC Migration'
    | 'PQC Library'
    | 'PQC Algorithm'
    | 'PQC TLS'
    | 'Migration Maturity';
  file: string;
  line?: number;
  evidence: string;
  explanation: string;
  recommendation: string;
};

export type CopilotResult = {
  repoUrl: string;
  owner: string;
  repo: string;
  branch: string;
  scannedAt: string;
  filesScanned: number;
  findings: CopilotFinding[];
  score: number;
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  pqcMaturityScore: number;
  pqcMaturityLevel: 'None' | 'Early' | 'Partial' | 'Advanced';
  pqcSignalsFound: number;
  riskyCryptoFindings: number;
  summary: string;
};

type RepoRef = {
  owner: string;
  repo: string;
};

type RepoFile = {
  path: string;
  content: string;
};

const MAX_FILES = 100;
const MAX_FILE_SIZE = 150_000;

const TARGET_EXTENSIONS = [
  '.js',
  '.jsx',
  '.ts',
  '.tsx',
  '.py',
  '.java',
  '.go',
  '.rs',
  '.cs',
  '.php',
  '.rb',
  '.c',
  '.cpp',
  '.h',
  '.hpp',
  '.yml',
  '.yaml',
  '.json',
  '.toml',
  '.xml',
  '.env',
  '.conf',
  '.config',
  '.pem',
  '.key',
  '.crt',
  '.md',
  '.txt',
  '.lock',
];

const TARGET_FILENAMES = [
  'package.json',
  'package-lock.json',
  'yarn.lock',
  'pnpm-lock.yaml',
  'requirements.txt',
  'pyproject.toml',
  'poetry.lock',
  'pom.xml',
  'build.gradle',
  'go.mod',
  'go.sum',
  'cargo.toml',
  'cargo.lock',
  'dockerfile',
  'docker-compose.yml',
  '.env',
  '.env.example',
  'nginx.conf',
  'openssl.cnf',
  'readme.md',
];

const RISK_RULES: Array<{
  id: string;
  title: string;
  severity: CopilotSeverity;
  category: CopilotFinding['category'];
  regex: RegExp;
  explanation: string;
  recommendation: string;
}> = [
  {
    id: 'rsa-keygen',
    title: 'RSA key generation or RSA private key detected',
    severity: 'High',
    category: 'RSA',
    regex:
      /\b(RSA_generate_key|generateKeyPairSync\(['"]rsa['"]|KeyPairGenerator\.getInstance\(['"]RSA['"]|rsa\.GenerateKey|cryptography\.hazmat\.primitives\.asymmetric\.rsa|BEGIN RSA PRIVATE KEY)\b/i,
    explanation:
      'RSA is vulnerable to future cryptographically relevant quantum computers through Shor’s algorithm. This usage should be inventoried and migrated where used for key exchange or signatures.',
    recommendation:
      'Inventory this RSA usage. For new designs, plan migration toward ML-KEM for key establishment and ML-DSA or SLH-DSA for signatures.',
  },
  {
    id: 'ecdsa-detected',
    title: 'ECDSA usage detected',
    severity: 'High',
    category: 'ECDSA',
    regex: /\b(ECDSA|ecdsa|secp256r1|prime256v1|secp384r1|P-256|P-384|ES256|ES384)\b/,
    explanation:
      'ECDSA signatures rely on elliptic-curve discrete logarithms, which are not quantum-resistant.',
    recommendation:
      'Track this usage as a signature migration candidate. Consider ML-DSA or SLH-DSA for future post-quantum signatures.',
  },
  {
    id: 'ecdh-detected',
    title: 'ECDH key agreement detected',
    severity: 'High',
    category: 'ECDH',
    regex: /\b(ECDH|ecdh|createECDH|X25519|secp256k1|secp256r1|prime256v1)\b/,
    explanation:
      'ECDH and elliptic-curve key agreement are vulnerable to future quantum attacks.',
    recommendation:
      'For TLS and application-level key exchange, plan hybrid migration using ML-KEM-based key establishment where supported.',
  },
  {
    id: 'hardcoded-private-key',
    title: 'Hardcoded private key detected',
    severity: 'Critical',
    category: 'Hardcoded Key',
    regex: /-----BEGIN (RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/,
    explanation:
      'Private keys should not be stored in source code. This is an immediate security risk independent of quantum migration.',
    recommendation:
      'Remove the key from the repository, rotate it immediately, and move secrets into a managed secret store.',
  },
  {
    id: 'hardcoded-secret',
    title: 'Possible hardcoded secret detected',
    severity: 'High',
    category: 'Hardcoded Key',
    regex:
      /\b(api[_-]?key|secret|token|private[_-]?key|client[_-]?secret)\b\s*[:=]\s*['"][A-Za-z0-9_\-./+=]{16,}['"]/i,
    explanation:
      'Hardcoded secrets create immediate compromise risk and make crypto migration harder.',
    recommendation:
      'Move secrets to environment variables or a managed secrets vault. Rotate exposed credentials.',
  },
  {
    id: 'tls-old-version',
    title: 'Legacy TLS version configured',
    severity: 'High',
    category: 'TLS',
    regex: /\b(TLSv1(\.0)?|TLSv1\.1|SSLv2|SSLv3|PROTOCOL_TLSv1|PROTOCOL_TLSv1_1)\b/,
    explanation:
      'Legacy TLS versions are weak and block crypto-agility.',
    recommendation:
      'Disable SSLv2, SSLv3, TLS 1.0, and TLS 1.1. Require TLS 1.2 minimum and prefer TLS 1.3.',
  },
  {
    id: 'tls-insecure-verify',
    title: 'TLS certificate verification disabled',
    severity: 'Critical',
    category: 'TLS',
    regex:
      /\b(rejectUnauthorized\s*:\s*false|verify\s*=\s*False|CERT_NONE|InsecureSkipVerify\s*:\s*true|NODE_TLS_REJECT_UNAUTHORIZED\s*=\s*['"]0['"])\b/,
    explanation:
      'Disabling TLS verification allows man-in-the-middle attacks.',
    recommendation:
      'Re-enable certificate verification and fix certificate trust issues properly.',
  },
  {
    id: 'jwt-weak-alg',
    title: 'Weak JWT signing pattern detected',
    severity: 'High',
    category: 'JWT',
    regex: /\b(alg\s*[:=]\s*['"]none['"]|HS256|jwt\.sign\([^)]*['"][^'"]{1,16}['"])\b/i,
    explanation:
      'Weak JWT signing patterns can allow token forgery or key guessing.',
    recommendation:
      'Avoid alg=none and short HMAC secrets. Use strong signing algorithms and managed key rotation.',
  },
  {
    id: 'openssl-old-reference',
    title: 'Potential old OpenSSL reference',
    severity: 'Medium',
    category: 'OpenSSL',
    regex: /\b(OpenSSL\s+1\.0|OpenSSL\s+1\.1|openssl@1\.1|libssl1\.1)\b/i,
    explanation:
      'Old OpenSSL stacks may lack modern TLS and PQC migration support.',
    recommendation:
      'Upgrade TLS libraries and track OpenSSL 3.x or PQC-capable stack readiness.',
  },
  {
    id: 'weak-hash',
    title: 'Weak hash function detected',
    severity: 'Medium',
    category: 'Crypto Library',
    regex: /\b(MD5|SHA1|sha1|md5)\b/,
    explanation:
      'MD5 and SHA-1 are deprecated for security-sensitive use.',
    recommendation:
      'Replace with SHA-256, SHA-384, or stronger alternatives depending on the use case.',
  },
];

const PQC_RULES: Array<{
  id: string;
  title: string;
  severity: CopilotSeverity;
  category: CopilotFinding['category'];
  regex: RegExp;
  maturityPoints: number;
  explanation: string;
  recommendation: string;
}> = [
  {
    id: 'ml-kem-detected',
    title: 'ML-KEM usage or reference detected',
    severity: 'Positive',
    category: 'PQC Algorithm',
    regex: /\b(ML-KEM|MLKEM|ML_KEM|Kyber|kyber768|kyber512|kyber1024)\b/i,
    maturityPoints: 25,
    explanation:
      'ML-KEM is the NIST-standardized key encapsulation mechanism for post-quantum key establishment. This is a strong PQC migration signal.',
    recommendation:
      'Confirm whether ML-KEM is used in production, test, or documentation. Prioritize ML-KEM-768 for Level 3 migration where appropriate.',
  },
  {
    id: 'ml-dsa-detected',
    title: 'ML-DSA usage or reference detected',
    severity: 'Positive',
    category: 'PQC Algorithm',
    regex: /\b(ML-DSA|MLDSA|ML_DSA|Dilithium|dilithium2|dilithium3|dilithium5)\b/i,
    maturityPoints: 20,
    explanation:
      'ML-DSA is a NIST-standardized post-quantum digital signature algorithm. This indicates signature migration planning.',
    recommendation:
      'Map current ECDSA/RSA signing use cases and evaluate ML-DSA migration paths.',
  },
  {
    id: 'slh-dsa-detected',
    title: 'SLH-DSA usage or reference detected',
    severity: 'Positive',
    category: 'PQC Algorithm',
    regex: /\b(SLH-DSA|SLHDSA|SLH_DSA|SPHINCS|SPHINCS\+)\b/i,
    maturityPoints: 15,
    explanation:
      'SLH-DSA is a stateless hash-based post-quantum signature algorithm. This is a useful signal for conservative signature migration planning.',
    recommendation:
      'Use SLH-DSA where conservative hash-based signatures are preferred and performance tradeoffs are acceptable.',
  },
  {
    id: 'x25519mlkem768-detected',
    title: 'Hybrid TLS group X25519MLKEM768 detected',
    severity: 'Positive',
    category: 'PQC TLS',
    regex: /\b(X25519MLKEM768|X25519MLKEM|X25519Kyber768Draft00|X25519Kyber768)\b/i,
    maturityPoints: 30,
    explanation:
      'X25519MLKEM768 is a strong signal of hybrid post-quantum TLS migration using ML-KEM-768.',
    recommendation:
      'Validate this endpoint with the live Website Scanner and ensure coverage across production domains and APIs.',
  },
  {
    id: 'liboqs-detected',
    title: 'liboqs detected',
    severity: 'Positive',
    category: 'PQC Library',
    regex: /\b(liboqs|open-quantum-safe|oqs)\b/i,
    maturityPoints: 25,
    explanation:
      'liboqs is commonly used for experimenting with and integrating post-quantum cryptography.',
    recommendation:
      'Confirm whether liboqs usage is experimental or production-bound. Document supported algorithms and upgrade policy.',
  },
  {
    id: 'oqs-provider-detected',
    title: 'OpenSSL OQS provider detected',
    severity: 'Positive',
    category: 'PQC Library',
    regex: /\b(oqs-provider|OpenSSL OQS Provider|provider=oqs|oqsprovider)\b/i,
    maturityPoints: 25,
    explanation:
      'The OpenSSL OQS provider can expose post-quantum algorithms through OpenSSL-based workflows.',
    recommendation:
      'Validate provider configuration, supported algorithms, and compatibility with production TLS stacks.',
  },
  {
    id: 'openssl-35-detected',
    title: 'OpenSSL 3.5 or newer PQC-ready reference detected',
    severity: 'Positive',
    category: 'OpenSSL',
    regex: /\b(OpenSSL\s+3\.[5-9]|openssl:3\.[5-9]|openssl@3\.[5-9])\b/i,
    maturityPoints: 18,
    explanation:
      'OpenSSL 3.5+ references suggest readiness for newer cryptographic capabilities and PQC testing.',
    recommendation:
      'Verify actual supported groups and providers in deployment, not only dependency declarations.',
  },
  {
    id: 'cloudflare-circl-detected',
    title: 'Cloudflare CIRCL detected',
    severity: 'Positive',
    category: 'PQC Library',
    regex: /\b(circl|github\.com\/cloudflare\/circl|cloudflare\/circl)\b/i,
    maturityPoints: 20,
    explanation:
      'Cloudflare CIRCL includes cryptographic primitives and post-quantum experimentation support.',
    recommendation:
      'Review which CIRCL modules are used and whether they support the intended PQC migration goals.',
  },
  {
    id: 'boringssl-pqc-detected',
    title: 'BoringSSL PQC / hybrid group signal detected',
    severity: 'Positive',
    category: 'PQC TLS',
    regex: /\b(BoringSSL|bssl|X25519MLKEM768|CECPQ2|CECPQ2b)\b/i,
    maturityPoints: 15,
    explanation:
      'BoringSSL or historical hybrid PQC groups can indicate TLS experimentation or platform-level PQC readiness.',
    recommendation:
      'Confirm current production support and avoid relying on deprecated experimental group names.',
  },
  {
    id: 'pqc-roadmap-detected',
    title: 'PQC migration roadmap marker detected',
    severity: 'Positive',
    category: 'Migration Maturity',
    regex: /\b(post-quantum|quantum-safe|quantum resistant|crypto-agility|crypto inventory|PQC migration|harvest now decrypt later)\b/i,
    maturityPoints: 12,
    explanation:
      'Documentation or comments mention PQC migration concepts, which suggests early planning.',
    recommendation:
      'Turn roadmap language into concrete owners, assets, deadlines, and testable migration milestones.',
  },
];

export function parseGitHubUrl(repoUrl: string): RepoRef {
  const cleaned = repoUrl.trim();

  const match = cleaned.match(
    /^https?:\/\/github\.com\/([^/\s]+)\/([^/\s#?]+)(?:[/?#].*)?$/i
  );

  if (!match) {
    throw new Error(
      'Enter a valid GitHub repository URL, for example https://github.com/owner/repo'
    );
  }

  return {
    owner: match[1],
    repo: match[2].replace(/\.git$/, ''),
  };
}

function shouldScanFile(path: string): boolean {
  const lower = path.toLowerCase();
  const filename = lower.split('/').pop() || '';

  if (TARGET_FILENAMES.includes(filename)) return true;
  return TARGET_EXTENSIONS.some((ext) => lower.endsWith(ext));
}

async function githubFetch(url: string) {
  const headers: HeadersInit = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };

  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  const res = await fetch(url, {
    headers,
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`GitHub API error ${res.status}: ${await res.text()}`);
  }

  return res.json();
}

async function getDefaultBranch(owner: string, repo: string): Promise<string> {
  const data = await githubFetch(`https://api.github.com/repos/${owner}/${repo}`);
  return data.default_branch || 'main';
}

async function listTree(owner: string, repo: string, branch: string) {
  const data = await githubFetch(
    `https://api.github.com/repos/${owner}/${repo}/git/trees/${encodeURIComponent(
      branch
    )}?recursive=1`
  );

  if (!data.tree || !Array.isArray(data.tree)) {
    throw new Error('Could not read repository tree.');
  }

  return data.tree as Array<{
    path: string;
    type: string;
    size?: number;
    url: string;
  }>;
}

async function fetchFile(
  owner: string,
  repo: string,
  path: string,
  branch: string
): Promise<RepoFile | null> {
  const safePath = path.split('/').map(encodeURIComponent).join('/');

  const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${encodeURIComponent(
    branch
  )}/${safePath}`;

  const res = await fetch(rawUrl, { cache: 'no-store' });

  if (!res.ok) return null;

  const content = await res.text();

  return {
    path,
    content,
  };
}

function lineNumberForMatch(content: string, index: number): number {
  return content.slice(0, index).split('\n').length;
}

function createFinding(
  rule: {
    id: string;
    title: string;
    severity: CopilotSeverity;
    category: CopilotFinding['category'];
    regex: RegExp;
    explanation: string;
    recommendation: string;
  },
  file: RepoFile,
  match: RegExpMatchArray
): CopilotFinding {
  return {
    id: `${rule.id}:${file.path}`,
    title: rule.title,
    severity: rule.severity,
    category: rule.category,
    file: file.path,
    line: typeof match.index === 'number' ? lineNumberForMatch(file.content, match.index) : undefined,
    evidence: match[0].slice(0, 180),
    explanation: rule.explanation,
    recommendation: rule.recommendation,
  };
}

function scanFile(file: RepoFile): CopilotFinding[] {
  const findings: CopilotFinding[] = [];

  for (const rule of RISK_RULES) {
    const match = file.content.match(rule.regex);

    if (match) {
      findings.push(createFinding(rule, file, match));
    }
  }

  for (const rule of PQC_RULES) {
    const match = file.content.match(rule.regex);

    if (match) {
      findings.push(createFinding(rule, file, match));
    }
  }

  return findings;
}

function calculateRiskScore(findings: CopilotFinding[]) {
  let score = 100;

  for (const finding of findings) {
    if (finding.severity === 'Critical') score -= 25;
    else if (finding.severity === 'High') score -= 15;
    else if (finding.severity === 'Medium') score -= 8;
    else if (finding.severity === 'Low') score -= 4;
  }

  score = Math.max(0, score);

  let riskLevel: CopilotResult['riskLevel'] = 'Low';

  if (score < 35) riskLevel = 'Critical';
  else if (score < 60) riskLevel = 'High';
  else if (score < 80) riskLevel = 'Medium';

  return { score, riskLevel };
}

function calculatePqcMaturity(findings: CopilotFinding[]) {
  let pqcMaturityScore = 0;

  for (const finding of findings) {
    const rule = PQC_RULES.find((item) => finding.id.startsWith(item.id));
    if (rule) {
      pqcMaturityScore += rule.maturityPoints;
    }
  }

  pqcMaturityScore = Math.min(100, pqcMaturityScore);

  let pqcMaturityLevel: CopilotResult['pqcMaturityLevel'] = 'None';

  if (pqcMaturityScore >= 75) pqcMaturityLevel = 'Advanced';
  else if (pqcMaturityScore >= 40) pqcMaturityLevel = 'Partial';
  else if (pqcMaturityScore > 0) pqcMaturityLevel = 'Early';

  return {
    pqcMaturityScore,
    pqcMaturityLevel,
  };
}

export async function runCopilotScan(repoUrl: string): Promise<CopilotResult> {
  const { owner, repo } = parseGitHubUrl(repoUrl);

  const branch = await getDefaultBranch(owner, repo);

  const tree = await listTree(owner, repo, branch);

  const candidates = tree
    .filter((item) => item.type === 'blob')
    .filter((item) => shouldScanFile(item.path))
    .filter((item) => !item.size || item.size <= MAX_FILE_SIZE)
    .slice(0, MAX_FILES);

  const files: RepoFile[] = [];

  for (const item of candidates) {
    const file = await fetchFile(owner, repo, item.path, branch);
    if (file) files.push(file);
  }

  const findings = files.flatMap(scanFile);
  const riskFindings = findings.filter((finding) => finding.severity !== 'Positive');
  const pqcFindings = findings.filter((finding) => finding.severity === 'Positive');

  if (pqcFindings.length === 0) {
    findings.push({
      id: 'pqc-migration-marker:repo',
      title: 'No PQC migration signals found in scanned files',
      severity: 'Info',
      category: 'PQC Migration',
      file: 'repository',
      evidence: 'No PQC libraries, algorithms, TLS groups, or roadmap markers found',
      explanation:
        'The scanner did not find explicit post-quantum migration signals such as ML-KEM, ML-DSA, SLH-DSA, X25519MLKEM768, liboqs, oqs-provider, OpenSSL 3.5, or Cloudflare CIRCL.',
      recommendation:
        'Create a crypto inventory and migration plan covering RSA, ECC, TLS, certificates, JWT signing, dependency updates, and PQC library evaluation.',
    });
  }

  const riskScored = calculateRiskScore(findings);
  const maturity = calculatePqcMaturity(findings);
  const finalPqcFindings = findings.filter((finding) => finding.severity === 'Positive');
  const finalRiskFindings = findings.filter(
    (finding) => finding.severity !== 'Positive' && finding.severity !== 'Info'
  );

  return {
    repoUrl,
    owner,
    repo,
    branch,
    scannedAt: new Date().toISOString(),
    filesScanned: files.length,
    findings,
    score: riskScored.score,
    riskLevel: riskScored.riskLevel,
    pqcMaturityScore: maturity.pqcMaturityScore,
    pqcMaturityLevel: maturity.pqcMaturityLevel,
    pqcSignalsFound: finalPqcFindings.length,
    riskyCryptoFindings: finalRiskFindings.length,
    summary:
      findings.length === 0
        ? 'No risky crypto patterns were found in the scanned files.'
        : `${finalRiskFindings.length} risky crypto finding${
            finalRiskFindings.length === 1 ? '' : 's'
          } and ${finalPqcFindings.length} PQC migration signal${
            finalPqcFindings.length === 1 ? '' : 's'
          } found across ${files.length} scanned files.`,
  };
}
