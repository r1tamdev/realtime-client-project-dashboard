
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import prisma from '../../config/db';
import { env } from '../../config/env';
import { AppError } from '../../utils/appError';
import { Role } from '../../generated/prisma/enums';

const ACCESS_TOKEN_TTL = '15m';
const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function signAccessToken(userId: string, role: Role) {
  return jwt.sign({ userId, role }, env.JWT_ACCESS_SECRET, {
    expiresIn: ACCESS_TOKEN_TTL,
  });
}

function hashToken(token: string) {
  // fast, deterministic hash — fine for opaque random tokens (unlike passwords, no need for bcrypt's slow salt)
  return crypto.createHash('sha256').update(token).digest('hex');
}

async function issueRefreshToken(userId: string) {
  const rawToken = crypto.randomBytes(64).toString('hex');
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_MS);

  await prisma.refreshToken.create({
    data: { userId, tokenHash, expiresAt },
  });

  return rawToken; // this raw value is what goes in the cookie; only the hash is stored
}

export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    throw new AppError(401, 'Invalid email or password');
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatches) {
    throw new AppError(401, 'Invalid email or password');
  }

  const accessToken = signAccessToken(user.id, user.role);
  const refreshToken = await issueRefreshToken(user.id);

  return {
    accessToken,
    refreshToken,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  };
}

export async function refreshAccessToken(rawRefreshToken: string) {
  const tokenHash = hashToken(rawRefreshToken);

  const storedToken = await prisma.refreshToken.findFirst({
    where: { tokenHash, revoked: false },
    include: { user: true },
  });

  if (!storedToken || storedToken.expiresAt < new Date()) {
    throw new AppError(401, 'Refresh token invalid or expired');
  }

  // rotate: revoke the used token, issue a new one
  await prisma.refreshToken.update({
    where: { id: storedToken.id },
    data: { revoked: true },
  });

  const newRefreshToken = await issueRefreshToken(storedToken.userId);
  const newAccessToken = signAccessToken(storedToken.userId, storedToken.user.role);

  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
}

export async function logout(rawRefreshToken: string) {
  const tokenHash = hashToken(rawRefreshToken);
  await prisma.refreshToken.updateMany({
    where: { tokenHash },
    data: { revoked: true },
  });
}