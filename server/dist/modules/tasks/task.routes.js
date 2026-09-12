"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../../middleware/auth");
const task_controller_1 = require("./task.controller");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
router.get('/', task_controller_1.getTasksHandler);
router.get('/:id', task_controller_1.getTaskByIdHandler);
router.patch('/:id/status', task_controller_1.updateTaskStatusHandler);
exports.default = router;
//# sourceMappingURL=task.routes.js.map