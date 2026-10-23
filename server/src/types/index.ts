import { z } from 'zod';

export type RiskLevel = 'Low' | 'Moderate' | 'High' | 'Critical';
export type Severity = 'low' | 'medium' | 'high' | 'critical';

// Input validation schema
export const AnalyzeRequestSchema = z.object({
  content: z
    .string({
      required_error: 'Content is required for analysis.',
    })
    .trim()
    .min(5, { message: 'Content must be at least 5 characters long.' })
    .max(10000, { message: 'Content exceeds the maximum allowed length of 10,000 characters.' }),
});

export type AnalyzeRequest = z.infer<typeof AnalyzeRequestSchema>;

// Warning sign detected by deterministic rules
export interface WarningSign {
  id: string;
  category: string;
  title: string;
  severity: Severity;
  score: number;
  reason: string;
  evidence: string[];
}

// Deterministic Analysis Layer Result
export interface DeterministicResult {
  score: number;
  riskLevel: RiskLevel;
  warningSigns: WarningSign[];
  totalIndicatorsDetected: number;
  summary: string;
  methodology: string;
}

// Gemini AI Output Schema (Structured Output validation)
export const GeminiOutputSchema = z.object({
  aiRiskScore: z.number().min(0).max(100),
  aiRiskLevel: z.enum(['Low', 'Moderate', 'High', 'Critical']),
  confidence: z.enum(['Low', 'Medium', 'High']),
  summary: z.string(),
  detectedPatterns: z.array(
    z.object({
      title: z.string(),
      explanation: z.string(),
      evidenceSnippet: z.string(),
      severity: z.enum(['low', 'medium', 'high', 'critical']),
    })
  ),
  discrepanciesOrNuance: z.string(),
  recommendedActions: z.array(z.string()),
  limitations: z.string(),
});

export type GeminiAnalysisResult = z.infer<typeof GeminiOutputSchema>;

// Combined Analysis Report
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

// History Item for listing
export interface HistoryItemSummary {
  id: string;
  timestamp: string;
  snippet: string;
  overallScore: number;
  overallRiskLevel: RiskLevel;
  analysisMode: 'hybrid' | 'deterministic-only';
  warningCount: number;
}
