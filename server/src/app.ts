import express, { Express } from 'express';
import cors from 'cors';
import path from 'node:path';
import fs from 'node:fs';
import { securityHeaders, safeLogger, globalRateLimiter } from './middleware/security.js';
import { errorHandler } from './middleware/errorHandler.js';
import { healthRouter } from './routes/health.js';
import { analyzeRouter } from './routes/analyze.js';
import { historyRouter } from './routes/history.js';
import { initDatabase } from './db/database.js';

export function createApp(): Express {
  const app = express();

  // Initialize SQLite database
  initDatabase();

  // Basic security middleware
  app.use(securityHeaders);
  app.use(
    cors({
      origin: '*', // Allow frontend during dev and production
      methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  // Parsing JSON with safe size limits (100kb is plenty for messages)
  app.use(express.json({ limit: '100kb' }));

  // Safe logging that masks message content
  app.use(safeLogger);

  // Global rate limiter
  app.use('/api', globalRateLimiter);

  // API Routes
  app.use('/api/health', healthRouter);
  app.use('/api/analyze', analyzeRouter);
  app.use('/api/history', historyRouter);

  // Serve Client in Production (if client/dist exists)
  const clientDistPath = path.resolve(process.cwd(), '../client/dist');
  const localDistPath = path.resolve(process.cwd(), 'client/dist');
  const staticPath = fs.existsSync(clientDistPath)
    ? clientDistPath
    : fs.existsSync(localDistPath)
    ? localDistPath
    : null;

  if (staticPath) {
    app.use(express.static(staticPath));
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api')) {
        return next();
      }
      res.sendFile(path.join(staticPath, 'index.html'));
    });
  }

  // 404 for unhandled API routes
  app.use('/api/*', (_req, res) => {
    res.status(404).json({
      error: 'Not Found',
      message: 'The requested API endpoint does not exist.',
    });
  });

  // Centralized Error Handler
  app.use(errorHandler);

  return app;
}

export const app = createApp();
