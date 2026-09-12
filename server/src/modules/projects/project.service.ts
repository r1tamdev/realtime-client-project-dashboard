import prisma from '../../config/db';
import { AppError } from '../../utils/appError';
import { Role, Prisma } from '../../generated/prisma/client';
import { CreateProjectInput, UpdateProjectInput } from './project.validation';

export async function createProject(managerId: string, input: CreateProjectInput) {
  const client = await prisma.client.findUnique({ where: { id: input.clientId } });

  if (!client) {
    throw new AppError(404, 'Client not found');
  }

  return prisma.project.create({
    data: {
      name: input.name,
      clientId: input.clientId,
      managerId,
    },
  });
}

export async function getProjectsForUser(userId: string, role: Role) {
  if (role === 'ADMIN') {
    return prisma.project.findMany({
      include: { client: true, manager: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  if (role === 'PM') {
    return prisma.project.findMany({
      where: { managerId: userId },
      include: { client: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  return prisma.project.findMany({
    where: { tasks: { some: { assigneeId: userId } } },
    include: { client: true },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getProjectById(projectId: string, userId: string, role: Role) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { client: true, tasks: true },
  });

  if (!project) {
    throw new AppError(404, 'Project not found');
  }

  if (role === 'ADMIN') {
    return project;
  }

  if (role === 'PM') {
    if (project.managerId !== userId) {
      throw new AppError(403, 'You do not manage this project');
    }
    return project;
  }

  const hasAssignedTask = project.tasks.some((task) => task.assigneeId === userId);

  if (!hasAssignedTask) {
    throw new AppError(403, 'You have no tasks in this project');
  }

  return project;
}

export async function updateProject(
  projectId: string,
  userId: string,
  role: Role,
  input: UpdateProjectInput
) {
  const project = await prisma.project.findUnique({ where: { id: projectId } });

  if (!project) {
    throw new AppError(404, 'Project not found');
  }

  if (role !== 'ADMIN' && project.managerId !== userId) {
    throw new AppError(403, 'You do not manage this project');
  }

  const data: Prisma.ProjectUpdateInput = {};

  if (input.name !== undefined) {
    data.name = input.name;
  }

  return prisma.project.update({
    where: { id: projectId },
    data,
  });
}

export async function assertProjectAccess(projectId: string, userId: string, role: Role) {
  await getProjectById(projectId, userId, role);
}