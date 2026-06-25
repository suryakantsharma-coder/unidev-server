import { Router } from 'express';
import { startSequence, listSequences, getSequence, cancelSequence, getSequencesByLead, listProgress, getProgress } from '../controllers/emailSequence.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { requireAgent, requireAdmin } from '../middlewares/rbac.middleware';

const router = Router();

router.use(authMiddleware);

router.post('/',                        requireAgent, startSequence);      // start a new sequence
router.get('/progress',                 requireAgent, listProgress);       // all sequences with progress summary
router.get('/progress/:id',             requireAgent, getProgress);        // one sequence progress detail
router.get('/',                         requireAdmin, listSequences);      // raw list (admin)
router.get('/lead/:leadId',             requireAgent, getSequencesByLead); // timeline for a lead
router.get('/:id',                      requireAgent, getSequence);        // raw sequence doc
router.patch('/:id/cancel',             requireAgent, cancelSequence);     // stop sequence

export default router;
