import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AuthPayload } from './types';
import { AppError } from '../utils/appError';

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError(401, 'No access token provided'));
  }

  const token = authHeader.split(' ')[1];

  if(!token) {
    return next(new AppError(401, 'No access token provided'));
  }

 try {
  const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as unknown as AuthPayload;
  req.user = { userId: payload.userId, role: payload.role };
  next();
} catch (err) {
  return next(new AppError(401, 'Invalid or expired access token'));
}
} 