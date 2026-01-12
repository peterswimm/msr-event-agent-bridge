import { Router, Request, Response, NextFunction } from 'express';
import { knowledgeAPI } from '../services/knowledge-api-client.js';
import { createError } from '../middleware/error-handler.js';

export const projectsRouter = Router();

/**
 * GET /v1/projects/:projectId
 * Get single project
 */
projectsRouter.get('/:projectId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await knowledgeAPI.get(`/v1/projects/${req.params.projectId}`, req);
    res.json(data);
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /v1/projects/:projectId
 * Update project
 */
projectsRouter.patch('/:projectId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await knowledgeAPI.patch(`/v1/projects/${req.params.projectId}`, req);
    res.json(data);
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /v1/projects/:projectId
 * Delete project
 */
projectsRouter.delete('/:projectId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.auth && !req.auth.user.roles.includes('admin')) {
      return next(createError('Insufficient permissions', 403, 'FORBIDDEN'));
    }

    const data = await knowledgeAPI.delete(`/v1/projects/${req.params.projectId}`, req);
    res.json(data);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /v1/projects/:projectId/knowledge
 * Get knowledge artifacts for a project
 */
projectsRouter.get('/:projectId/knowledge', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await knowledgeAPI.get(`/v1/projects/${req.params.projectId}/knowledge`, req);
    res.json(data);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /v1/projects/:projectId/compile
 * Compile project summary from knowledge artifacts
 */
projectsRouter.post('/:projectId/compile', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await knowledgeAPI.post(`/v1/projects/${req.params.projectId}/compile`, req);
    res.json(data);
  } catch (error) {
    next(error);
  }
});
