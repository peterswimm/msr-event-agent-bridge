import { Router, Request, Response, NextFunction } from 'express';
import { knowledgeAPI } from '../services/knowledge-api-client.js';

export const knowledgeRouter = Router();

/**
 * POST /v1/knowledge/extract
 * Extract knowledge from a source (paper, talk, repo)
 */
knowledgeRouter.post('/extract', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await knowledgeAPI.post('/v1/knowledge/extract', req);
    res.status(202).json(data); // 202 Accepted for async operation
  } catch (error) {
    next(error);
  }
});

/**
 * GET /v1/knowledge/extract/:jobId
 * Check extraction job status
 */
knowledgeRouter.get('/extract/:jobId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await knowledgeAPI.get(`/v1/knowledge/extract/${req.params.jobId}`, req);
    res.json(data);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /v1/knowledge/search
 * Cross-event semantic search
 */
knowledgeRouter.post('/search', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await knowledgeAPI.post('/v1/knowledge/search', req);
    res.json(data);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /v1/knowledge/artifacts/:artifactId
 * Get knowledge artifact details
 */
knowledgeRouter.get('/artifacts/:artifactId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await knowledgeAPI.get(`/v1/knowledge/artifacts/${req.params.artifactId}`, req);
    res.json(data);
  } catch (error) {
    next(error);
  }
});
