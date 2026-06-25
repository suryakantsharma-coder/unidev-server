import { Router } from 'express';
import { create, list, getOne, getByLead, update, remove } from '../controllers/followUp.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { requireAgent } from '../middlewares/rbac.middleware';

const router = Router();

router.use(authMiddleware, requireAgent);

router.post('/',                  create);
router.get('/',                   list);       // ?leadId= ?contact= ?status= ?dateFrom= ?dateTo= ?dueToday=
router.get('/lead/:leadId',       getByLead);  // all follow-ups for a specific lead
router.get('/:id',                getOne);
router.patch('/:id',              update);
router.delete('/:id',             remove);

export default router;
