import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import {
  getNotificationsHandler,
  markAsReadHandler,
  markAllAsReadHandler,
} from './notification.controller';

const router = Router();

router.use(authenticate);

router.get('/', getNotificationsHandler);
router.patch('/:id/read', markAsReadHandler);
router.patch('/read-all', markAllAsReadHandler);

export default router;