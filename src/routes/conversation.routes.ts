import { Router } from 'express';
import {
  list,
  getOne,
  updateStatus,
  assign,
  getMessages,
} from '../controllers/conversation.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { requireAgent } from '../middlewares/rbac.middleware';

const router = Router();

router.use(authMiddleware, requireAgent);

router.get('/', list);
router.get('/:id', getOne);
router.patch('/:id/status', updateStatus);
router.patch('/:id/assign', assign);
router.get('/:id/messages', getMessages);

export default router;
