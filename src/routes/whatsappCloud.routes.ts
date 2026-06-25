import { Router } from 'express';
import { sendText, sendTemplate, sendMedia } from '../controllers/whatsappCloud.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { requireAdmin } from '../middlewares/rbac.middleware';

const router = Router();

router.use(authMiddleware, requireAdmin);

router.post('/send/text', sendText);
router.post('/send/template', sendTemplate);
router.post('/send/media', sendMedia);

export default router;
