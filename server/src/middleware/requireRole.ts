import { Request, Response, NextFunction } from 'express';
import { Role } from '../generated/prisma/enums';
import { AppError } from '../utils/appError';

export function requireRole(...allowedRoles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError(401, 'Not authenticated'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new AppError(403, 'Insufficient permissions for this action'));
    }

    next();
  };
}