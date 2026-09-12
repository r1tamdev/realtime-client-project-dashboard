import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { getActivityFeedHandler } from './activity.controller';

const router = Router();

router.use(authenticate);

router.get('/', getActivityFeedHandler);

export default router;