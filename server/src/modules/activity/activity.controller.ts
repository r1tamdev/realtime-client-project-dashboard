import { Request, Response, NextFunction } from 'express';
import { getActivityFeed } from './activity.service';

export async function getActivityFeedHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { projectId, since, limit } = req.query;

   const filters: {
      projectId?: string;
      since?: string;
      limit?: number;
    } = {};

    if (typeof projectId === 'string') {
      filters.projectId = projectId;
    }

    if (typeof since === 'string') {
      filters.since = since;
    }

    if (limit) {
      filters.limit = Number(limit);
    }

    const events = await getActivityFeed(req.user!.userId, req.user!.role, filters);

    res.status(200).json(events);
  } catch (err) {
    next(err);
  }
}