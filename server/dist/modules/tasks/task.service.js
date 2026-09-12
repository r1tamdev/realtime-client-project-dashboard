"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTask = createTask;
exports.getTasksForUser = getTasksForUser;
exports.getTaskById = getTaskById;
exports.updateTaskStatus = updateTaskStatus;
const db_1 = __importDefault(require("../../config/db"));
const appError_1 = require("../../utils/appError");
const activityEvents_1 = require("../../sockets/activityEvents");
const notification_service_1 = require("../notifications/notification.service");
async function createTask(projectId, userId, role, input) {
    const project = await db_1.default.project.findUnique({ where: { id: projectId } });
    if (!project) {
        throw new appError_1.AppError(404, 'Project not found');
    }
    if (role !== 'ADMIN' && project.managerId !== userId) {
        throw new appError_1.AppError(403, 'You do not manage this project');
    }
    const assignee = await db_1.default.user.findUnique({ where: { id: input.assigneeId } });
    if (!assignee || assignee.role !== 'DEVELOPER') {
        throw new appError_1.AppError(400, 'assigneeId must reference an existing developer');
    }
    const task = await db_1.default.task.create({
        data: {
            title: input.title,
            description: input.description,
            projectId,
            assigneeId: input.assigneeId,
            priority: input.priority,
            dueDate: new Date(input.dueDate),
        },
    });
    await (0, notification_service_1.createNotification)(input.assigneeId, task.id, `You were assigned a new task: "${task.title}"`);
    const unreadCount = await (0, notification_service_1.getUnreadCount)(input.assigneeId);
    (0, activityEvents_1.emitNotificationCountUpdate)(input.assigneeId, unreadCount);
    return task;
}
function buildFilterWhere(filters) {
    const where = {};
    if (filters.projectId) {
        where.projectId = filters.projectId;
    }
    if (filters.status) {
        where.status = filters.status;
    }
    if (filters.priority) {
        where.priority = filters.priority;
    }
    if (filters.dueDateFrom || filters.dueDateTo) {
        where.dueDate = {
            ...(filters.dueDateFrom ? { gte: new Date(filters.dueDateFrom) } : {}),
            ...(filters.dueDateTo ? { lte: new Date(filters.dueDateTo) } : {}),
        };
    }
    return where;
}
async function getTasksForUser(userId, role, filters) {
    const filterWhere = buildFilterWhere(filters);
    if (role === 'ADMIN') {
        return db_1.default.task.findMany({
            where: filterWhere,
            include: { project: true, assignee: { select: { id: true, name: true } } },
            orderBy: [{ priority: 'desc' }, { dueDate: 'asc' }],
        });
    }
    if (role === 'PM') {
        return db_1.default.task.findMany({
            where: { ...filterWhere, project: { managerId: userId } },
            include: { project: true, assignee: { select: { id: true, name: true } } },
            orderBy: [{ priority: 'desc' }, { dueDate: 'asc' }],
        });
    }
    return db_1.default.task.findMany({
        where: { ...filterWhere, assigneeId: userId },
        include: { project: true },
        orderBy: [{ priority: 'desc' }, { dueDate: 'asc' }],
    });
}
async function getTaskById(taskId, userId, role) {
    const task = await db_1.default.task.findUnique({
        where: { id: taskId },
        include: { project: true, assignee: { select: { id: true, name: true } } },
    });
    if (!task) {
        throw new appError_1.AppError(404, 'Task not found');
    }
    if (role === 'ADMIN') {
        return task;
    }
    if (role === 'PM') {
        if (task.project.managerId !== userId) {
            throw new appError_1.AppError(403, "You do not manage this task's project");
        }
        return task;
    }
    if (task.assigneeId !== userId) {
        throw new appError_1.AppError(403, 'This task is not assigned to you');
    }
    return task;
}
async function updateTaskStatus(taskId, userId, role, newStatus) {
    const task = await db_1.default.task.findUnique({
        where: { id: taskId },
        include: { project: true },
    });
    if (!task) {
        throw new appError_1.AppError(404, 'Task not found');
    }
    const isAdmin = role === 'ADMIN';
    const isOwningPM = role === 'PM' && task.project.managerId === userId;
    const isAssignedDeveloper = role === 'DEVELOPER' && task.assigneeId === userId;
    if (!isAdmin && !isOwningPM && !isAssignedDeveloper) {
        throw new appError_1.AppError(403, 'You do not have permission to update this task');
    }
    const changer = await db_1.default.user.findUnique({ where: { id: userId }, select: { name: true } });
    const previousStatus = task.status;
    const [updatedTask, activityLog] = await db_1.default.$transaction([
        db_1.default.task.update({
            where: { id: taskId },
            data: { status: newStatus },
        }),
        db_1.default.taskActivityLog.create({
            data: {
                taskId,
                changedById: userId,
                fromStatus: previousStatus,
                toStatus: newStatus,
            },
        }),
    ]);
    (0, activityEvents_1.emitActivityEvent)({
        id: activityLog.id,
        taskId: task.id,
        taskTitle: task.title,
        projectId: task.projectId,
        changedByName: changer?.name ?? 'Someone',
        fromStatus: previousStatus,
        toStatus: newStatus,
        createdAt: activityLog.createdAt,
    }, [task.assigneeId]);
    if (newStatus === 'IN_REVIEW') {
        await (0, notification_service_1.createNotification)(task.project.managerId, task.id, `${changer?.name ?? 'Someone'} moved "${task.title}" to In Review`);
        const unreadCount = await (0, notification_service_1.getUnreadCount)(task.project.managerId);
        (0, activityEvents_1.emitNotificationCountUpdate)(task.project.managerId, unreadCount);
    }
    return updatedTask;
}
//# sourceMappingURL=task.service.js.map