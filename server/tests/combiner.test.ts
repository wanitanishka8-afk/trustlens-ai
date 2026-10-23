import { describe, it, expect } from 'vitest';
import { combineAnalysisResults } from '../src/engine/combiner.js';
import { DeterministicResult } from '../src/types/index.js';
import { GeminiEngineResponse } from '../src/engine/gemini.js';

describe('Analysis Combiner Engine', () => {
  const dummyDeterministic: DeterministicResult = {
    score: 80,
    riskLevel: 'Critical',
    warningSigns: [
      {
        id: 'credential_harvesting',
        category: 'Credential Harvesting',
        title: 'Request for Sensitive Credentials',
        severity: 'critical',
        score: 40,
        reason: 'Demands OTP',
        evidence: ['enter your OTP'],
      },
    ],
    totalIndicatorsDetected: 1,
    summary: 'Detected credential harvesting',
    methodology: 'Heuristic testing',
  };

  it('produces hybrid report when Gemini is available', () => {
    const dummyGeminiResp: GeminiEngineResponse = {
      available: true,
      provider: 'Google Gemini',
      model: 'gemini-3.8-flash',
      result: {
        aiRiskScore: 85,
        aiRiskLevel: 'Critical',
        confidence: 'High',
        summary: 'Targeted spear-phishing attempt.',
        detectedPatterns: [
          {
            title: 'Sense of Urgency',
            explanation: 'Forces quick action',
            evidenceSnippet: 'within 2 hours',
            severity: 'high',
          },
        ],
        discrepanciesOrNuance: 'Clear social engineering intent.',
        recommendedActions: ['Never share OTP'],
        limitations: 'Static text evaluation only.',
      },
    };

    const report = combineAnalysisResults('Suspicious message', dummyDeterministic, dummyGeminiResp);

    expect(report.analysisMode).toBe('hybrid');
    expect(report.overallRiskLevel).toBe('Critical');
    expect(report.deterministic.score).toBe(80);
    expect(report.gemini.available).toBe(true);
    expect(report.gemini.result?.aiRiskScore).toBe(85);
    expect(report.agreementNote).toContain('High Engine Consensus');
    expect(report.combinedWarningSigns.length).toBe(2);
    expect(report.disclaimer).toContain('advisory risk evaluations');
  });

  it('produces transparent "deterministic-only" report when Gemini is unavailable', () => {
    const unavailableGemini: GeminiEngineResponse = {
      available: false,
      provider: null,
      model: null,
      note: 'Gemini API key is not configured. Running in local rules-only mode.',
    };

    const report = combineAnalysisResults('Suspicious message', dummyDeterministic, unavailableGemini);

    expect(report.analysisMode).toBe('deterministic-only');
    expect(report.gemini.available).toBe(false);
    expect(report.overallScore).toBe(80);
    expect(report.overallRiskLevel).toBe('Critical');
    expect(report.agreementNote).toContain('Local rules-only analysis');
    expect(report.limitationsAndCaveats.some((l) => l.includes('Gemini AI analysis was not active'))).toBe(true);
  });

  it('accurately notes divergence when deterministic score is significantly higher than AI', () => {
    const lowerGemini: GeminiEngineResponse = {
      available: true,
      provider: 'Google Gemini',
      model: 'gemini-3.8-flash',
      result: {
        aiRiskScore: 40,
        aiRiskLevel: 'Moderate',
        confidence: 'Medium',
        summary: 'Ambiguous context.',
        detectedPatterns: [],
        discrepanciesOrNuance: 'May be an internal simulation or test.',
        recommendedActions: [],
        limitations: 'None',
      },
    };

    const report = combineAnalysisResults('Message', dummyDeterministic, lowerGemini);
    expect(report.agreementNote).toContain('Divergence Explained');
    expect(report.agreementNote).toContain('explicit trigger keywords/patterns');
  });
});
