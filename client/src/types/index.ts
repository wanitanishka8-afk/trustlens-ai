export type RiskLevel = 'Low' | 'Moderate' | 'High' | 'Critical';
export type Severity = 'low' | 'medium' | 'high' | 'critical';

export interface WarningSign {
  id: string;
  category: string;
  title: string;
  severity: Severity;
  score: number;
  reason: string;
  evidence: string[];
}

export interface DeterministicResult {
  score: number;
  riskLevel: RiskLevel;
  warningSigns: WarningSign[];
  totalIndicatorsDetected: number;
  summary: string;
  methodology: string;
}

export interface GeminiAnalysisResult {
  aiRiskScore: number;
  aiRiskLevel: RiskLevel;
  confidence: 'Low' | 'Medium' | 'High';
  summary: string;
  detectedPatterns: Array<{
    title: string;
    explanation: string;
    evidenceSnippet: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
  }>;
  discrepanciesOrNuance: string;
  recommendedActions: string[];
  limitations: string;
}

export interface AnalysisReport {
  id: string;
  timestamp: string;
  submittedSnippet: string;
  fullSubmittedText: string;
  overallScore: number;
  overallRiskLevel: RiskLevel;
  analysisMode: 'hybrid' | 'deterministic-only';
  deterministic: DeterministicResult;
  gemini: {
    available: boolean;
    provider: string | null;
    model: string | null;
    result?: GeminiAnalysisResult;
    note?: string;
  };
  agreementNote: string;
  combinedWarningSigns: WarningSign[];
  recommendedNextSteps: string[];
  limitationsAndCaveats: string[];
  disclaimer: string;
}

export interface HistoryItemSummary {
  id: string;
  timestamp: string;
  snippet: string;
  overallScore: number;
  overallRiskLevel: RiskLevel;
  analysisMode: 'hybrid' | 'deterministic-only';
  warningCount: number;
}

export interface HealthStatus {
  status: string;
  service: string;
  version: string;
  timestamp: string;
  uptimeSeconds: number;
  geminiConfigured: boolean;
  geminiModel: string;
  databaseConnected: boolean;
}
