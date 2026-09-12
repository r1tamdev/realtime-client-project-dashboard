"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNotificationsHandler = getNotificationsHandler;
exports.markAsReadHandler = markAsReadHandler;
exports.markAllAsReadHandler = markAllAsReadHandler;
const notificationService = __importStar(require("./notification.service"));
const activityEvents_1 = require("../../sockets/activityEvents");
const getRequiredParam_1 = require("../../utils/getRequiredParam");
async function getNotificationsHandler(req, res, next) {
    try {
        const notifications = await notificationService.getNotificationsForUser(req.user.userId);
        const unreadCount = await notificationService.getUnreadCount(req.user.userId);
        res.status(200).json({ notifications, unreadCount });
    }
    catch (err) {
        next(err);
    }
}
async function markAsReadHandler(req, res, next) {
    try {
        const notificationId = (0, getRequiredParam_1.getRequiredParam)(req.params, 'id');
        await notificationService.markAsRead(notificationId, req.user.userId);
        const unreadCount = await notificationService.getUnreadCount(req.user.userId);
        (0, activityEvents_1.emitNotificationCountUpdate)(req.user.userId, unreadCount);
        res.status(200).json({ unreadCount });
    }
    catch (err) {
        next(err);
    }
}
async function markAllAsReadHandler(req, res, next) {
    try {
        await notificationService.markAllAsRead(req.user.userId);
        (0, activityEvents_1.emitNotificationCountUpdate)(req.user.userId, 0);
        res.status(200).json({ unreadCount: 0 });
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=notification.controller.js.map