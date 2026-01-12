import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import pinoHttp from 'pino-http';
import pino from 'pino';
import dotenv from 'dotenv';

import { authMiddleware } from './middleware/auth.js';
import { errorHandler } from './middleware/error-handler.js';
import { eventsRouter } from './routes/events.js';
import { projectsRouter } from './routes/projects.js';
import { knowledgeRouter } from './routes/knowledge.js';
import { healthRouter } from './routes/health.js';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;
const nodeEnv = process.env.NODE_ENV || 'development';

// Logger setup
const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: nodeEnv === 'development' ? {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname'
    }
  } : undefined
});

// HTTP request logging
app.use(pinoHttp({ logger }));

// CORS configuration
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173').split(',');
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin.trim())) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'), false);
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Health check (before auth)
app.use('/health', healthRouter);
app.use('/ready', healthRouter);

// Authentication middleware
app.use(authMiddleware);

// API routes
app.use('/v1/events', eventsRouter);
app.use('/v1/projects', projectsRouter);
app.use('/v1/knowledge', knowledgeRouter);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    path: req.path,
    method: req.method
  });
});

// Error handling (must be last)
app.use(errorHandler);

// Start server
app.listen(port, () => {
  logger.info(`🌉 Event Hub Bridge listening on http://localhost:${port}`);
  logger.info(`📡 Backend API: ${process.env.KNOWLEDGE_API_URL || 'http://localhost:8000'}`);
  logger.info(`🔐 CORS origins: ${allowedOrigins.join(', ')}`);
  logger.info(`📝 Environment: ${nodeEnv}`);
});

export default app;
