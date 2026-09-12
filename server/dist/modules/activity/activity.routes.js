"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../../middleware/auth");
const activity_controller_1 = require("./activity.controller");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
router.get('/', activity_controller_1.getActivityFeedHandler);
exports.default = router;
//# sourceMappingURL=activity.routes.js.map