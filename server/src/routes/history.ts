import { Router, Request, Response, NextFunction } from 'express';
import { deleteAnalysis, getAnalysisById, getHistory } from '../db/database.js';

export const historyRouter = Router();

// GET /api/history - Retrieve list of past analyses
historyRouter.get('/', (_req: Request, res: Response, next: NextFunction): void => {
  try {
    const items = getHistory(50);
    res.status(200).json({
      count: items.length,
      history: items,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/history/:id - Retrieve full report for a specific past analysis
historyRouter.get('/:id', (req: Request, res: Response, next: NextFunction): void => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const report = getAnalysisById(id);

    if (!report) {
      res.status(404).json({
        error: 'Not found',
        message: `No analysis report found for ID ${id}.`,
      });
      return;
    }

    res.status(200).json(report);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/history/:id - Remove an individual report from history
historyRouter.delete('/:id', (req: Request, res: Response, next: NextFunction): void => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const existing = getAnalysisById(id);

    if (!existing) {
      res.status(404).json({
        error: 'Not found',
        message: `No analysis report found for ID ${id}.`,
      });
      return;
    }

    const success = deleteAnalysis(id);
    res.status(200).json({
      success,
      message: `Analysis ${id} successfully removed from history.`,
    });
  } catch (err) {
    next(err);
  }
});
