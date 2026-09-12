"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../../middleware/auth");
const requireRole_1 = require("../../middleware/requireRole");
const project_controller_1 = require("./project.controller");
const task_controller_1 = require("../tasks/task.controller");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
router.post('/', (0, requireRole_1.requireRole)('ADMIN', 'PM'), project_controller_1.createProjectHandler);
router.get('/', project_controller_1.getProjectsHandler);
router.get('/:id', project_controller_1.getProjectByIdHandler);
router.patch('/:id', (0, requireRole_1.requireRole)('ADMIN', 'PM'), project_controller_1.updateProjectHandler);
router.post('/:id/tasks', (0, requireRole_1.requireRole)('ADMIN', 'PM'), task_controller_1.createTaskHandler);
exports.default = router;
//# sourceMappingURL=project.routes.js.map