import { getIO } from './index';
import { TaskStatus } from '../generated/prisma/enums';

export interface ActivityEventPayload {
  id: string;
  taskId: string;
  taskTitle: string;
  projectId: string;
  changedByName: string;
  fromStatus: TaskStatus | null;
  toStatus: TaskStatus;
  createdAt: Date;
}

export function emitActivityEvent(
  payload: ActivityEventPayload,
  recipientUserIds: string[]
) {
  const io = getIO();

  // 1. Everyone currently viewing this specific project's dashboard
  io.to(`project:${payload.projectId}`).emit('activity:new', payload);

  // 2. Admin's global feed always receives every event, regardless of project
  io.to('admin:global').emit('activity:new', payload);

  // 3. Specific individuals who need this even if not viewing the project right now
  //    (e.g., the Developer this task is assigned to, so their personal feed updates)
  for (const userId of recipientUserIds) {
    io.to(`user:${userId}`).emit('activity:new', payload);
  }
}

export function emitNotificationCountUpdate(userId: string, unreadCount: number) {
  const io = getIO();
  io.to(`user:${userId}`).emit('notification:count', { unreadCount });
}