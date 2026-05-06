'use client';

import { useState } from 'react';

type CopilotFinding = {
  id: string;
  title: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low' | 'Info' | 'Positive';
  category: string;
  file: string;
  line?: number;
  evidence: string;
  explanation: string;
  recommendation: string;
};

type CopilotResult = {
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

export default function CopilotClient() {
  const [repoUrl, setRepoUrl] = useState('https://github.com/open-quantum-safe/liboqs');
  const [result, setResult] = useState<CopilotResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function runScan(nextUrl = repoUrl) {
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch('/api/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoUrl: nextUrl }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Copilot scan failed.');
        return;
      }

      setRepoUrl(data.repoUrl);
      setResult(data);
    } catch {
      setError('Unable to connect to Developer Copilot API.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="relative mx-auto max-w-7xl px-5 pb-24 md:px-8">
      <div className="rounded-[2rem] border border-white/10 bg-white/[0.035] p-5 backdrop-blur-xl md:p-7">
        <div className="mb-8">
          <div className="inline-flex rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm text-emerald-300">
            Developer PQC Migration Copilot
          </div>

          <h2 className="mt-5 text-4xl font-semibold tracking-tight md:text-5xl">
            Scan GitHub repos for risky crypto and PQC maturity.
          </h2>

          <p className="mt-4 max-w-3xl text-zinc-400">
            Detect RSA, ECDSA, ECDH, hardcoded keys, weak TLS settings, weak JWT
            signing, old OpenSSL references, and real PQC migration signals such
            as ML-KEM, ML-DSA, SLH-DSA, liboqs, oqs-provider, OpenSSL 3.5,
            Cloudflare CIRCL, and X25519MLKEM768.
          </p>
        </div>

        <div className="rounded-3xl border border-emerald-400/20 bg-emerald-400/[0.06] p-4">
          <div className="flex flex-col gap-3 md:flex-row">
            <input
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && runScan()}
              placeholder="https://github.com/owner/repo"
              className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-black px-4 py-3 text-sm outline-none placeholder:text-zinc-600 focus:border-emerald-400/50"
            />

            <button
              onClick={() => runScan()}
              disabled={loading}
              className="rounded-2xl bg-emerald-400 px-5 py-3 text-sm font-semibold text-black transition hover:bg-emerald-300 disabled:opacity-60"
            >
              {loading ? 'Scanning repo...' : 'Run Developer Scan'}
            </button>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {[
              'https://github.com/open-quantum-safe/liboqs',
              'https://github.com/open-quantum-safe/oqs-provider',
              'https://github.com/cloudflare/circl',
              'https://github.com/vercel/next.js',
            ].map((url) => (
              <button
                key={url}
                onClick={() => runScan(url)}
                disabled={loading}
                className="rounded-full border border-white/10 bg-black/30 px-3 py-2 text-xs text-zinc-300 hover:border-emerald-400/40 hover:bg-emerald-400/10 hover:text-emerald-200 disabled:opacity-60"
              >
                {url.replace('https://github.com/', '')}
              </button>
            ))}
          </div>

          {error && (
            <div className="mt-3 rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          )}
        </div>

        {result && (
          <div className="mt-8">
            <div className="grid gap-4 md:grid-cols-4">
              <Metric label="Repo" value={`${result.owner}/${result.repo}`} />
              <Metric label="Files scanned" value={String(result.filesScanned)} />
              <Metric label="Risk score" value={`${result.score}/100`} />
              <Metric label="Risk" value={result.riskLevel} />
              <Metric label="PQC maturity" value={`${result.pqcMaturityScore}/100`} />
              <Metric label="Maturity level" value={result.pqcMaturityLevel} />
              <Metric label="PQC signals" value={String(result.pqcSignalsFound)} />
              <Metric label="Risky crypto" value={String(result.riskyCryptoFindings)} />
            </div>

            <div className="mt-6 rounded-3xl border border-white/10 bg-black/40 p-5">
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                <div>
                  <h3 className="text-xl font-semibold">Migration Summary</h3>
                  <p className="mt-3 text-sm leading-6 text-zinc-400">
                    {result.summary}
                  </p>
                  <p className="mt-2 text-xs text-zinc-500">
                    Branch scanned: {result.branch} · Scanned at:{' '}
                    {new Date(result.scannedAt).toLocaleString()}
                  </p>
                </div>

                <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200">
                  PQC maturity: {result.pqcMaturityLevel}
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                <h3 className="text-lg font-semibold">What this means</h3>
                <p className="mt-3 text-sm leading-6 text-zinc-400">
                  The risk score decreases when the scanner finds quantum-vulnerable
                  classical cryptography, weak TLS settings, hardcoded secrets, or
                  weak JWT patterns. The PQC maturity score increases when the repo
                  contains signals such as ML-KEM, ML-DSA, SLH-DSA, liboqs,
                  oqs-provider, OpenSSL 3.5, Cloudflare CIRCL, or hybrid TLS groups.
                </p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                <h3 className="text-lg font-semibold">Recommended next step</h3>
                <p className="mt-3 text-sm leading-6 text-zinc-400">
                  Use this as a migration discovery tool, not as proof that a repo is
                  quantum-safe. Review the findings, create a crypto inventory, and
                  validate production endpoints with the Website Scanner’s real Level
                  3 PQC handshake test.
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {result.findings.length === 0 ? (
                <div className="rounded-3xl border border-emerald-400/20 bg-emerald-400/10 p-5 text-emerald-200">
                  No risky crypto patterns found in the scanned files.
                </div>
              ) : (
                result.findings.map((finding) => (
                  <FindingCard key={finding.id} finding={finding} />
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <div className="text-xs text-zinc-500">{label}</div>
      <div className="mt-1 break-words text-xl font-semibold">{value}</div>
    </div>
  );
}

function FindingCard({ finding }: { finding: CopilotFinding }) {
  const severityClass =
    finding.severity === 'Positive'
      ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200'
      : finding.severity === 'Critical'
        ? 'border-red-400/30 bg-red-400/10 text-red-200'
        : finding.severity === 'High'
          ? 'border-orange-400/30 bg-orange-400/10 text-orange-200'
          : finding.severity === 'Medium'
            ? 'border-yellow-400/30 bg-yellow-400/10 text-yellow-200'
            : finding.severity === 'Low'
              ? 'border-blue-400/30 bg-blue-400/10 text-blue-200'
              : 'border-zinc-400/20 bg-zinc-400/10 text-zinc-200';

  const recommendationTitle =
    finding.severity === 'Positive'
      ? 'How to validate this PQC signal'
      : 'Recommended migration step';

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
        <div>
          <div className="text-lg font-semibold">{finding.title}</div>
          <div className="mt-1 text-sm text-zinc-500">
            {finding.file}
            {finding.line ? `:${finding.line}` : ''} · {finding.category}
          </div>
        </div>

        <div className={`rounded-full border px-3 py-1 text-xs ${severityClass}`}>
          {finding.severity}
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-white/10 bg-black/40 p-3 font-mono text-xs text-zinc-400">
        {finding.evidence}
      </div>

      <p className="mt-4 text-sm leading-6 text-zinc-400">
        {finding.explanation}
      </p>

      <div className="mt-4 rounded-2xl border border-emerald-400/15 bg-emerald-400/[0.06] p-4">
        <div className="text-sm font-medium text-emerald-300">
          {recommendationTitle}
        </div>
        <p className="mt-2 text-sm leading-6 text-zinc-300">
          {finding.recommendation}
        </p>
      </div>
    </div>
  );
}
