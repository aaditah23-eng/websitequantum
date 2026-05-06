import Link from 'next/link';
import Nav from '@/components/Nav';

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#050505] text-white">
      <Background />

      <section className="relative px-5 py-8 md:px-8 md:py-10">
        <Nav />

        <div className="mx-auto grid max-w-7xl items-center gap-12 py-16 lg:grid-cols-[0.95fr_1.05fr] lg:py-24">
          <div>
            <div className="mb-6 inline-flex rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm text-emerald-300">
              Post-Quantum Security Readiness Platform
            </div>

            <h1 className="text-5xl font-semibold leading-[0.95] tracking-tight md:text-7xl">
              Prepare your company for the post-quantum security transition.
            </h1>

            <p className="mt-7 max-w-3xl text-lg leading-8 text-zinc-400">
              QuantumShield helps organizations discover quantum-vulnerable
              cryptography, verify Level 3 PQC readiness, scan codebases for
              migration risks, and plan a practical path toward crypto-agility.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/scanner"
                className="rounded-full bg-emerald-400 px-6 py-3 text-sm font-semibold text-black hover:bg-emerald-300"
              >
                Run Website Scanner
              </Link>

              <Link
                href="/copilot"
                className="rounded-full border border-white/10 bg-white/[0.04] px-6 py-3 text-sm text-zinc-300 hover:bg-white/10"
              >
                Open Developer Copilot
              </Link>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-emerald-950/30 backdrop-blur-xl">
            <div className="rounded-[1.5rem] border border-white/10 bg-black/70 p-5">
              <div className="mb-5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-red-400" />
                  <span className="h-3 w-3 rounded-full bg-yellow-400" />
                  <span className="h-3 w-3 rounded-full bg-green-400" />
                </div>
                <div className="text-xs text-zinc-500">quantumshield.ai/platform</div>
              </div>

              <div className="space-y-4">
                <HeroTerminalLine title="Website Scanner" text="Runs real Level 3 PQC TLS handshake checks using X25519MLKEM768 / ML-KEM-768." />
                <HeroTerminalLine title="Developer Copilot" text="Scans repositories for RSA, ECDSA, ECDH, weak TLS, hardcoded keys, and PQC migration signals." />
                <HeroTerminalLine title="PQC VPN Proxy" text="Concept module for future hybrid post-quantum secure traffic routing." />
              </div>

              <div className="mt-8 grid gap-4 md:grid-cols-3">
                <Metric label="PQC Level" value="3" />
                <Metric label="Scanner Type" value="TLS + Code" />
                <Metric label="Use Case" value="B2B" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative mx-auto max-w-7xl px-5 pb-24 md:px-8">
        <div className="grid gap-5 lg:grid-cols-3">
          <PlatformCard
            title="Website Scanner"
            href="/scanner"
            badge="Real PQC Test"
            text="Test whether a public website or API endpoint negotiates Level 3 hybrid PQC TLS using X25519MLKEM768 / ML-KEM-768."
            points={[
              'TLS and certificate posture',
              'Security headers and DNS checks',
              'Real Level 3 PQC handshake verification',
              'Executive migration roadmap',
            ]}
          />

          <PlatformCard
            title="Developer Copilot"
            href="/copilot"
            badge="Codebase Scanner"
            text="Scan GitHub repositories for risky classical cryptography and early post-quantum migration signals."
            points={[
              'RSA, ECDSA, ECDH detection',
              'Hardcoded keys and weak JWT patterns',
              'liboqs, oqs-provider, ML-KEM detection',
              'PQC maturity score',
            ]}
          />

          <PlatformCard
            title="Quantum Safe VPN Proxy"
            href="/vpn"
            badge="Concept Module"
            text="Preview a future enterprise proxy that routes sensitive traffic through a hybrid post-quantum secure tunnel."
            points={[
              'Hybrid tunnel concept',
              'ML-KEM-768 key establishment',
              'TLS 1.3-only policy',
              'Enterprise secure route architecture',
            ]}
          />
        </div>
      </section>
    </main>
  );
}

function PlatformCard({
  title,
  href,
  badge,
  text,
  points,
}: {
  title: string;
  href: string;
  badge: string;
  text: string;
  points: string[];
}) {
  return (
    <Link
      href={href}
      className="rounded-[2rem] border border-white/10 bg-white/[0.035] p-6 backdrop-blur-xl transition hover:border-emerald-400/30 hover:bg-white/[0.055]"
    >
      <div className="mb-5 inline-flex rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-300">
        {badge}
      </div>

      <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>

      <p className="mt-4 text-sm leading-6 text-zinc-400">{text}</p>

      <div className="mt-6 space-y-3">
        {points.map((point) => (
          <div key={point} className="flex gap-3 text-sm text-zinc-300">
            <span className="mt-1 h-2 w-2 rounded-full bg-emerald-400" />
            <span>{point}</span>
          </div>
        ))}
      </div>
    </Link>
  );
}

function HeroTerminalLine({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <div className="text-sm font-medium text-emerald-300">$ {title}</div>
      <div className="mt-2 text-sm leading-6 text-zinc-400">{text}</div>
    </div>
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

function Background() {
  return (
    <div className="fixed inset-0 pointer-events-none">
      <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-emerald-500/20 blur-3xl" />
      <div className="absolute top-32 right-0 h-96 w-96 rounded-full bg-green-400/10 blur-3xl" />
      <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-lime-400/10 blur-3xl" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:72px_72px] [mask-image:radial-gradient(circle_at_center,black,transparent_75%)]" />
    </div>
  );
}
