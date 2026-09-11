import { Server as SocketIOServer } from 'socket.io';
import { AuthenticatedSocket } from './index';

// userId -> count of active socket connections for that user
// (a count, not a boolean, because one user might have multiple tabs open)
const onlineUsers = new Map<string, number>();

export function registerPresenceHandlers(io: SocketIOServer, socket: AuthenticatedSocket) {
  const currentCount = onlineUsers.get(socket.userId) ?? 0;
  onlineUsers.set(socket.userId, currentCount + 1);

  if (currentCount === 0) {
    // This user just came online for the first time (not just a new tab)
    broadcastOnlineCount(io);
  }

  socket.on('disconnect', () => {
    const count = onlineUsers.get(socket.userId) ?? 1;

    if (count <= 1) {
      onlineUsers.delete(socket.userId);
      broadcastOnlineCount(io);
    } else {
      onlineUsers.set(socket.userId, count - 1);
    }
  });
}

function broadcastOnlineCount(io: SocketIOServer) {
  io.to('admin:global').emit('presence:count', { onlineCount: onlineUsers.size });
}

export function getOnlineCount(): number {
  return onlineUsers.size;
}