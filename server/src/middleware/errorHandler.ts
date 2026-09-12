import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/appError';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: {
        message: err.message,
        statusCode: err.statusCode,
      },
    });
  }

  console.error('[errorHandler]', err);

  return res.status(500).json({
    error: {
      message: 'Internal server error',
      statusCode: 500,
    },
  });
}
