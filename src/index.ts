import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import pinoHttp from 'pino-http';
import pino from 'pino';
import dotenv from 'dotenv';

import { authMiddleware } from './middleware/auth.js';
import { errorHandler } from './middleware/error-handler.js';
import { initializeTelemetry, telemetryMiddleware } from './middleware/telemetry.js';
import { eventsRouter } from './routes/events.js';
import { projectsRouter } from './routes/projects.js';
import { knowledgeRouter } from './routes/knowledge.js';
import { healthRouter } from './routes/health.js';
import { chatRouter } from './routes/chat.js';

dotenv.config();

// Initialize 1DS telemetry
initializeTelemetry({
  instrumentationKey: process.env.APPINSIGHTS_INSTRUMENTATION_KEY || '',
  enableAutoCollection: true,
  samplingPercentage: parseInt(process.env.TELEMETRY_SAMPLING || '100', 10)
});

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

// Telemetry middleware (before routes)
app.use(telemetryMiddleware);

// Rate limiting (JWT-aware per-user limits, IP-based fallback)
const getRateLimitKey = (req: Request) => {
  const userId = (req as any).user?.sub || req.ip || 'unknown';
  return userId;
};

const apiLimiter = rateLimit({
  keyGenerator: getRateLimitKey,
  windowMs: 60 * 1000, // 1 minute
  max: (req) => {
    // 100 req/min for authenticated users, 10 for anonymous
    return (req as any).user ? 100 : 10;
  },
  message: 'Too many requests. Rate limit exceeded.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip health checks and telemetry
    return req.path === '/health' || req.path === '/metrics';
  }
});

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

// Apply rate limiting to API routes
app.use('/v1/', apiLimiter);
app.use('/chat', apiLimiter);

// API routes
app.use('/chat', chatRouter);
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
