import type { PqcLevel3Result } from './pqc-level3';

export type CheckStatus = 'pass' | 'warning' | 'fail' | 'info';

export type ScanCheck = {
  name: string;
  status: CheckStatus;
  description: string;
  pointsAwarded: number;
  maxPoints: number;
};

export type ScanResult = {
  id?: string;
  saved?: boolean;

  domain: string;
  scannedAt: string;

  httpsAvailable: boolean;
  tlsProtocol: string | null;
  cipher: string | null;

  certificateValid: boolean;
  certificateIssuer: string | null;
  certificateSubject: unknown;
  validFrom: string | null;
  validTo: string | null;
  daysUntilExpiry: number | null;

  headers: {
    hsts: boolean;
    csp: boolean;
    xFrameOptions: boolean;
    xContentTypeOptions: boolean;
    referrerPolicy: boolean;
  };

  dns: {
    hasMX: boolean;
    hasSPF: boolean;
    hasDMARC: boolean;
    mxRecords: unknown[];
  };

  // Old simple PQC signal
  pqcDetected: boolean;

  // New real Level 3 PQC integration
  pqc?: PqcLevel3Result;

  score: number;
  riskLevel: 'Low' | 'Medium' | 'High';

  quantumRiskScore: number;
  quantumRiskLevel: 'Low' | 'Medium' | 'High';

  checks: ScanCheck[];
  recommendations: string[];

  roadmap: {
    days30: string[];
    days60: string[];
    days90: string[];
  };
};
