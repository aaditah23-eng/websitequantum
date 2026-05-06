import { NextRequest, NextResponse } from "next/server";
import { runDomainScan } from "@/lib/scan";
import { saveScan } from "@/lib/db";
import { checkRealPqcLevel3 } from "@/lib/pqc-level3";
import type { ScanCheck, ScanResult } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const result = await runDomainScan(body.domain || "");

    const pqc = await checkRealPqcLevel3(result.domain || body.domain || "");

    const pqcCheck: ScanCheck = {
      name: "Real PQC Level 3",
      status: pqc.pqcLevel3Supported ? "pass" : "warning",
      description: pqc.pqcLevel3Supported
        ? "The domain negotiated a TLS 1.3 hybrid post-quantum key exchange using X25519MLKEM768 / ML-KEM-768."
        : "Level 3 PQC was not observed on this public HTTPS endpoint using X25519MLKEM768 / ML-KEM-768.",
      pointsAwarded: pqc.pqcLevel3Supported ? 20 : 0,
      maxPoints: 20,
    };

    const finalScore = Math.min(
      100,
      Number(result.score || 0) + Number(pqc.pqcScoreBoost || 0)
    );

    let finalRiskLevel: "Low" | "Medium" | "High" = "High";

    if (finalScore >= 75) {
      finalRiskLevel = "Low";
    } else if (finalScore >= 50) {
      finalRiskLevel = "Medium";
    }

    const finalResult: ScanResult = {
      ...result,
      score: finalScore,
      riskLevel: finalRiskLevel,
      pqcDetected: pqc.pqcLevel3Supported,
      checks: [...(result.checks || []), pqcCheck],
      recommendations: [
        ...(result.recommendations || []),
        pqc.pqcLevel3Supported
          ? "Maintain PQC-enabled TLS support and continue monitoring vendor and endpoint coverage."
          : "Evaluate enabling Level 3 hybrid PQC TLS through your CDN, reverse proxy, or TLS provider.",
      ],
    };

    const id = await saveScan({
      ...finalResult,
      pqc,
    } as ScanResult);

    return NextResponse.json({
      ...finalResult,
      pqc,
      id: id || undefined,
      saved: Boolean(id),
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Scan failed. Please try again.",
      },
      { status: 400 }
    );
  }
}
