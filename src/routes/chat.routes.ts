import { Router } from 'express';
import { chatInput, chatOutput } from '../controllers/chat.controller';
import { validateChatInput } from '../middlewares/validate.middleware';

const router = Router();

router.post('/input', validateChatInput, chatInput);
router.post('/output', validateChatInput, chatOutput);

export default router;
