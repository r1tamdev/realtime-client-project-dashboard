import { Router } from 'express';
import { loginHandler, refreshHandler, logoutHandler, meHandler } from './auth.controller';
import { authenticate } from '../../middleware/auth' ;

const router = Router();

router.post('/login', loginHandler);
router.post('/refresh', refreshHandler);
router.post('/logout', logoutHandler);

router.get('/me',authenticate, meHandler);

export default router;