"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProjectSchema = exports.createProjectSchema = void 0;
const zod_1 = require("zod");
exports.createProjectSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).max(100),
    clientId: zod_1.z.string().uuid(),
});
exports.updateProjectSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).max(100).optional(),
});
//# sourceMappingURL=project.validation.js.map