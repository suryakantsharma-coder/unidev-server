import { Router } from 'express';
import { getStats } from '../controllers/dashboard.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { requireAdmin } from '../middlewares/rbac.middleware';

const router = Router();

router.get('/stats', authMiddleware, requireAdmin, getStats);

export default router;
