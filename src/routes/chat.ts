import { Router, Request, Response, NextFunction } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import pino from 'pino';

const logger = pino();
const router = Router();

const BACKEND_URL = process.env.KNOWLEDGE_API_URL || 'http://localhost:8000';

/**
 * Chat proxy route
 * Proxies /chat requests to the Python backend with authentication context
 */
router.use(
  '/',
  createProxyMiddleware({
    target: BACKEND_URL,
    changeOrigin: true,
    pathRewrite: {
      '^/chat': '/api/chat' // Rewrite /chat to /api/chat for backend
    },
    onProxyReq: (proxyReq, req: Request) => {
      // Forward correlation ID and auth token to backend
      if (req.correlationId) {
        proxyReq.setHeader('X-Correlation-ID', req.correlationId);
      }
      
      if (req.auth) {
        // Forward user context as headers for backend logging/analytics
        proxyReq.setHeader('X-User-ID', req.auth.user.id);
        proxyReq.setHeader('X-User-Email', req.auth.user.email);
        
        if (req.auth.user.roles?.length) {
          proxyReq.setHeader('X-User-Roles', req.auth.user.roles.join(','));
        }
      }

      logger.debug(
        {
          correlationId: req.correlationId,
          path: req.path,
          method: req.method,
          target: `${BACKEND_URL}${req.path}`
        },
        'Proxying chat request to backend'
      );
    },
    onProxyRes: (proxyRes, req: Request) => {
      logger.debug(
        {
          correlationId: req.correlationId,
          statusCode: proxyRes.statusCode,
          path: req.path
        },
        'Chat proxy response received'
      );
    },
    onError: (err, req: Request, res: Response) => {
      logger.error(
        {
          correlationId: req.correlationId,
          error: err.message,
          path: req.path
        },
        'Chat proxy error'
      );

      res.status(502).json({
        error: 'Bad Gateway',
        message: 'Failed to connect to chat backend',
        correlationId: req.correlationId
      });
    },
    // Preserve streaming responses (important for SSE)
    selfHandleResponse: false,
    logLevel: process.env.LOG_LEVEL === 'debug' ? 'debug' : 'warn'
  })
);

export { router as chatRouter };
