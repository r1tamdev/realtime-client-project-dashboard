import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { getTasksHandler, getTaskByIdHandler, updateTaskStatusHandler } from './task.controller';

const router = Router();

router.use(authenticate);

router.get('/', getTasksHandler);
router.get('/:id', getTaskByIdHandler);
router.patch('/:id/status', updateTaskStatusHandler);

export default router;