import prisma from '../../config/db';
import { Role } from '../../generated/prisma/enums';

interface ActivityFilters {
  projectId?: string;
  since?: string;
  limit?: number;
}

export async function getActivityFeed(userId: string, role: Role, filters: ActivityFilters) {
  const limit = filters.limit ?? 20;
  const taskWhere: Record<string, unknown> = {};

  if (filters.projectId) {
    taskWhere.projectId = filters.projectId;
  }

  if (role === 'PM') {
    taskWhere.project = { managerId: userId };
  }

  if (role === 'DEVELOPER') {
    taskWhere.assigneeId = userId;
  }

  const where: Record<string, unknown> = { task: taskWhere };

  if (filters.since) {
    where.createdAt = { gt: new Date(filters.since) };
  }

  return prisma.taskActivityLog.findMany({
    where,
    include: {
      task: { select: { id: true, title: true, projectId: true } },
      changedBy: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}