import { Router } from 'express';
import { listUsers, updateUserRole, deactivateUser } from '../controllers/user.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { requireAdmin, requireSuperAdmin } from '../middlewares/rbac.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/', requireAdmin, listUsers);
router.patch('/:id/role', requireSuperAdmin, updateUserRole);
router.patch('/:id/deactivate', requireSuperAdmin, deactivateUser);

export default router;
