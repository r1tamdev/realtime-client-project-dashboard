"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getActivityFeedHandler = getActivityFeedHandler;
const activity_service_1 = require("./activity.service");
async function getActivityFeedHandler(req, res, next) {
    try {
        const { projectId, since, limit } = req.query;
        const filters = {};
        if (typeof projectId === 'string') {
            filters.projectId = projectId;
        }
        if (typeof since === 'string') {
            filters.since = since;
        }
        if (limit) {
            filters.limit = Number(limit);
        }
        const events = await (0, activity_service_1.getActivityFeed)(req.user.userId, req.user.role, filters);
        res.status(200).json(events);
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=activity.controller.js.map