"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getActivityFeed = getActivityFeed;
const db_1 = __importDefault(require("../../config/db"));
async function getActivityFeed(userId, role, filters) {
    const limit = filters.limit ?? 20;
    const taskWhere = {};
    if (filters.projectId) {
        taskWhere.projectId = filters.projectId;
    }
    if (role === 'PM') {
        taskWhere.project = { managerId: userId };
    }
    if (role === 'DEVELOPER') {
        taskWhere.assigneeId = userId;
    }
    const where = { task: taskWhere };
    if (filters.since) {
        where.createdAt = { gt: new Date(filters.since) };
    }
    const logs = await db_1.default.taskActivityLog.findMany({
        where,
        include: {
            task: { select: { id: true, title: true, projectId: true } },
            changedBy: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
    });
    return logs.map((log) => ({
        id: log.id,
        taskId: log.taskId,
        taskTitle: log.task.title,
        projectId: log.task.projectId,
        changedByName: log.changedBy.name,
        fromStatus: log.fromStatus,
        toStatus: log.toStatus,
        createdAt: log.createdAt,
    }));
}
//# sourceMappingURL=activity.service.js.map