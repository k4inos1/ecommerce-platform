import { Response } from 'express';
import logger from './logger';

/**
 * ─────────────────────────────────────────────────────────────
 * ERROR HANDLING UTILITIES
 * ─────────────────────────────────────────────────────────────
 */

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true
  ) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export const handleError = (err: Error | AppError, res: Response) => {
  if (err instanceof AppError) {
    logger.error(`[${err.statusCode}] ${err.message}`);
    return res.status(err.statusCode).json({
      message: err.message,
      status: err.statusCode,
    });
  }

  logger.error(`[500] Unhandled error: ${err.message || err}`);
  return res.status(500).json({
    message: 'Internal server error',
    status: 500,
  });
};

export const handleValidationError = (error: any, res: Response) => {
  if (error.errors && Array.isArray(error.errors)) {
    const formattedErrors = error.errors.map((e: any) => ({
      field: e.path?.join('.') || 'unknown',
      message: e.message,
    }));

    logger.warn(`Validation error: ${JSON.stringify(formattedErrors)}`);
    return res.status(400).json({
      message: 'Validation failed',
      errors: formattedErrors,
    });
  }

  logger.error(`Unexpected validation error: ${error.message}`);
  return res.status(400).json({
    message: 'Invalid input',
  });
};

/**
 * Safe async wrapper for Express handlers
 * Catches errors and passes them to error handler
 */
export const asyncHandler =
  (fn: (req: any, res: Response) => Promise<any>) =>
  (req: any, res: Response) => {
    Promise.resolve(fn(req, res)).catch((err) => handleError(err, res));
  };
