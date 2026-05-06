export type PqcLevel3Result = {
  pqcLevel3Tested: boolean;
  pqcLevel3Supported: boolean;
  pqcGroupOffered?: string;
  negotiatedGroup?: string | null;
  pqcAlgorithm?: string;
  nistSecurityCategory?: number;
  pqcStatus: string;
  pqcRisk: "Low" | "High" | "Unknown";
  pqcScoreBoost: number;
  opensslVersion?: string;
  opensslSupportsX25519MLKEM768?: boolean;
  evidenceSummary?: string;
  pqcEvidence?: unknown;
};

export async function checkRealPqcLevel3(domain: string): Promise<PqcLevel3Result> {
  const baseUrl = process.env.PQC_SCANNER_URL;
  const apiKey = process.env.PQC_SCANNER_API_KEY;

  if (!baseUrl) {
    return {
      pqcLevel3Tested: false,
      pqcLevel3Supported: false,
      pqcStatus: "PQC scanner backend not configured",
      pqcRisk: "Unknown",
      pqcScoreBoost: 0,
      pqcEvidence: null,
    };
  }

  try {
    const res = await fetch(`${baseUrl.replace(/\/$/, "")}/scan-pqc`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(apiKey ? { "x-api-key": apiKey } : {}),
      },
      body: JSON.stringify({ domain }),
      cache: "no-store",
    });

    const data = await res.json();

    if (!res.ok) {
      return {
        pqcLevel3Tested: true,
        pqcLevel3Supported: false,
        pqcStatus: data.error || "PQC scan failed",
        pqcRisk: "Unknown",
        pqcScoreBoost: 0,
        pqcEvidence: data,
      };
    }

    return {
      pqcLevel3Tested: Boolean(data.pqcLevel3Tested),
      pqcLevel3Supported: Boolean(data.pqcLevel3Supported),
      pqcGroupOffered: data.pqcGroupOffered,
      negotiatedGroup: data.negotiatedGroup,
      pqcAlgorithm: data.pqcAlgorithm,
      nistSecurityCategory: data.nistSecurityCategory,
      pqcStatus: data.pqcStatus,
      pqcRisk: data.pqcRisk || "Unknown",
      pqcScoreBoost: Number(data.pqcScoreBoost || 0),
      opensslVersion: data.opensslVersion,
      opensslSupportsX25519MLKEM768: data.opensslSupportsX25519MLKEM768,
      evidenceSummary: data.evidenceSummary,
      pqcEvidence: data.rawEvidence,
    };
  } catch (error) {
    return {
      pqcLevel3Tested: true,
      pqcLevel3Supported: false,
      pqcStatus: "Unable to reach PQC scanner backend",
      pqcRisk: "Unknown",
      pqcScoreBoost: 0,
      pqcEvidence: error instanceof Error ? error.message : String(error),
    };
  }
}
