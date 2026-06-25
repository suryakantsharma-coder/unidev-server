import { Router } from 'express';
import multer from 'multer';
import { create, bulkCreate, bulkDelete, list, search, getOne, update, remove } from '../controllers/lead.controller';
import { importLeads, getJob, listJobs } from '../controllers/leadImport.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { requireAdmin, requireAgent } from '../middlewares/rbac.middleware';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB
});

const router = Router();

router.use(authMiddleware);

// File import (before /:id to avoid param clash)
router.post('/import',       requireAdmin, upload.single('file'), importLeads);
router.get('/import/jobs',   requireAdmin, listJobs);
router.get('/import/:jobId', requireAdmin, getJob);

// Bulk JSON insert & delete
router.post('/bulk', requireAgent, bulkCreate);
router.delete('/bulk', requireAdmin, bulkDelete);

// Search
router.get('/search', requireAgent, search);

// CRUD
router.get('/',      requireAgent, list);
router.post('/',     requireAgent, create);
router.get('/:id',   requireAgent, getOne);
router.patch('/:id', requireAgent, update);
router.delete('/:id', requireAdmin, remove);

export default router;
