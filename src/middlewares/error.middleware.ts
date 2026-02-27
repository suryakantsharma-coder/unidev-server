import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { env } from '../config/env';
import { ApiErrorResponse } from '../types/chat.types';

interface AppError extends Error {
  statusCode?: number;
}

function getStatusCode(err: AppError): number {
  if (err.statusCode && err.statusCode >= 400 && err.statusCode < 600) {
    return err.statusCode;
  }
  if (err.name === 'ValidationError') return 400;
  if (err instanceof mongoose.Error.ValidationError) return 400;
  if (err instanceof mongoose.Error.CastError) return 400;
  if (err.name === 'MongoServerError') return 500;
  const status = (err as { status?: number }).status;
  if (typeof status === 'number' && status >= 400 && status < 600) return status;
  return 500;
}

function getMessage(err: AppError): string {
  if (env.isProduction && (err.statusCode ?? 500) >= 500) {
    return 'Internal server error';
  }
  return err.message || 'An unexpected error occurred';
}

export function errorMiddleware(
  err: AppError,
  _req: Request,
  res: Response<ApiErrorResponse>,
  _next: NextFunction
): void {
  const statusCode = getStatusCode(err);
  const message = getMessage(err);
  res.status(statusCode).json({ success: false, message });
}

export function notFoundMiddleware(
  _req: Request,
  res: Response<ApiErrorResponse>
): void {
  res.status(404).json({ success: false, message: 'Not found' });
}
