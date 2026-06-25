import { Router } from 'express';
import { register, login, me, setup } from '../controllers/auth.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { requireSuperAdmin } from '../middlewares/rbac.middleware';

const router = Router();

// One-time setup — only works when no super_admin exists yet, then auto-disables itself
router.post('/setup', setup);

// Only super_admin can create new users (prevents open registration)
router.post('/register', authMiddleware, requireSuperAdmin, register);
router.post('/login', login);
router.get('/me', authMiddleware, me);

export default router;
