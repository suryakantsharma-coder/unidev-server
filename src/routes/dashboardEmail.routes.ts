import { Router } from 'express';
import { sendEmail, listEmails, getEmail, getEmailsByLead } from '../controllers/dashboardEmail.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { requireAgent, requireAdmin } from '../middlewares/rbac.middleware';

const router = Router();

router.use(authMiddleware);

router.post('/',                  requireAgent, sendEmail);
router.get('/',                   requireAdmin, listEmails);
router.get('/lead/:leadId',       requireAgent, getEmailsByLead);  // all emails for a lead
router.get('/:id',                requireAdmin, getEmail);

export default router;
