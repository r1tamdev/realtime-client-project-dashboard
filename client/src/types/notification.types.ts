export interface Notification {
  id: string;
  userId: string;
  taskId: string | null;
  message: string;
  isRead: boolean;
  createdAt: string;
}