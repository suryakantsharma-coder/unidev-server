import { Router } from 'express';
import { generate, getByLead, listAll } from '../controllers/aiContent.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { requireAgent } from '../middlewares/rbac.middleware';

const router = Router();

router.use(authMiddleware, requireAgent);

router.post('/generate',          generate);   // generate + save
router.get('/',                   listAll);    // list all (filter by leadId, type, createdBy)
router.get('/lead/:leadId',       getByLead);  // all AI content for a specific lead

export default router;
