import { Request, Response, NextFunction } from 'express';
import { createTaskSchema, updateTaskStatusSchema, taskFilterSchema } from './task.validation';
import * as taskService from './task.service';
import { AppError } from '../../utils/appError';
import { getRequiredParam } from '../../utils/getRequiredParam';

export async function createTaskHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const projectId = getRequiredParam(req.params, 'id');
    const parsed = createTaskSchema.safeParse(req.body);

    if (!parsed.success) {
      throw new AppError(400, parsed.error.issues[0]?.message ?? 'Invalid input');
    }

    const task = await taskService.createTask(
      projectId,
      req.user!.userId,
      req.user!.role,
      parsed.data
    );

    res.status(201).json(task);
  } catch (err) {
    next(err);
  }
}

export async function getTasksHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = taskFilterSchema.safeParse(req.query);

    if (!parsed.success) {
      throw new AppError(400, parsed.error.issues[0]?.message ?? 'Invalid input');
    }

    const tasks = await taskService.getTasksForUser(req.user!.userId, req.user!.role, parsed.data);
    res.status(200).json(tasks);
  } catch (err) {
    next(err);
  }
}

export async function getTaskByIdHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const taskId = getRequiredParam(req.params, 'id');
    const task = await taskService.getTaskById(taskId, req.user!.userId, req.user!.role);
    res.status(200).json(task);
  } catch (err) {
    next(err);
  }
}

export async function updateTaskStatusHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const taskId = getRequiredParam(req.params, 'id');
    const parsed = updateTaskStatusSchema.safeParse(req.body);

    if (!parsed.success) {
      throw new AppError(400, parsed.error.issues[0]?.message ?? 'Invalid input');
    }

    const task = await taskService.updateTaskStatus(
      taskId,
      req.user!.userId,
      req.user!.role,
      parsed.data.status
    );

    res.status(200).json(task);
  } catch (err) {
    next(err);
  }
}