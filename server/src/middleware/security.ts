import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { config } from '../config.js';

// Security Headers with Helmet
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'"],
    },
  },
  crossOriginEmbedderPolicy: false,
});

// Rate limiting middleware for analysis endpoint
export const analyzeRateLimiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.rateLimitMaxRequests,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many analysis requests. Please try again later to protect against abuse.',
  },
});

// Global API rate limiter
export const globalRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many requests. Please slow down.',
  },
});

// Safe logging middleware that redacts full submitted message content to protect privacy
export function safeLogger(req: Request, _res: Response, next: NextFunction): void {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.originalUrl || req.url;

  if (url === '/api/analyze' && method === 'POST') {
    const len = typeof req.body?.content === 'string' ? req.body.content.length : 0;
    console.log(`[${timestamp}] ${method} ${url} - Content length: ${len} chars (Text content redacted for privacy)`);
  } else {
    console.log(`[${timestamp}] ${method} ${url}`);
  }
  next();
}
