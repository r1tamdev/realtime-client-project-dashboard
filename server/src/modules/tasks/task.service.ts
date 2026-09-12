import prisma from '../../config/db';
import { AppError } from '../../utils/appError';
import { Role, TaskStatus } from '../../generated/prisma/enums';
import { CreateTaskInput, TaskFilterInput } from './task.validation';
import { emitActivityEvent, emitNotificationCountUpdate } from '../../sockets/activityEvents';
import { createNotification, getUnreadCount } from '../notifications/notification.service';

export async function createTask(
  projectId: string,
  userId: string,
  role: Role,
  input: CreateTaskInput
) {
  const project = await prisma.project.findUnique({ where: { id: projectId } });

  if (!project) {
    throw new AppError(404, 'Project not found');
  }

  if (role !== 'ADMIN' && project.managerId !== userId) {
    throw new AppError(403, 'You do not manage this project');
  }

  const assignee = await prisma.user.findUnique({ where: { id: input.assigneeId } });

  if (!assignee || assignee.role !== 'DEVELOPER') {
    throw new AppError(400, 'assigneeId must reference an existing developer');
  }

  const task = await prisma.task.create({
    data: {
      title: input.title,
      description: input.description,
      projectId,
      assigneeId: input.assigneeId,
      priority: input.priority,
      dueDate: new Date(input.dueDate),
    },
  });

  await createNotification(
    input.assigneeId,
    task.id,
    `You were assigned a new task: "${task.title}"`
  );

  const unreadCount = await getUnreadCount(input.assigneeId);
  emitNotificationCountUpdate(input.assigneeId, unreadCount);

  return task;
}

function buildFilterWhere(filters: TaskFilterInput) {
  const where: Record<string, unknown> = {};

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.priority) {
    where.priority = filters.priority;
  }

  if (filters.dueDateFrom || filters.dueDateTo) {
    where.dueDate = {
      ...(filters.dueDateFrom ? { gte: new Date(filters.dueDateFrom) } : {}),
      ...(filters.dueDateTo ? { lte: new Date(filters.dueDateTo) } : {}),
    };
  }

  return where;
}

export async function getTasksForUser(userId: string, role: Role, filters: TaskFilterInput) {
  const filterWhere = buildFilterWhere(filters);

  if (role === 'ADMIN') {
    return prisma.task.findMany({
      where: filterWhere,
      include: { project: true, assignee: { select: { id: true, name: true } } },
      orderBy: [{ priority: 'desc' }, { dueDate: 'asc' }],
    });
  }

  if (role === 'PM') {
    return prisma.task.findMany({
      where: { ...filterWhere, project: { managerId: userId } },
      include: { project: true, assignee: { select: { id: true, name: true } } },
      orderBy: [{ priority: 'desc' }, { dueDate: 'asc' }],
    });
  }

  return prisma.task.findMany({
    where: { ...filterWhere, assigneeId: userId },
    include: { project: true },
    orderBy: [{ priority: 'desc' }, { dueDate: 'asc' }],
  });
}

export async function getTaskById(taskId: string, userId: string, role: Role) {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: { project: true, assignee: { select: { id: true, name: true } } },
  });

  if (!task) {
    throw new AppError(404, 'Task not found');
  }

  if (role === 'ADMIN') {
    return task;
  }

  if (role === 'PM') {
    if (task.project.managerId !== userId) {
      throw new AppError(403, "You do not manage this task's project");
    }
    return task;
  }

  if (task.assigneeId !== userId) {
    throw new AppError(403, 'This task is not assigned to you');
  }

  return task;
}

export async function updateTaskStatus(
  taskId: string,
  userId: string,
  role: Role,
  newStatus: TaskStatus
) {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: { project: true },
  });

  if (!task) {
    throw new AppError(404, 'Task not found');
  }

  const isAdmin = role === 'ADMIN';
  const isOwningPM = role === 'PM' && task.project.managerId === userId;
  const isAssignedDeveloper = role === 'DEVELOPER' && task.assigneeId === userId;

  if (!isAdmin && !isOwningPM && !isAssignedDeveloper) {
    throw new AppError(403, 'You do not have permission to update this task');
  }

  const changer = await prisma.user.findUnique({ where: { id: userId }, select: { name: true } });
  const previousStatus = task.status;

  const [updatedTask, activityLog] = await prisma.$transaction([
    prisma.task.update({
      where: { id: taskId },
      data: { status: newStatus },
    }),
    prisma.taskActivityLog.create({
      data: {
        taskId,
        changedById: userId,
        fromStatus: previousStatus,
        toStatus: newStatus,
      },
    }),
  ]);

  emitActivityEvent(
    {
      id: activityLog.id,
      taskId: task.id,
      taskTitle: task.title,
      projectId: task.projectId,
      changedByName: changer?.name ?? 'Someone',
      fromStatus: previousStatus,
      toStatus: newStatus,
      createdAt: activityLog.createdAt,
    },
    [task.assigneeId]
  );

  if (newStatus === 'IN_REVIEW') {
    await createNotification(
      task.project.managerId,
      task.id,
      `${changer?.name ?? 'Someone'} moved "${task.title}" to In Review`
    );

    const unreadCount = await getUnreadCount(task.project.managerId);
    emitNotificationCountUpdate(task.project.managerId, unreadCount);
  }

  return updatedTask;
}