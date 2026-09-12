"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerPresenceHandlers = registerPresenceHandlers;
exports.getOnlineCount = getOnlineCount;
// userId -> count of active socket connections for that user
// (a count, not a boolean, because one user might have multiple tabs open)
const onlineUsers = new Map();
function registerPresenceHandlers(io, socket) {
    const currentCount = onlineUsers.get(socket.userId) ?? 0;
    onlineUsers.set(socket.userId, currentCount + 1);
    if (currentCount === 0) {
        // This user just came online for the first time (not just a new tab)
        broadcastOnlineCount(io);
    }
    // Admins need the current count immediately on connect (not only on 0→1 transitions)
    if (socket.role === 'ADMIN') {
        socket.emit('presence:count', { onlineCount: onlineUsers.size });
    }
    socket.on('disconnect', () => {
        const count = onlineUsers.get(socket.userId) ?? 1;
        if (count <= 1) {
            onlineUsers.delete(socket.userId);
            broadcastOnlineCount(io);
        }
        else {
            onlineUsers.set(socket.userId, count - 1);
        }
    });
}
function broadcastOnlineCount(io) {
    io.to('admin:global').emit('presence:count', { onlineCount: onlineUsers.size });
}
function getOnlineCount() {
    return onlineUsers.size;
}
//# sourceMappingURL=presence.js.map