import { Router } from 'express';
import { create, list, getOne, update, remove } from '../controllers/contact.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { requireAgent, requireAdmin } from '../middlewares/rbac.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/', requireAgent, list);
router.post('/', requireAgent, create);
router.get('/:id', requireAgent, getOne);
router.patch('/:id', requireAgent, update);
router.delete('/:id', requireAdmin, remove); // Only admins can delete contacts

export default router;
