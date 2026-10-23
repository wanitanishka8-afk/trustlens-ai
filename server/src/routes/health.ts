import { Router, Request, Response } from 'express';
import { config } from '../config.js';
import { initDatabase } from '../db/database.js';

export const healthRouter = Router();

healthRouter.get('/', (_req: Request, res: Response) => {
  const db = initDatabase();
  const geminiConfigured = Boolean(
    config.geminiApiKey &&
    config.geminiApiKey.trim() !== '' &&
    config.geminiApiKey.trim() !== 'your_gemini_api_key_here'
  );

  res.status(200).json({
    status: 'healthy',
    service: 'TrustLens AI Analysis Engine',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    geminiConfigured,
    geminiModel: 'gemini-3.8-flash',
    databaseConnected: Boolean(db),
  });
});
