import { Router } from 'express';
import { verifyWebhook, receiveWebhook } from '../controllers/webhook.controller';

const router = Router();

// These routes are public — Meta calls them directly
router.get('/whatsapp', verifyWebhook);
router.post('/whatsapp', receiveWebhook);

export default router;
