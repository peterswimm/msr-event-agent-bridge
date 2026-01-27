import { Router, Request, Response, NextFunction } from 'express';
import { projectsService, CreateProjectInput } from '../services/projects-service.js';
import { createError } from '../middleware/error-handler.js';
import { validateBody, validateQuery } from '../middleware/validation.js';
import { createProjectSchema, updateProjectSchema, projectListQuerySchema } from '../validation/schemas.js';

export const projectsRouter = Router();

/**
 * GET /v1/projects
 * List projects with optional event filter
 */
projectsRouter.get('/', validateQuery(projectListQuerySchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { limit = 20, offset = 0, eventId } = req.query as any;
    const { projects, total } = await projectsService.listProjects({
      eventId,
      limit: Number(limit) || 20,
      offset: Number(offset) || 0
    });

    res.json({
      success: true,
      data: projects,
      meta: { total, limit: Number(limit) || 20, offset: Number(offset) || 0, hasMore: (Number(offset) || 0) + (Number(limit) || 20) < total },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /v1/projects/:projectId
 * Get single project
 */
projectsRouter.get('/:projectId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const project = await projectsService.getProject(req.params.projectId);
    if (!project) {
      return next(createError('Project not found', 404, 'NOT_FOUND'));
    }

    res.json({
      success: true,
      data: project,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /v1/projects
 * Create project (admin/curator)
 */
projectsRouter.post('/', validateBody(createProjectSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.auth || !req.auth.user.roles.some(r => ['admin', 'curator'].includes(r))) {
      return next(createError('Insufficient permissions', 403, 'FORBIDDEN'));
    }

    const input: CreateProjectInput = req.body;
    const project = await projectsService.createProject(input);

    res.status(201).json({
      success: true,
      data: project,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /v1/projects/:projectId
 * Update project (admin/curator)
 */
projectsRouter.put('/:projectId', validateBody(updateProjectSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.auth || !req.auth.user.roles.some(r => ['admin', 'curator'].includes(r))) {
      return next(createError('Insufficient permissions', 403, 'FORBIDDEN'));
    }

    const updates: Partial<CreateProjectInput> = req.body;
    const project = await projectsService.updateProject(req.params.projectId, updates);

    res.json({
      success: true,
      data: project,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /v1/projects/:projectId
 * Delete project (admin only)
 */
projectsRouter.delete('/:projectId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.auth || !req.auth.user.roles.includes('admin')) {
      return next(createError('Insufficient permissions', 403, 'FORBIDDEN'));
    }

    const success = await projectsService.deleteProject(req.params.projectId);
    if (!success) {
      return next(createError('Project not found', 404, 'NOT_FOUND'));
    }

    res.json({
      success: true,
      data: { deleted: true },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});
