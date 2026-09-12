"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emitActivityEvent = emitActivityEvent;
exports.emitNotificationCountUpdate = emitNotificationCountUpdate;
const index_1 = require("./index");
function emitActivityEvent(payload, recipientUserIds) {
    const io = (0, index_1.getIO)();
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
function emitNotificationCountUpdate(userId, unreadCount) {
    const io = (0, index_1.getIO)();
    io.to(`user:${userId}`).emit('notification:count', { unreadCount });
}
//# sourceMappingURL=activityEvents.js.map