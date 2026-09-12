"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNotification = createNotification;
exports.getNotificationsForUser = getNotificationsForUser;
exports.getUnreadCount = getUnreadCount;
exports.markAsRead = markAsRead;
exports.markAllAsRead = markAllAsRead;
const db_1 = __importDefault(require("../../config/db"));
const appError_1 = require("../../utils/appError");
async function createNotification(userId, taskId, message) {
    return db_1.default.notification.create({
        data: { userId, taskId, message },
    });
}
async function getNotificationsForUser(userId) {
    return db_1.default.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 50,
    });
}
async function getUnreadCount(userId) {
    return db_1.default.notification.count({
        where: { userId, isRead: false },
    });
}
async function markAsRead(notificationId, userId) {
    const notification = await db_1.default.notification.findUnique({ where: { id: notificationId } });
    if (!notification) {
        throw new appError_1.AppError(404, 'Notification not found');
    }
    if (notification.userId !== userId) {
        throw new appError_1.AppError(403, 'This notification does not belong to you');
    }
    return db_1.default.notification.update({
        where: { id: notificationId },
        data: { isRead: true },
    });
}
async function markAllAsRead(userId) {
    await db_1.default.notification.updateMany({
        where: { userId, isRead: false },
        data: { isRead: true },
    });
}
//# sourceMappingURL=notification.service.js.map