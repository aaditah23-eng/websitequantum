import CopilotClient from '@/components/CopilotClient';
import Nav from '@/components/Nav';

export default function CopilotPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#050505] text-white">
      <Background />

      <section className="relative px-5 py-8 md:px-8 md:py-10">
        <Nav />

        <div className="mx-auto max-w-7xl py-16">
          <div className="mb-6 inline-flex rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm text-emerald-300">
            Developer PQC Migration Copilot
          </div>

          <h1 className="max-w-4xl text-5xl font-semibold leading-[0.95] tracking-tight md:text-7xl">
            Find quantum-vulnerable cryptography inside codebases.
          </h1>

          <p className="mt-7 max-w-3xl text-lg leading-8 text-zinc-400">
            The Developer Copilot scans repositories for classical cryptography
            that may require post-quantum migration, while also detecting early
            PQC adoption signals such as ML-KEM, ML-DSA, SLH-DSA, liboqs,
            oqs-provider, OpenSSL 3.5, and hybrid TLS groups.
          </p>
        </div>
      </section>

      <CopilotClient />

      <section className="relative mx-auto max-w-7xl px-5 pb-24 md:px-8">
        <div className="grid gap-5 lg:grid-cols-3">
          <InfoCard
            title="Why code scanning matters"
            text="Most organizations do not know where RSA, ECDSA, ECDH, weak JWT signing, old TLS configurations, or hardcoded keys exist across their repositories."
          />
          <InfoCard
            title="What PQC maturity means"
            text="PQC maturity does not mean a repo is quantum-safe. It means the repo contains signs of migration planning, PQC libraries, PQC algorithms, or hybrid TLS configuration."
          />
          <InfoCard
            title="Repo-to-runtime gap"
            text="A repo may mention PQC, but the production endpoint may not negotiate PQC. Pair this page with the Website Scanner for live endpoint verification."
          />
        </div>
      </section>
    </main>
  );
}

function InfoCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-6 backdrop-blur-xl">
      <h3 className="text-xl font-semibold">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-zinc-400">{text}</p>
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
