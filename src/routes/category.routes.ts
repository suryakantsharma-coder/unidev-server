import { Router } from 'express';
import { create, list, getOne, update, remove } from '../controllers/category.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { requireAdmin, requireAgent } from '../middlewares/rbac.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/',      requireAgent, list);
router.get('/:id',  requireAgent, getOne);
router.post('/',    requireAdmin, create);
router.patch('/:id', requireAdmin, update);
router.delete('/:id', requireAdmin, remove);

export default router;
