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
            Scan codebases for quantum-vulnerable crypto.
          </h1>

          <p className="mt-7 max-w-3xl text-lg leading-8 text-zinc-400">
            Upload or scan repositories for RSA, ECDSA, ECDH, hardcoded keys,
            weak TLS settings, weak JWT signing, old OpenSSL references, and
            missing PQC migration markers.
          </p>
        </div>
      </section>

      <CopilotClient />
    </main>
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
