"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createProject = createProject;
exports.getProjectsForUser = getProjectsForUser;
exports.getProjectById = getProjectById;
exports.updateProject = updateProject;
exports.assertProjectAccess = assertProjectAccess;
const db_1 = __importDefault(require("../../config/db"));
const appError_1 = require("../../utils/appError");
async function createProject(managerId, input) {
    const client = await db_1.default.client.findUnique({ where: { id: input.clientId } });
    if (!client) {
        throw new appError_1.AppError(404, 'Client not found');
    }
    return db_1.default.project.create({
        data: {
            name: input.name,
            clientId: input.clientId,
            managerId,
        },
    });
}
async function getProjectsForUser(userId, role) {
    if (role === 'ADMIN') {
        return db_1.default.project.findMany({
            include: { client: true, manager: { select: { id: true, name: true } } },
            orderBy: { createdAt: 'desc' },
        });
    }
    if (role === 'PM') {
        return db_1.default.project.findMany({
            where: { managerId: userId },
            include: { client: true },
            orderBy: { createdAt: 'desc' },
        });
    }
    return db_1.default.project.findMany({
        where: { tasks: { some: { assigneeId: userId } } },
        include: { client: true },
        orderBy: { createdAt: 'desc' },
    });
}
async function getProjectById(projectId, userId, role) {
    const project = await db_1.default.project.findUnique({
        where: { id: projectId },
        include: { client: true, tasks: true },
    });
    if (!project) {
        throw new appError_1.AppError(404, 'Project not found');
    }
    if (role === 'ADMIN') {
        return project;
    }
    if (role === 'PM') {
        if (project.managerId !== userId) {
            throw new appError_1.AppError(403, 'You do not manage this project');
        }
        return project;
    }
    const hasAssignedTask = project.tasks.some((task) => task.assigneeId === userId);
    if (!hasAssignedTask) {
        throw new appError_1.AppError(403, 'You have no tasks in this project');
    }
    return project;
}
async function updateProject(projectId, userId, role, input) {
    const project = await db_1.default.project.findUnique({ where: { id: projectId } });
    if (!project) {
        throw new appError_1.AppError(404, 'Project not found');
    }
    if (role !== 'ADMIN' && project.managerId !== userId) {
        throw new appError_1.AppError(403, 'You do not manage this project');
    }
    const data = {};
    if (input.name !== undefined) {
        data.name = input.name;
    }
    return db_1.default.project.update({
        where: { id: projectId },
        data,
    });
}
async function assertProjectAccess(projectId, userId, role) {
    await getProjectById(projectId, userId, role);
}
//# sourceMappingURL=project.service.js.map