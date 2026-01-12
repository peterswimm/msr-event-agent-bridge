import { Router, Request, Response } from 'express';
import { knowledgeAPI } from '../services/knowledge-api-client.js';
import pino from 'pino';

const logger = pino();
export const healthRouter = Router();

/**
 * GET /health
 * Liveness probe - responds quickly
 */
healthRouter.get('/', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'event-hub-bridge',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

/**
 * GET /ready
 * Readiness probe - checks backend connectivity
 */
healthRouter.get('/', async (req: Request, res: Response) => {
  try {
    await knowledgeAPI.health();
    res.json({
      status: 'ready',
      service: 'event-hub-bridge',
      backend: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Readiness check failed', error);
    res.status(503).json({
      status: 'not_ready',
      service: 'event-hub-bridge',
      backend: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});
