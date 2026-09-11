import cron from 'node-cron';
import prisma from '../config/db';
import { getIO } from '../sockets/index';

const CRON_SCHEDULE = '*/5 * * * *';

export async function checkOverdueTasks() {
  const now = new Date();

  const overdueTasks = await prisma.task.findMany({
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

  await prisma.task.updateMany({
    where: { id: { in: overdueTaskIds } },
    data: { isOverdue: true },
  });

  console.log(`[overdueTaskChecker] Flagged ${overdueTasks.length} task(s) as overdue`);

  notifyAffectedProjects(overdueTasks);
}

function notifyAffectedProjects(
  overdueTasks: { id: string; projectId: string; assigneeId: string; title: string }[]
) {
  try {
    const io = getIO();
    const projectIds = new Set(overdueTasks.map((t) => t.projectId));

    for (const projectId of projectIds) {
      io.to(`project:${projectId}`).emit('task:overdue', {
        taskIds: overdueTasks.filter((t) => t.projectId === projectId).map((t) => t.id),
      });
    }

    io.to('admin:global').emit('task:overdue', {
      taskIds: overdueTasks.map((t) => t.id),
    });
  } catch (err) {
    // Socket server may not be initialized yet if this job somehow ran before
    // initSocketServer() — never let a broadcast failure break the actual DB update above.
    console.error('[overdueTaskChecker] Failed to emit overdue notification:', err);
  }
}

export function startOverdueTaskScheduler() {
  cron.schedule(CRON_SCHEDULE, () => {
    checkOverdueTasks().catch((err) => {
      console.error('[overdueTaskChecker] Job failed:', err);
    });
  });

  console.log(`[overdueTaskChecker] Scheduler started (${CRON_SCHEDULE})`);
}