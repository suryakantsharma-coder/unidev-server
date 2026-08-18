import { Router, Request, Response, NextFunction } from 'express';
import { bulkIngest, list, getOne } from '../controllers/redditPost.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { requireAgent } from '../middlewares/rbac.middleware';
import { env } from '../config/env';

const router = Router();

function requireApiKey(req: Request, res: Response, next: NextFunction): void {
  const key = req.headers['x-api-key'];
  if (!env.SCRAPER_API_KEY || key !== env.SCRAPER_API_KEY) {
    res.status(401).json({ success: false, message: 'Invalid or missing API key' });
    return;
  }
  next();
}

// Ingest — called by the scraper directly, authenticated with a shared API key
router.post('/bulk', requireApiKey, bulkIngest);

// Reads — dashboard-facing, standard JWT auth
router.get('/', authMiddleware, requireAgent, list);
router.get('/:id', authMiddleware, requireAgent, getOne);

export default router;
