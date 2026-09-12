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
exports.createTaskHandler = createTaskHandler;
exports.getTasksHandler = getTasksHandler;
exports.getTaskByIdHandler = getTaskByIdHandler;
exports.updateTaskStatusHandler = updateTaskStatusHandler;
const task_validation_1 = require("./task.validation");
const taskService = __importStar(require("./task.service"));
const appError_1 = require("../../utils/appError");
const getRequiredParam_1 = require("../../utils/getRequiredParam");
async function createTaskHandler(req, res, next) {
    try {
        const projectId = (0, getRequiredParam_1.getRequiredParam)(req.params, 'id');
        const parsed = task_validation_1.createTaskSchema.safeParse(req.body);
        if (!parsed.success) {
            throw new appError_1.AppError(400, parsed.error.issues[0]?.message ?? 'Invalid input');
        }
        const task = await taskService.createTask(projectId, req.user.userId, req.user.role, parsed.data);
        res.status(201).json(task);
    }
    catch (err) {
        next(err);
    }
}
async function getTasksHandler(req, res, next) {
    try {
        const parsed = task_validation_1.taskFilterSchema.safeParse(req.query);
        if (!parsed.success) {
            throw new appError_1.AppError(400, parsed.error.issues[0]?.message ?? 'Invalid input');
        }
        const tasks = await taskService.getTasksForUser(req.user.userId, req.user.role, parsed.data);
        res.status(200).json(tasks);
    }
    catch (err) {
        next(err);
    }
}
async function getTaskByIdHandler(req, res, next) {
    try {
        const taskId = (0, getRequiredParam_1.getRequiredParam)(req.params, 'id');
        const task = await taskService.getTaskById(taskId, req.user.userId, req.user.role);
        res.status(200).json(task);
    }
    catch (err) {
        next(err);
    }
}
async function updateTaskStatusHandler(req, res, next) {
    try {
        const taskId = (0, getRequiredParam_1.getRequiredParam)(req.params, 'id');
        const parsed = task_validation_1.updateTaskStatusSchema.safeParse(req.body);
        if (!parsed.success) {
            throw new appError_1.AppError(400, parsed.error.issues[0]?.message ?? 'Invalid input');
        }
        const task = await taskService.updateTaskStatus(taskId, req.user.userId, req.user.role, parsed.data.status);
        res.status(200).json(task);
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=task.controller.js.map