import type { TaskStatus } from './task.types';

export interface ActivityEvent {
  id: string;
  taskId: string;
  taskTitle: string;
  projectId: string;
  changedByName: string;
  fromStatus: TaskStatus | null;
  toStatus: TaskStatus;
  createdAt: string;
}