import { Request, Response, NextFunction } from 'express';
import { createProjectSchema, updateProjectSchema } from './project.validation';
import * as projectService from './project.service';
import { AppError } from '../../utils/appError';
import { getRequiredParam } from '../../utils/getRequiredParam';

export async function createProjectHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = createProjectSchema.safeParse(req.body);

    if (!parsed.success) {
      throw new AppError(400, parsed.error.issues[0]?.message ?? 'Invalid input');
    }

    const project = await projectService.createProject(req.user!.userId, parsed.data);
    res.status(201).json(project);
  } catch (err) {
    next(err);
  }
}

export async function getProjectsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const projects = await projectService.getProjectsForUser(req.user!.userId, req.user!.role);
    res.status(200).json(projects);
  } catch (err) {
    next(err);
  }
}

export async function getProjectByIdHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const projectId = getRequiredParam(req.params, 'id');

    const project = await projectService.getProjectById(
      projectId,
      req.user!.userId,
      req.user!.role
    );
    res.status(200).json(project);
  } catch (err) {
    next(err);
  }
}

export async function updateProjectHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const projectId = getRequiredParam(req.params, 'id');
    const parsed = updateProjectSchema.safeParse(req.body);

    if (!parsed.success) {
      throw new AppError(400, parsed.error.issues[0]?.message ?? 'Invalid input');
    }

    const project = await projectService.updateProject(
      projectId,
      req.user!.userId,
      req.user!.role,
      parsed.data
    );

    res.status(200).json(project);
  } catch (err) {
    next(err);
  }
}