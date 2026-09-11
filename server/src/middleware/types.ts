import { Role } from '../generated/prisma/enums';

export interface AuthPayload {
  userId: string;
  role: Role;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}