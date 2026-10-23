import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { config } from '../config.js';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error('Unhandled server error:', err);

  // JSON parse error (e.g. body-parser SyntaxError)
  if (err instanceof SyntaxError && 'status' in err && (err as { status: number }).status === 400) {
    res.status(400).json({
      error: 'Bad Request',
      message: 'Malformed JSON payload received.',
    });
    return;
  }

  // Zod Validation error
  if (err instanceof ZodError) {
    res.status(400).json({
      error: 'Validation Error',
      message: err.errors.map((e) => e.message).join(' '),
      issues: err.errors,
    });
    return;
  }

  // Default internal server error
  res.status(500).json({
    error: 'Internal Server Error',
    message:
      config.nodeEnv === 'production'
        ? 'An unexpected error occurred while processing your request.'
        : err.message || 'An unexpected error occurred.',
  });
}
