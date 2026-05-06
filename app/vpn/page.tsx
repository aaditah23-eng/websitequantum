import Nav from '@/components/Nav';

export default function VpnPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#050505] text-white">
      <Background />

      <section className="relative px-5 py-8 md:px-8 md:py-10">
        <Nav />

        <div className="mx-auto grid max-w-7xl items-center gap-12 py-16 lg:grid-cols-[0.95fr_1.05fr] lg:py-24">
          <div>
            <div className="mb-6 inline-flex rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm text-emerald-300">
              Quantum Safe VPN Proxy
            </div>

            <h1 className="text-5xl font-semibold leading-[0.95] tracking-tight md:text-7xl">
              A post-quantum tunnel for sensitive traffic.
            </h1>

            <p className="mt-7 max-w-2xl text-lg leading-8 text-zinc-400">
              A future module for routing sensitive enterprise traffic through
              a hybrid post-quantum secure proxy using ML-KEM-based key
              establishment and modern TLS controls.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <button className="rounded-full bg-emerald-400 px-5 py-3 text-sm font-semibold text-black hover:bg-emerald-300">
                Join VPN Beta
              </button>

              <button className="rounded-full border border-white/10 bg-white/[0.04] px-5 py-3 text-sm text-zinc-300 hover:bg-white/10">
                View Architecture
              </button>
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
                <div className="text-xs text-zinc-500">pqc-proxy.quantumshield.ai</div>
              </div>

              <div className="space-y-4 font-mono text-sm">
                <TerminalLine text="initializing secure tunnel..." good />
                <TerminalLine text="client key exchange: X25519 + ML-KEM-768" good />
                <TerminalLine text="tls policy: TLS 1.3 only" good />
                <TerminalLine text="classical fallback: disabled for sensitive routes" warning />
                <TerminalLine text="traffic route: enterprise proxy edge" good />
              </div>

              <div className="mt-8 grid gap-4 md:grid-cols-2">
                <Metric label="PQC Group" value="ML-KEM-768" />
                <Metric label="Security Category" value="Level 3" />
                <Metric label="Tunnel Mode" value="Hybrid" />
                <Metric label="Status" value="Concept Demo" />
              </div>

              <div className="mt-6 rounded-3xl border border-emerald-400/15 bg-emerald-400/[0.06] p-5">
                <div className="text-sm font-medium text-emerald-300">
                  MVP note
                </div>
                <p className="mt-2 text-sm leading-6 text-zinc-400">
                  This page is currently a product concept preview. The real
                  implementation should be built as a separate proxy service,
                  not directly inside Vercel.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
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

function TerminalLine({
  text,
  good,
  warning,
}: {
  text: string;
  good?: boolean;
  warning?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3">
      <span
        className={
          good
            ? 'h-2 w-2 rounded-full bg-emerald-400'
            : warning
              ? 'h-2 w-2 rounded-full bg-yellow-400'
              : 'h-2 w-2 rounded-full bg-zinc-500'
        }
      />
      <span className="text-zinc-400">$ {text}</span>
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
