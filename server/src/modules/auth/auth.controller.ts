import { Request, Response, NextFunction } from 'express';
import { login, refreshAccessToken, logout } from './auth.service';
import { AppError } from '../../utils/appError';
import prisma from '../../config/db';

const REFRESH_COOKIE_NAME = 'refreshToken';
const REFRESH_COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; 

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production', 
  sameSite: 'lax' as const,
  maxAge: REFRESH_COOKIE_MAX_AGE_MS,
  path: '/api/auth', 
};

export async function loginHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new AppError(400, 'Email and password are required');
    }

    const { accessToken, refreshToken, user } = await login(email, password);

    res.cookie(REFRESH_COOKIE_NAME, refreshToken, cookieOptions);
    res.status(200).json({ accessToken, user });
  } catch (err) {
    next(err);
  }
}

export async function refreshHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const rawRefreshToken = req.cookies[REFRESH_COOKIE_NAME];

    if (!rawRefreshToken) {
      throw new AppError(401, 'No refresh token provided');
    }

    const { accessToken, refreshToken } = await refreshAccessToken(rawRefreshToken);

    res.cookie(REFRESH_COOKIE_NAME, refreshToken, cookieOptions);
    res.status(200).json({ accessToken });
  } catch (err) {
    next(err);
  }
}

export async function logoutHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const rawRefreshToken = req.cookies[REFRESH_COOKIE_NAME];

    if (rawRefreshToken) {
      await logout(rawRefreshToken);
    }

    res.clearCookie(REFRESH_COOKIE_NAME, { path: '/api/auth' });
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
}

export async function meHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: { id: true, name: true, email: true, role: true },
    });
    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
}