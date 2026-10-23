import { v4 as uuidv4 } from 'uuid';
import {
  AnalysisReport,
  DeterministicResult,
  RiskLevel,
  WarningSign,
} from '../types/index.js';
import { GeminiEngineResponse } from './gemini.js';
import { determineRiskLevel } from './deterministic.js';

const BASE_SAFE_STEPS: string[] = [
  'Do not click on unverified links, shortened URLs, or download unsolicited attachments.',
  'Never provide passwords, OTPs, PINs, or sensitive banking details over chat, email, or SMS.',
  'Verify claims independently by navigating directly to the official organization website or calling an established official customer care number.',
  'If pressured to move to Telegram or WhatsApp for job offers or transactions, immediately cease communication.',
];

const STANDARD_LIMITATIONS: string[] = [
  'TrustLens AI provides risk assessments and threat heuristics; it does NOT provide absolute legal or factual guarantees.',
  'Novel evasion techniques, obfuscated homoglyphs, or zero-day phishing vectors might not be recognized.',
  'Legitimate urgent notices (e.g., actual account alerts) can occasionally mimic scam patterns; always verify through independent official channels.',
  'Users are advised to exercise critical human judgment before making financial transfers or sharing personal data.',
];

export function combineAnalysisResults(
  submittedText: string,
  deterministic: DeterministicResult,
  geminiResp: GeminiEngineResponse
): AnalysisReport {
  const id = uuidv4();
  const timestamp = new Date().toISOString();
  const submittedSnippet =
    submittedText.length > 150
      ? `${submittedText.slice(0, 147)}...`
      : submittedText;

  // Case 1: Gemini AI is available
  if (geminiResp.available && geminiResp.result) {
    const ai = geminiResp.result;
    const detScore = deterministic.score;
    const aiScore = ai.aiRiskScore;

    // Weighted blend: 45% deterministic + 55% AI
    // If either detects a Critical threat (>=80), ensure overall reflects a critical safety floor
    let blendedScore = Math.round(detScore * 0.45 + aiScore * 0.55);
    if (detScore >= 80 || aiScore >= 80) {
      blendedScore = Math.max(blendedScore, Math.max(detScore, aiScore) - 5);
    }
    const overallScore = Math.min(100, Math.max(0, blendedScore));
    const overallRiskLevel: RiskLevel = determineRiskLevel(overallScore);

    // Agreement Note
    let agreementNote = '';
    const diff = Math.abs(detScore - aiScore);
    if (diff <= 15) {
      agreementNote = `High Engine Consensus: Both the deterministic pattern rules (${detScore}/100) and Google Gemini AI (${aiScore}/100) reached concordant risk assessments.`;
    } else if (detScore > aiScore) {
      agreementNote = `Divergence Explained: The deterministic rules flagged strong explicit trigger keywords/patterns (${detScore}/100), whereas Gemini AI (${aiScore}/100) factored in holistic semantic context and conversational intent.`;
    } else {
      agreementNote = `Divergence Explained: Gemini AI detected subtle social engineering manipulation and psychological coercion (${aiScore}/100) that bypassed rigid keyword rule thresholds (${detScore}/100).`;
    }

    // Merge warning signs
    const combinedWarningSigns: WarningSign[] = [...deterministic.warningSigns];
    for (const pattern of ai.detectedPatterns) {
      const alreadyIncluded = combinedWarningSigns.some(
        (w) => w.title.toLowerCase().includes(pattern.title.toLowerCase()) ||
               pattern.title.toLowerCase().includes(w.title.toLowerCase())
      );
      if (!alreadyIncluded) {
        combinedWarningSigns.push({
          id: `ai_${pattern.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
          category: 'AI Cognitive Analysis',
          title: pattern.title,
          severity: pattern.severity,
          score: pattern.severity === 'critical' ? 35 : pattern.severity === 'high' ? 25 : 15,
          reason: pattern.explanation,
          evidence: pattern.evidenceSnippet ? [pattern.evidenceSnippet] : [],
        });
      }
    }

    // Next steps
    const nextSteps = Array.from(
      new Set([...(ai.recommendedActions || []), ...BASE_SAFE_STEPS])
    ).slice(0, 5);

    const limitations = [
      ai.limitations || 'AI risk assessment reflects probabilistic modeling.',
      ...STANDARD_LIMITATIONS,
    ];

    return {
      id,
      timestamp,
      submittedSnippet,
      fullSubmittedText: submittedText,
      overallScore,
      overallRiskLevel,
      analysisMode: 'hybrid',
      deterministic,
      gemini: {
        available: true,
        provider: geminiResp.provider,
        model: geminiResp.model,
        result: ai,
        note: geminiResp.note,
      },
      agreementNote,
      combinedWarningSigns,
      recommendedNextSteps: nextSteps,
      limitationsAndCaveats: limitations,
      disclaimer:
        'TrustLens AI provides advisory risk evaluations based on pattern detection and machine learning. It does not provide absolute certification of safety or fraudulence.',
    };
  }

  // Case 2: Gemini is unavailable -> Local Rules-Only Analysis
  const overallScore = deterministic.score;
  const overallRiskLevel = deterministic.riskLevel;

  const nextSteps = [...BASE_SAFE_STEPS];
  if (deterministic.warningSigns.some((w) => w.id === 'credential_harvesting')) {
    nextSteps.unshift('CRITICAL: Never reveal your OTP, PIN, or password to anyone, even if they claim to represent technical support.');
  }
  if (deterministic.warningSigns.some((w) => w.id === 'advance_fee')) {
    nextSteps.unshift('CAUTION: Stop and do not transfer funds. Genuine employers, grant bodies, and sweepstakes never charge advance release fees.');
  }

  return {
    id,
    timestamp,
    submittedSnippet,
    fullSubmittedText: submittedText,
    overallScore,
    overallRiskLevel,
    analysisMode: 'deterministic-only',
    deterministic,
    gemini: {
      available: false,
      provider: null,
      model: null,
      note: geminiResp.note || 'Operating in Local rules-only analysis mode.',
    },
    agreementNote:
      'Local rules-only analysis: Analysis generated strictly using TrustLens deterministic heuristic engine because the AI provider was not reachable or configured.',
    combinedWarningSigns: deterministic.warningSigns,
    recommendedNextSteps: nextSteps.slice(0, 5),
    limitationsAndCaveats: [
      'Gemini AI analysis was not active for this request; subtle context or conversational subtleties may not be analyzed.',
      ...STANDARD_LIMITATIONS,
    ],
    disclaimer:
      'TrustLens AI provides advisory risk evaluations based on deterministic pattern matching. It does not guarantee absolute safety or fraudulence.',
  };
}
