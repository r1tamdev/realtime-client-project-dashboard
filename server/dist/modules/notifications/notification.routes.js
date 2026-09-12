"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../../middleware/auth");
const notification_controller_1 = require("./notification.controller");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
router.get('/', notification_controller_1.getNotificationsHandler);
router.patch('/:id/read', notification_controller_1.markAsReadHandler);
router.patch('/read-all', notification_controller_1.markAllAsReadHandler);
exports.default = router;
//# sourceMappingURL=notification.routes.js.map