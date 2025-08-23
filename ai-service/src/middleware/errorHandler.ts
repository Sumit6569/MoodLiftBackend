import { Request, Response } from 'express';
import { ApiResponse } from '../types/index';

export interface CustomError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export const errorHandler = (
  error: CustomError,
  req: Request,
  res: Response<ApiResponse>
): void => {
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';

  // Log error details
  console.error(`Error ${statusCode}: ${message}`, {
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
  });

  // Don't expose error details in production
  const isDevelopment = process.env['NODE_ENV'] === 'development';

  res.status(statusCode).json({
    success: false,
    message: isDevelopment ? message : 'Something went wrong',
    error: isDevelopment ? (error.stack ?? '') : '',
  });
};

export const createError = (message: string, statusCode = 500): CustomError => {
  const error: CustomError = new Error(message);
  error.statusCode = statusCode;
  error.isOperational = true;
  return error;
};