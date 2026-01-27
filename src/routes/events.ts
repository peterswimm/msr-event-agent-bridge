/**
 * Events Router
 * Provides CRUD for events plus nested sessions and projects operations.
 */

import { Router, Request, Response, NextFunction } from 'express';
import pino from 'pino';
import { eventsService, CreateEventInput } from '../services/events-service.js';
import { sessionsService, CreateSessionInput } from '../services/sessions-service.js';
import { projectsService, CreateProjectInput } from '../services/projects-service.js';
import { createError } from '../middleware/error-handler.js';
import { validateBody, validateQuery } from '../middleware/validation.js';
import {
  createEventSchema,
  updateEventSchema,
  createSessionSchema,
  updateSessionSchema,
  createProjectSchema,
  projectListQuerySchema,
  eventListQuerySchema
} from '../validation/schemas.js';

const logger = pino();
export const eventsRouter = Router();

/**
 * GET /v1/events
 * List all events
 */
eventsRouter.get('/', validateQuery(eventListQuerySchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { limit = 20, offset = 0, status } = req.query as any;
    const limitNum = Number(limit) || 20;
    const offsetNum = Number(offset) || 0;

    const { events, total } = await eventsService.listEvents({ limit: limitNum, offset: offsetNum, status: status as any });

    res.json({
      success: true,
      data: events,
      meta: { total, limit: limitNum, offset: offsetNum, hasMore: offsetNum + limitNum < total },
      timestamp: new Date().toISOString()
    });
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
    const event = await eventsService.getEvent(req.params.eventId);
    if (!event) {
      return next(createError('Event not found', 404, 'NOT_FOUND'));
    }

    res.json({
      success: true,
      data: event,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /v1/events
 * Create event (requires admin/curator role)
 */
eventsRouter.post('/', validateBody(createEventSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.auth || !req.auth.user.roles.some(r => ['admin', 'curator'].includes(r))) {
      return next(createError('Insufficient permissions', 403, 'FORBIDDEN'));
    }

    const input: CreateEventInput = req.body;
    const event = await eventsService.createEvent(input);

    res.status(201).json({
      success: true,
      data: event,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /v1/events/:eventId
 * Update event
 */
eventsRouter.put('/:eventId', validateBody(updateEventSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.auth || !req.auth.user.roles.some(r => ['admin', 'curator'].includes(r))) {
      return next(createError('Insufficient permissions', 403, 'FORBIDDEN'));
    }

    const updates: Partial<CreateEventInput> = req.body;
    const event = await eventsService.updateEvent(req.params.eventId, updates);

    res.json({
      success: true,
      data: event,
      timestamp: new Date().toISOString()
    });
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
    if (!req.auth || !req.auth.user.roles.includes('admin')) {
      return next(createError('Insufficient permissions', 403, 'FORBIDDEN'));
    }

    const success = await eventsService.deleteEvent(req.params.eventId);
    if (!success) {
      return next(createError('Event not found', 404, 'NOT_FOUND'));
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

/**
 * GET /v1/events/:eventId/sessions
 * List sessions for an event
 */
eventsRouter.get('/:eventId/sessions', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const offset = parseInt(req.query.offset as string) || 0;
    const track = (req.query.track as string) || undefined;
    const sessionType = (req.query.sessionType as string) || undefined;

    const { sessions, total } = await eventsService.getEventSessions(req.params.eventId, { limit, offset, track, sessionType });

    res.json({
      success: true,
      data: sessions,
      meta: { total, limit, offset, hasMore: offset + limit < total },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /v1/events/:eventId/sessions/:sessionId
 * Get single session
 */
eventsRouter.get('/:eventId/sessions/:sessionId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const session = await sessionsService.getSession(req.params.eventId, req.params.sessionId);
    if (!session) {
      return next(createError('Session not found', 404, 'NOT_FOUND'));
    }

    res.json({
      success: true,
      data: session,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /v1/events/:eventId/sessions
 * Create session
 */
eventsRouter.post('/:eventId/sessions', validateBody(createSessionSchema.omit({ eventId: true })), async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.auth || !req.auth.user.roles.some(r => ['admin', 'curator'].includes(r))) {
      return next(createError('Insufficient permissions', 403, 'FORBIDDEN'));
    }

    const input: CreateSessionInput = { eventId: req.params.eventId, ...req.body };
    const session = await sessionsService.createSession(input);

    res.status(201).json({
      success: true,
      data: session,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /v1/events/:eventId/sessions/:sessionId
 * Update session
 */
eventsRouter.put('/:eventId/sessions/:sessionId', validateBody(updateSessionSchema.omit({ eventId: true })), async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.auth || !req.auth.user.roles.some(r => ['admin', 'curator'].includes(r))) {
      return next(createError('Insufficient permissions', 403, 'FORBIDDEN'));
    }

    const updates: Partial<CreateSessionInput> = req.body;
    const session = await sessionsService.updateSession(req.params.eventId, req.params.sessionId, updates);

    res.json({
      success: true,
      data: session,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /v1/events/:eventId/sessions/:sessionId
 * Delete session
 */
eventsRouter.delete('/:eventId/sessions/:sessionId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.auth || !req.auth.user.roles.includes('admin')) {
      return next(createError('Insufficient permissions', 403, 'FORBIDDEN'));
    }

    const success = await sessionsService.deleteSession(req.params.eventId, req.params.sessionId);
    if (!success) {
      return next(createError('Session not found', 404, 'NOT_FOUND'));
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

/**
 * POST /v1/events/:eventId/sessions/search
 * Search sessions (full-text)
 */
eventsRouter.post('/:eventId/sessions/search', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = (req.body?.query as string) || '';
    const limit = Math.min(parseInt(req.body?.limit as string) || 20, 100);
    const offset = parseInt(req.body?.offset as string) || 0;

    const { sessions, total } = await sessionsService.searchSessions(req.params.eventId, query, { limit, offset });

    res.json({
      success: true,
      data: sessions,
      meta: { total, limit, offset, hasMore: offset + limit < total },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /v1/events/:eventId/projects
 * List projects for an event
 */
eventsRouter.get('/:eventId/projects', validateQuery(projectListQuerySchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { limit = 20, offset = 0 } = req.query as any;
    const limitNum = Number(limit) || 20;
    const offsetNum = Number(offset) || 0;

    const { projects, total } = await projectsService.listProjects({ eventId: req.params.eventId, limit: limitNum, offset: offsetNum });

    res.json({
      success: true,
      data: projects,
      meta: { total, limit: limitNum, offset: offsetNum, hasMore: offsetNum + limitNum < total },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /v1/events/:eventId/projects
 * Create project
 */
eventsRouter.post('/:eventId/projects', validateBody(createProjectSchema.omit({ eventId: true })), async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.auth || !req.auth.user.roles.some(r => ['admin', 'curator'].includes(r))) {
      return next(createError('Insufficient permissions', 403, 'FORBIDDEN'));
    }

    const input: CreateProjectInput = { eventId: req.params.eventId, ...req.body };
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
