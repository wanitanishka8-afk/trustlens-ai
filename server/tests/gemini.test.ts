import { describe, it, expect } from 'vitest';
import { analyzeWithGemini } from '../src/engine/gemini.js';
import { GeminiOutputSchema } from '../src/types/index.js';

describe('Gemini AI Engine Layer', () => {
  it('gracefully handles missing or placeholder API key without crashing', async () => {
    // With empty key
    const resEmpty = await analyzeWithGemini('Test suspicious message', '');
    expect(resEmpty.available).toBe(false);
    expect(resEmpty.provider).toBeNull();
    expect(resEmpty.note).toContain('Gemini API key is not configured');

    // With placeholder key
    const resPlaceholder = await analyzeWithGemini('Test message', 'your_gemini_api_key_here');
    expect(resPlaceholder.available).toBe(false);
    expect(resPlaceholder.note).toContain('Local rules-only analysis');
  });

  it('validates structured AI output with Zod schema', () => {
    const validAiPayload = {
      aiRiskScore: 85,
      aiRiskLevel: 'Critical',
      confidence: 'High',
      summary: 'High probability of phishing targeting banking credentials.',
      detectedPatterns: [
        {
          title: 'Credential Demands',
          explanation: 'Message directly solicits sensitive passwords.',
          evidenceSnippet: 'send your password',
          severity: 'critical',
        },
      ],
      discrepanciesOrNuance: 'No legitimate brand requests credentials via SMS.',
      recommendedActions: ['Block sender', 'Do not click links'],
      limitations: 'Context cannot verify if sender phone number was spoofed.',
    };

    const parsed = GeminiOutputSchema.safeParse(validAiPayload);
    expect(parsed.success).toBe(true);
  });

  it('rejects malformed AI output schemas with missing required fields', () => {
    const invalidAiPayload = {
      aiRiskScore: 'Not a number', // invalid type
      confidence: 'Unknown',
    };

    const parsed = GeminiOutputSchema.safeParse(invalidAiPayload);
    expect(parsed.success).toBe(false);
  });
});
