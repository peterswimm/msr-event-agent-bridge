import { Request, Response, NextFunction } from 'express';
import pino from 'pino';

const logger = pino();

export interface ApiError extends Error {
  statusCode?: number;
  code?: string;
}

/**
 * Global error handler
 */
export function errorHandler(
  error: ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  const statusCode = error.statusCode || 500;
  const errorCode = error.code || 'INTERNAL_ERROR';

  logger.error(
    {
      correlationId: req.correlationId,
      statusCode,
      errorCode,
      path: req.path,
      method: req.method,
      error: error.message,
      stack: error.stack
    },
    'Request error'
  );

  res.status(statusCode).json({
    error: {
      code: errorCode,
      message: error.message,
      correlationId: req.correlationId,
      timestamp: new Date().toISOString()
    }
  });
}

/**
 * Creates an API error
 */
export function createError(
  message: string,
  statusCode: number = 500,
  code: string = 'ERROR'
): ApiError {
  const error = new Error(message) as ApiError;
  error.statusCode = statusCode;
  error.code = code;
  return error;
}
