import { Router, Request, Response, NextFunction } from 'express';
import { AnalyzeRequestSchema } from '../types/index.js';
import { analyzeDeterministically } from '../engine/deterministic.js';
import { analyzeWithGemini } from '../engine/gemini.js';
import { combineAnalysisResults } from '../engine/combiner.js';
import { saveAnalysis } from '../db/database.js';
import { analyzeRateLimiter } from '../middleware/security.js';

export const analyzeRouter = Router();

analyzeRouter.post(
  '/',
  analyzeRateLimiter,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // 1. Validate request body with Zod
      const parseResult = AnalyzeRequestSchema.safeParse(req.body);
      if (!parseResult.success) {
        const errorDetails = parseResult.error.errors.map((e) => e.message).join(' ');
        res.status(400).json({
          error: 'Validation failed',
          message: errorDetails,
          issues: parseResult.error.errors,
        });
        return;
      }

      const { content } = parseResult.data;

      // 2. Layer 1: Deterministic Heuristic Engine
      const deterministicResult = analyzeDeterministically(content);

      // 3. Layer 2: Gemini AI Analysis (handles fallback internally if key missing or call fails)
      const geminiResult = await analyzeWithGemini(content);

      // 4. Combine Results into structured report
      const combinedReport = combineAnalysisResults(content, deterministicResult, geminiResult);

      // 5. Persist to History Database
      try {
        saveAnalysis(combinedReport);
      } catch (dbErr) {
        console.warn('Failed to persist analysis to database:', dbErr);
      }

      // 6. Return comprehensive analysis report
      res.status(200).json(combinedReport);
    } catch (err) {
      next(err);
    }
  }
);
