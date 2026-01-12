import { Router, Request, Response, NextFunction } from 'express';
import { knowledgeAPI } from '../services/knowledge-api-client.js';
import { createError } from '../middleware/error-handler.js';
import pino from 'pino';

const logger = pino();
export const eventsRouter = Router();

/**
 * GET /v1/events
 * List all events
 */
eventsRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await knowledgeAPI.get('/v1/events', req);
    res.json(data);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /v1/events/:eventId
 * Get single event
 */
eventsRouter.get('/:eventId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await knowledgeAPI.get(`/v1/events/${req.params.eventId}`, req);
    res.json(data);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /v1/events
 * Create event (requires admin role)
 */
eventsRouter.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Optional: Add role check if needed
    if (req.auth && !req.auth.user.roles.includes('admin')) {
      return next(createError('Insufficient permissions', 403, 'FORBIDDEN'));
    }

    const data = await knowledgeAPI.post('/v1/events', req);
    res.status(201).json(data);
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /v1/events/:eventId
 * Update event
 */
eventsRouter.patch('/:eventId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.auth && !req.auth.user.roles.includes('admin')) {
      return next(createError('Insufficient permissions', 403, 'FORBIDDEN'));
    }

    const data = await knowledgeAPI.patch(`/v1/events/${req.params.eventId}`, req);
    res.json(data);
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /v1/events/:eventId
 * Delete event
 */
eventsRouter.delete('/:eventId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.auth && !req.auth.user.roles.includes('admin')) {
      return next(createError('Insufficient permissions', 403, 'FORBIDDEN'));
    }

    const data = await knowledgeAPI.delete(`/v1/events/${req.params.eventId}`, req);
    res.json(data);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /v1/events/:eventId/sessions
 * List sessions for an event
 */
eventsRouter.get('/:eventId/sessions', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await knowledgeAPI.get(`/v1/events/${req.params.eventId}/sessions`, req);
    res.json(data);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /v1/events/:eventId/sessions
 * Create session
 */
eventsRouter.post('/:eventId/sessions', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await knowledgeAPI.post(`/v1/events/${req.params.eventId}/sessions`, req);
    res.status(201).json(data);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /v1/events/:eventId/projects
 * List projects for an event
 */
eventsRouter.get('/:eventId/projects', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await knowledgeAPI.get(
      `/v1/events/${req.params.eventId}/projects${req.url.includes('?') ? req.url.split('?')[1] : ''}`,
      req
    );
    res.json(data);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /v1/events/:eventId/projects
 * Create project
 */
eventsRouter.post('/:eventId/projects', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await knowledgeAPI.post(`/v1/events/${req.params.eventId}/projects`, req);
    res.status(201).json(data);
  } catch (error) {
    next(error);
  }
});
