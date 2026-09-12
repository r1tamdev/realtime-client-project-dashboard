import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { requireRole } from '../../middleware/requireRole';
import {
  createProjectHandler,
  getProjectsHandler,
  getProjectByIdHandler,
  updateProjectHandler,
} from './project.controller';
import { createTaskHandler } from '../tasks/task.controller';

const router = Router();

router.use(authenticate);

router.post('/', requireRole('ADMIN', 'PM'), createProjectHandler);
router.get('/', getProjectsHandler);
router.get('/:id', getProjectByIdHandler);
router.patch('/:id', requireRole('ADMIN', 'PM'), updateProjectHandler);
router.post('/:id/tasks', requireRole('ADMIN', 'PM'), createTaskHandler);

export default router;