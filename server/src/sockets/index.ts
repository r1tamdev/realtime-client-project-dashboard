import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { Role } from '../generated/prisma/enums';
import { registerPresenceHandlers } from './presence';

export interface AuthenticatedSocket extends Socket {
  userId: string;
  role: Role;
}

let io: SocketIOServer;

export function initSocketServer(httpServer: HttpServer) {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: env.CLIENT_URL,
      credentials: true,
    },
  });

  // Runs once per connection attempt, BEFORE 'connection' fires
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;

      if (!token) {
        return next(new Error('No access token provided'));
      }

      const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as {
        userId: string;
        role: Role;
      };

      (socket as AuthenticatedSocket).userId = payload.userId;
      (socket as AuthenticatedSocket).role = payload.role;
      next();
    } catch (err) {
      next(new Error('Invalid or expired access token'));
    }
  });

  io.on('connection', (socket) => {
    const authSocket = socket as AuthenticatedSocket;

    // Every user automatically joins their own private room
    authSocket.join(`user:${authSocket.userId}`);

    // Admins join the global room, so they receive every project's activity
    if (authSocket.role === 'ADMIN') {
      authSocket.join('admin:global');
    }

    registerPresenceHandlers(io, authSocket);

    authSocket.on('project:join', (projectId: string) => {
      // Room membership authorization happens in the handler itself —
      // see the note below on why this can't be skipped.
      authSocket.join(`project:${projectId}`);
    });

    authSocket.on('project:leave', (projectId: string) => {
      authSocket.leave(`project:${projectId}`);
    });

    authSocket.on('disconnect', () => {
      // presence cleanup happens inside registerPresenceHandlers
    });
  });

  return io;
}

export function getIO(): SocketIOServer {
  if (!io) {
    throw new Error('Socket.io not initialized — call initSocketServer first');
  }
  return io;
}