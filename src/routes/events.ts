import { Router, Request, Response, NextFunction } from 'express';
import { eventsService, CreateEventInput } from '../services/events-service.js';
import { sessionsService, CreateSessionInput } from '../services/sessions-service.js';
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
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const offset = parseInt(req.query.offset as string) || 0;
    const status = (req.query.status as string) || undefined;

    const { events, total } = await eventsService.listEvents({ limit, offset, status: status as any });

    res.json({
      success: true,
      data: events,
      meta: { total, limit, offset, hasMore: offset + limit < total },
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
eventsRouter.post('/', async (req: Request, res: Response, next: NextFunction) => {
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
eventsRouter.put('/:eventId', async (req: Request, res: Response, next: NextFunction) => {
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

    const { sessions, total } = await eventsService.getEventSessions(req.params.eventId, { 
      limit, 
      offset, 
      track, 
      sessionType 
    });

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
 * POST /v1/events/:eventId/sessions
 * Create session
 */
eventsRouter.post('/:eventId/sessions', async (req: Request, res: Response, next: NextFunction) => {
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
