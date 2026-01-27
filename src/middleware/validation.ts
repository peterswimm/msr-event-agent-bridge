/**
 * Validation middleware using Zod schemas
 */

import { ZodSchema } from 'zod';
import { Request, Response, NextFunction } from 'express';

function formatZodError(error: any) {
  return error.errors?.map((err: any) => `${err.path.join('.')}: ${err.message}`).join('; ');
}

export function validateBody<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: formatZodError(result.error) || 'Invalid request body',
        timestamp: new Date().toISOString()
      });
    }
    req.body = result.data as any;
    next();
  };
}

export function validateQuery<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: formatZodError(result.error) || 'Invalid query parameters',
        timestamp: new Date().toISOString()
      });
    }
    req.query = result.data as any;
    next();
  };
}

export function validateParams<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.params);
    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: formatZodError(result.error) || 'Invalid route parameters',
        timestamp: new Date().toISOString()
      });
    }
    req.params = result.data as any;
    next();
  };
}
