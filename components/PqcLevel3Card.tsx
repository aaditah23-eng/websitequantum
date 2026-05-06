type Props = {
  pqc?: {
    pqcLevel3Tested?: boolean;
    pqcLevel3Supported?: boolean;
    pqcStatus?: string;
    pqcRisk?: string;
    pqcGroupOffered?: string;
    negotiatedGroup?: string | null;
    pqcAlgorithm?: string;
    nistSecurityCategory?: number;
    opensslVersion?: string;
    evidenceSummary?: string;
  };
};

export function PqcLevel3Card({ pqc }: Props) {
  const supported = Boolean(pqc?.pqcLevel3Supported);
  const tested = Boolean(pqc?.pqcLevel3Tested);

  const border = supported ? "border-emerald-500/30" : tested ? "border-red-500/30" : "border-zinc-700";
  const badge = supported
    ? "bg-emerald-500/10 text-emerald-300"
    : tested
      ? "bg-red-500/10 text-red-300"
      : "bg-zinc-500/10 text-zinc-300";

  return (
    <div className={`rounded-3xl border ${border} bg-white/[0.03] p-6`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-zinc-500">Real PQC Level 3</p>
          <h3 className="mt-2 text-2xl font-semibold">
            {supported ? "Detected" : tested ? "Not Detected" : "Not Configured"}
          </h3>
        </div>
        <span className={`rounded-full px-3 py-1 text-sm ${badge}`}>
          {pqc?.pqcRisk || "Unknown"}
        </span>
      </div>

      <div className="mt-5 space-y-3 text-sm">
        <Info label="Offered group" value={pqc?.pqcGroupOffered || "X25519MLKEM768"} />
        <Info label="Algorithm" value={pqc?.pqcAlgorithm || "ML-KEM-768 hybrid with X25519"} />
        <Info label="NIST category" value={String(pqc?.nistSecurityCategory || 3)} />
        <Info label="Negotiated group" value={pqc?.negotiatedGroup || "Not observed"} />
      </div>

      <p className="mt-5 text-sm leading-6 text-zinc-400">
        {pqc?.evidenceSummary ||
          "QuantumShield attempts a TLS 1.3 handshake while offering X25519MLKEM768 as the Level 3 hybrid PQC group."}
      </p>

      {pqc?.opensslVersion ? (
        <p className="mt-4 rounded-2xl bg-black/40 px-4 py-3 font-mono text-xs text-zinc-500">
          {pqc.opensslVersion}
        </p>
      ) : null}
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-2 last:border-0">
      <span className="text-zinc-500">{label}</span>
      <span className="text-right text-zinc-200">{value}</span>
    </div>
  );
}
