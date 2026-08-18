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

// Accepts either the shared API key (for n8n / curl checks) or a dashboard JWT
function requireApiKeyOrAuth(req: Request, res: Response, next: NextFunction): void {
  const key = req.headers['x-api-key'];
  if (env.SCRAPER_API_KEY && key === env.SCRAPER_API_KEY) {
    next();
    return;
  }
  void authMiddleware(req, res, (err?: unknown) => {
    if (err) { next(err); return; }
    requireAgent(req, res, next);
  });
}

// Ingest — called by the scraper directly, authenticated with a shared API key
router.post('/bulk', requireApiKey, bulkIngest);

// Reads — API key (n8n/curl) or dashboard JWT
router.get('/', requireApiKeyOrAuth, list);
router.get('/:id', requireApiKeyOrAuth, getOne);

export default router;
