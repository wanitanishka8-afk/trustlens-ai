import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { clearDatabaseForTesting } from '../src/db/database.js';

describe('TrustLens AI Backend API Endpoints', () => {
  const app = createApp();

  beforeEach(() => {
    clearDatabaseForTesting();
  });

  describe('GET /api/health', () => {
    it('returns healthy status and service metadata', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('healthy');
      expect(res.body.service).toContain('TrustLens');
      expect(typeof res.body.geminiConfigured).toBe('boolean');
    });
  });

  describe('POST /api/analyze', () => {
    it('analyzes suspicious credential phishing message and returns structured report', async () => {
      const payload = {
        content:
          'URGENT: Your account has been suspended. Please confirm your password and enter your OTP to restore access.',
      };

      const res = await request(app).post('/api/analyze').send(payload);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('overallScore');
      expect(res.body).toHaveProperty('overallRiskLevel');
      expect(res.body).toHaveProperty('deterministic');
      expect(res.body).toHaveProperty('combinedWarningSigns');
      expect(res.body).toHaveProperty('recommendedNextSteps');
      expect(res.body.overallScore).toBeGreaterThanOrEqual(50);
    });

    it('rejects empty input with 400 Bad Request', async () => {
      const res = await request(app).post('/api/analyze').send({ content: '   ' });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Validation failed');
    });

    it('rejects input shorter than 5 characters with 400 Bad Request', async () => {
      const res = await request(app).post('/api/analyze').send({ content: 'Hi' });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Validation failed');
      expect(res.body.message).toContain('at least 5 characters');
    });

    it('rejects input longer than 10,000 characters with 400 Bad Request', async () => {
      const longText = 'A'.repeat(10001);
      const res = await request(app).post('/api/analyze').send({ content: longText });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Validation failed');
      expect(res.body.message).toContain('maximum allowed length');
    });

    it('safely handles untrusted text containing HTML/script tags without execution', async () => {
      const xssPayload = {
        content: '<script>alert("XSS payload attack")</script> Verify your OTP at http://evil.com/login',
      };

      const res = await request(app).post('/api/analyze').send(xssPayload);

      expect(res.status).toBe(200);
      // The text is stored and returned as pure string, not parsed HTML
      expect(res.body.fullSubmittedText).toContain('<script>alert("XSS payload attack")</script>');
      expect(res.body.overallScore).toBeGreaterThan(0);
    });

    it('rejects malformed non-JSON body with 400 Bad Request', async () => {
      const res = await request(app)
        .post('/api/analyze')
        .set('Content-Type', 'application/json')
        .send('{ malformed json body ');

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Bad Request');
    });
  });

  describe('History Endpoints (/api/history)', () => {
    it('saves completed analyses into history and allows retrieval', async () => {
      // 1. Analyze a message
      const analyzeRes = await request(app)
        .post('/api/analyze')
        .send({ content: 'Congratulations winner! You have won $10,000 prize. Pay upfront fee to claim.' });

      expect(analyzeRes.status).toBe(200);
      const generatedId = analyzeRes.body.id;

      // 2. Fetch history list
      const listRes = await request(app).get('/api/history');
      expect(listRes.status).toBe(200);
      expect(listRes.body.count).toBeGreaterThanOrEqual(1);
      expect(listRes.body.history.some((h: { id: string }) => h.id === generatedId)).toBe(true);

      // 3. Fetch single item
      const itemRes = await request(app).get(`/api/history/${generatedId}`);
      expect(itemRes.status).toBe(200);
      expect(itemRes.body.id).toBe(generatedId);
      expect(itemRes.body.overallRiskLevel).toBe(analyzeRes.body.overallRiskLevel);

      // 4. Delete item
      const deleteRes = await request(app).delete(`/api/history/${generatedId}`);
      expect(deleteRes.status).toBe(200);
      expect(deleteRes.body.success).toBe(true);

      // 5. Verify deleted item returns 404
      const afterDelete = await request(app).get(`/api/history/${generatedId}`);
      expect(afterDelete.status).toBe(404);
    });

    it('returns 404 when requesting a non-existent history record', async () => {
      const res = await request(app).get('/api/history/non-existent-uuid-xyz');
      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Not found');
    });

    it('returns 404 when deleting a non-existent history record', async () => {
      const res = await request(app).delete('/api/history/non-existent-uuid-xyz');
      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Not found');
    });
  });
});
