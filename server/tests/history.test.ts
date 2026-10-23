import { describe, it, expect, beforeEach } from 'vitest';
import {
  clearDatabaseForTesting,
  deleteAnalysis,
  getAnalysisById,
  getHistory,
  saveAnalysis,
} from '../src/db/database.js';
import { AnalysisReport } from '../src/types/index.js';

describe('Analysis History Persistence', () => {
  beforeEach(() => {
    clearDatabaseForTesting();
  });

  const sampleReport: AnalysisReport = {
    id: 'test-uuid-1234',
    timestamp: new Date().toISOString(),
    submittedSnippet: 'Urgent: Verify your banking OTP immediately...',
    fullSubmittedText: 'Urgent: Verify your banking OTP immediately or account will be suspended.',
    overallScore: 88,
    overallRiskLevel: 'Critical',
    analysisMode: 'deterministic-only',
    deterministic: {
      score: 88,
      riskLevel: 'Critical',
      warningSigns: [],
      totalIndicatorsDetected: 2,
      summary: 'Severe urgency detected',
      methodology: 'Heuristic',
    },
    gemini: {
      available: false,
      provider: null,
      model: null,
    },
    agreementNote: 'Local rules-only analysis',
    combinedWarningSigns: [
      {
        id: 'urgency',
        category: 'Urgency',
        title: 'Artificial Urgency',
        severity: 'high',
        score: 30,
        reason: 'Immediate deadline',
        evidence: ['immediately'],
      },
    ],
    recommendedNextSteps: ['Never share OTP'],
    limitationsAndCaveats: ['Heuristic only'],
    disclaimer: 'Advisory only',
  };

  it('saves and retrieves an analysis report by ID', () => {
    saveAnalysis(sampleReport);

    const fetched = getAnalysisById('test-uuid-1234');
    expect(fetched).not.toBeNull();
    expect(fetched?.id).toBe('test-uuid-1234');
    expect(fetched?.overallScore).toBe(88);
    expect(fetched?.overallRiskLevel).toBe('Critical');
  });

  it('lists saved analyses in descending chronological order with truncated snippets', () => {
    const report1 = { ...sampleReport, id: 'id-1', timestamp: '2026-01-01T10:00:00Z' };
    const report2 = { ...sampleReport, id: 'id-2', timestamp: '2026-01-01T12:00:00Z' };

    saveAnalysis(report1);
    saveAnalysis(report2);

    const list = getHistory();
    expect(list.length).toBe(2);
    // id-2 is more recent, should be first
    expect(list[0].id).toBe('id-2');
    expect(list[1].id).toBe('id-1');
  });

  it('deletes an individual report by ID', () => {
    saveAnalysis(sampleReport);
    expect(getAnalysisById('test-uuid-1234')).not.toBeNull();

    const deleted = deleteAnalysis('test-uuid-1234');
    expect(deleted).toBe(true);
    expect(getAnalysisById('test-uuid-1234')).toBeNull();

    const list = getHistory();
    expect(list.length).toBe(0);
  });

  it('returns null when fetching non-existent report ID', () => {
    const nonExistent = getAnalysisById('non-existent-id-9999');
    expect(nonExistent).toBeNull();
  });
});
