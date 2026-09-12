"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.taskFilterSchema = exports.updateTaskStatusSchema = exports.createTaskSchema = void 0;
const zod_1 = require("zod");
exports.createTaskSchema = zod_1.z.object({
    title: zod_1.z.string().min(2).max(150),
    description: zod_1.z.string().min(1).max(2000),
    assigneeId: zod_1.z.string().uuid(),
    priority: zod_1.z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
    dueDate: zod_1.z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: 'dueDate must be a valid date string',
    }),
});
exports.updateTaskStatusSchema = zod_1.z.object({
    status: zod_1.z.enum(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE']),
});
exports.taskFilterSchema = zod_1.z.object({
    projectId: zod_1.z.string().uuid().optional(),
    status: zod_1.z.enum(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE']).optional(),
    priority: zod_1.z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
    dueDateFrom: zod_1.z.string().optional(),
    dueDateTo: zod_1.z.string().optional(),
});
//# sourceMappingURL=task.validation.js.map