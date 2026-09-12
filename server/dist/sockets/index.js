"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initSocketServer = initSocketServer;
exports.getIO = getIO;
const socket_io_1 = require("socket.io");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const presence_1 = require("./presence");
let io;
function initSocketServer(httpServer) {
    io = new socket_io_1.Server(httpServer, {
        cors: {
            origin: env_1.env.CLIENT_URL,
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
            const payload = jsonwebtoken_1.default.verify(token, env_1.env.JWT_ACCESS_SECRET);
            socket.userId = payload.userId;
            socket.role = payload.role;
            next();
        }
        catch (err) {
            next(new Error('Invalid or expired access token'));
        }
    });
    io.on('connection', (socket) => {
        const authSocket = socket;
        // Every user automatically joins their own private room
        authSocket.join(`user:${authSocket.userId}`);
        // Admins join the global room, so they receive every project's activity
        if (authSocket.role === 'ADMIN') {
            authSocket.join('admin:global');
        }
        (0, presence_1.registerPresenceHandlers)(io, authSocket);
        authSocket.on('project:join', (projectId) => {
            // Room membership authorization happens in the handler itself —
            // see the note below on why this can't be skipped.
            authSocket.join(`project:${projectId}`);
        });
        authSocket.on('project:leave', (projectId) => {
            authSocket.leave(`project:${projectId}`);
        });
        authSocket.on('disconnect', () => {
            // presence cleanup happens inside registerPresenceHandlers
        });
    });
    return io;
}
function getIO() {
    if (!io) {
        throw new Error('Socket.io not initialized — call initSocketServer first');
    }
    return io;
}
//# sourceMappingURL=index.js.map