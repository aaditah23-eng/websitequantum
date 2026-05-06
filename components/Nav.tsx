import Link from 'next/link';
import Icon from './Icon';

export default function Nav() {
  return (
    <nav className="relative z-10 mx-auto flex max-w-7xl items-center justify-between rounded-3xl border border-white/10 bg-white/[0.035] px-5 py-4 backdrop-blur-xl">
      <Link href="/" className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-emerald-400/30 bg-emerald-400/10 text-emerald-300">
          <Icon name="shield" size={21} />
        </div>
        <div>
          <div className="font-semibold tracking-tight">QuantumShield</div>
          <div className="text-xs text-zinc-500">Post-Quantum Security Platform</div>
        </div>
      </Link>

      <div className="hidden items-center gap-2 md:flex">
        <Link
          href="/"
          className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-zinc-300 hover:bg-white/10 hover:text-white"
        >
          Website Scanner
        </Link>

        <Link
          href="/copilot"
          className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-zinc-300 hover:bg-white/10 hover:text-white"
        >
          Developer Copilot
        </Link>

        <Link
          href="/vpn"
          className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-zinc-300 hover:bg-white/10 hover:text-white"
        >
          PQC VPN Proxy
        </Link>
      </div>

      <Link
        href="/copilot"
        className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm text-emerald-300 hover:bg-emerald-400/20"
      >
        Platform Demo
      </Link>
    </nav>
  );
}
