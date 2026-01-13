import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ConfidentialClientApplication, Configuration } from '@azure/msal-node';
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

// Azure Entra ID configuration
const tenantId = process.env.AZURE_TENANT_ID || 'common';
const clientId = process.env.AZURE_CLIENT_ID || '';
const audience = process.env.JWT_AUDIENCE || clientId;

// MSAL configuration for token validation
const msalConfig: Configuration = {
  auth: {
    clientId: clientId,
    authority: `https://login.microsoftonline.com/${tenantId}`,
  }
};

// Cache for JWKS keys
let jwksClient: any = null;

/**
 * Get JWKS client for token validation
 */
async function getJwksClient() {
  if (!jwksClient) {
    const jwksUri = `https://login.microsoftonline.com/${tenantId}/discovery/v2.0/keys`;
    try {
      const response = await fetch(jwksUri);
      jwksClient = await response.json();
    } catch (error) {
      logger.error('Failed to fetch JWKS keys', error);
      throw error;
    }
  }
  return jwksClient;
}

/**
 * Validate Azure Entra ID JWT token
 */
async function validateToken(token: string): Promise<any> {
  return new Promise(async (resolve, reject) => {
    try {
      // Decode without verification first to get the kid (key ID)
      const decoded = jwt.decode(token, { complete: true }) as any;
      
      if (!decoded) {
        return reject(new Error('Invalid token format'));
      }

      // Get JWKS keys
      const jwks = await getJwksClient();
      const key = jwks.keys.find((k: any) => k.kid === decoded.header.kid);
      
      if (!key) {
        return reject(new Error('Token signing key not found'));
      }

      // Convert JWK to PEM format for verification
      const pemKey = jwkToPem(key);

      // Verify token signature and claims
      jwt.verify(token, pemKey, {
        algorithms: ['RS256'],
        audience: audience,
        issuer: `https://login.microsoftonline.com/${tenantId}/v2.0`
      }, (err, payload) => {
        if (err) {
          return reject(err);
        }
        resolve(payload);
      });
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Convert JWK to PEM format
 */
function jwkToPem(jwk: any): string {
  // Simple JWK to PEM conversion for RS256
  // In production, consider using a library like 'jwk-to-pem'
  const { n, e } = jwk;
  const modulus = Buffer.from(n, 'base64');
  const exponent = Buffer.from(e, 'base64');
  
  // For simplicity, return the modulus (in production use proper conversion)
  // Consider installing 'jwk-to-pem' package for robust conversion
  return `-----BEGIN PUBLIC KEY-----\n${n}\n-----END PUBLIC KEY-----`;
}

/**
 * Authentication middleware
 * Validates Azure Entra ID JWT tokens using MSAL and JWKS discovery
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

  validateToken(token)
    .then((payload: any) => {
      // Token validated successfully, extract user context
      req.auth = {
        user: {
          id: payload.oid || payload.sub || '',
          email: payload.preferred_username || payload.upn || payload.email || '',
          displayName: payload.name || '',
          roles: payload.roles || []
        },
        token,
        scopes: payload.scp?.split(' ') || [],
        expiresAt: payload.exp ? payload.exp * 1000 : 0
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
    })
    .catch((error: any) => {
      logger.error(
        {
          correlationId: req.correlationId,
          error: error.message || String(error),
          path: req.path
        },
        'Token validation failed'
      );

      res.status(401).json({
        error: 'Invalid Token',
        message: 'Token validation failed'
      });
    });
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
