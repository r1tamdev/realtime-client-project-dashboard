import { Request, Response, NextFunction } from 'express';
import * as notificationService from './notification.service';
import { emitNotificationCountUpdate } from '../../sockets/activityEvents';
import { getRequiredParam } from '../../utils/getRequiredParam';

export async function getNotificationsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const notifications = await notificationService.getNotificationsForUser(req.user!.userId);
    const unreadCount = await notificationService.getUnreadCount(req.user!.userId);
    res.status(200).json({ notifications, unreadCount });
  } catch (err) {
    next(err);
  }
}

export async function markAsReadHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const notificationId = getRequiredParam(req.params, 'id');

    await notificationService.markAsRead(notificationId, req.user!.userId);
    const unreadCount = await notificationService.getUnreadCount(req.user!.userId);
    emitNotificationCountUpdate(req.user!.userId, unreadCount);
    res.status(200).json({ unreadCount });
  } catch (err) {
    next(err);
  }
}

export async function markAllAsReadHandler(req: Request, res: Response, next: NextFunction) {
  try {
    await notificationService.markAllAsRead(req.user!.userId);
    emitNotificationCountUpdate(req.user!.userId, 0);
    res.status(200).json({ unreadCount: 0 });
  } catch (err) {
    next(err);
  }
}