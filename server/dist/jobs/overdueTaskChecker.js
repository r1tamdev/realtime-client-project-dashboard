"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkOverdueTasks = checkOverdueTasks;
exports.startOverdueTaskScheduler = startOverdueTaskScheduler;
const node_cron_1 = __importDefault(require("node-cron"));
const db_1 = __importDefault(require("../config/db"));
const index_1 = require("../sockets/index");
const CRON_SCHEDULE = '*/5 * * * *';
async function checkOverdueTasks() {
    const now = new Date();
    const overdueTasks = await db_1.default.task.findMany({
        where: {
            dueDate: { lt: now },
            isOverdue: false,
            status: { not: 'DONE' },
        },
        select: {
            id: true,
            projectId: true,
            assigneeId: true,
            title: true,
        },
    });
    if (overdueTasks.length === 0) {
        return;
    }
    const overdueTaskIds = overdueTasks.map((task) => task.id);
    await db_1.default.task.updateMany({
        where: { id: { in: overdueTaskIds } },
        data: { isOverdue: true },
    });
    console.log(`[overdueTaskChecker] Flagged ${overdueTasks.length} task(s) as overdue`);
    notifyAffectedProjects(overdueTasks);
}
function notifyAffectedProjects(overdueTasks) {
    try {
        const io = (0, index_1.getIO)();
        const projectIds = new Set(overdueTasks.map((t) => t.projectId));
        for (const projectId of projectIds) {
            io.to(`project:${projectId}`).emit('task:overdue', {
                taskIds: overdueTasks.filter((t) => t.projectId === projectId).map((t) => t.id),
            });
        }
        io.to('admin:global').emit('task:overdue', {
            taskIds: overdueTasks.map((t) => t.id),
        });
    }
    catch (err) {
        // Socket server may not be initialized yet if this job somehow ran before
        // initSocketServer() — never let a broadcast failure break the actual DB update above.
        console.error('[overdueTaskChecker] Failed to emit overdue notification:', err);
    }
}
function startOverdueTaskScheduler() {
    node_cron_1.default.schedule(CRON_SCHEDULE, () => {
        checkOverdueTasks().catch((err) => {
            console.error('[overdueTaskChecker] Job failed:', err);
        });
    });
    console.log(`[overdueTaskChecker] Scheduler started (${CRON_SCHEDULE})`);
}
//# sourceMappingURL=overdueTaskChecker.js.map