import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import pino from 'pino';
import type { AuthContext } from '../types/models.js';

const logger = pino();

declare global {
  namespace Express {
    interface Request {
      auth?: AuthContext;
      correlationId?: string;
    }
  }
}

/**
 * Authentication middleware
 * Validates JWT tokens and extracts user context
 */
export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  // Generate correlation ID for request tracing
  req.correlationId = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

  // Skip auth for health checks
  if (req.path === '/health' || req.path === '/ready') {
    return next();
  }

  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    logger.warn({ correlationId: req.correlationId, path: req.path }, 'Missing authorization header');
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Missing or invalid authorization header'
    });
  }

  const token = authHeader.slice(7);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret-key', {
      issuer: process.env.JWT_ISSUER || 'https://eventhub.internal.microsoft.com',
      audience: process.env.JWT_AUDIENCE || 'event-hub-apps'
    }) as any;

    req.auth = {
      user: {
        id: decoded.sub || decoded.oid || decoded.user_id,
        email: decoded.email || decoded.preferred_username,
        displayName: decoded.name || decoded.displayName,
        roles: decoded.roles || decoded.appRoles || []
      },
      token,
      scopes: decoded.scopes || decoded.scp?.split(' ') || [],
      expiresAt: decoded.exp ? decoded.exp * 1000 : 0
    };

    logger.info(
      {
        correlationId: req.correlationId,
        userId: req.auth.user.id,
        path: req.path,
        method: req.method
      },
      'Auth successful'
    );

    next();
  } catch (error) {
    logger.error(
      {
        correlationId: req.correlationId,
        error: error instanceof Error ? error.message : String(error),
        path: req.path
      },
      'Token validation failed'
    );

    res.status(401).json({
      error: 'Invalid Token',
      message: 'Token validation failed'
    });
  }
}

/**
 * Role-based access control
 */
export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.auth) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userRoles = req.auth.user.roles || [];
    const hasRole = roles.some(role => userRoles.includes(role));

    if (!hasRole) {
      logger.warn(
        {
          correlationId: req.correlationId,
          userId: req.auth.user.id,
          requiredRoles: roles,
          userRoles
        },
        'Insufficient permissions'
      );

      return res.status(403).json({
        error: 'Forbidden',
        message: `Required roles: ${roles.join(', ')}`
      });
    }

    next();
  };
}

/**
 * Scope validation
 */
export function requireScope(...scopes: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.auth) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userScopes = req.auth.scopes || [];
    const hasScopes = scopes.every(scope => userScopes.includes(scope));

    if (!hasScopes) {
      return res.status(403).json({
        error: 'Forbidden',
        message: `Required scopes: ${scopes.join(', ')}`
      });
    }

    next();
  };
}
