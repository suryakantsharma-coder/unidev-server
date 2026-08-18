"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const redditPost_controller_1 = require("../controllers/redditPost.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const rbac_middleware_1 = require("../middlewares/rbac.middleware");
const env_1 = require("../config/env");
const router = (0, express_1.Router)();
function requireApiKey(req, res, next) {
    const key = req.headers['x-api-key'];
    if (!env_1.env.SCRAPER_API_KEY || key !== env_1.env.SCRAPER_API_KEY) {
        res.status(401).json({ success: false, message: 'Invalid or missing API key' });
        return;
    }
    next();
}
// Accepts either the shared API key (for n8n / curl checks) or a dashboard JWT
function requireApiKeyOrAuth(req, res, next) {
    const key = req.headers['x-api-key'];
    if (env_1.env.SCRAPER_API_KEY && key === env_1.env.SCRAPER_API_KEY) {
        next();
        return;
    }
    void (0, auth_middleware_1.authMiddleware)(req, res, (err) => {
        if (err) {
            next(err);
            return;
        }
        (0, rbac_middleware_1.requireAgent)(req, res, next);
    });
}
// Ingest — called by the scraper directly, authenticated with a shared API key
router.post('/bulk', requireApiKey, redditPost_controller_1.bulkIngest);
// Reads — API key (n8n/curl) or dashboard JWT
router.get('/', requireApiKeyOrAuth, redditPost_controller_1.list);
router.get('/:id', requireApiKeyOrAuth, redditPost_controller_1.getOne);
exports.default = router;
//# sourceMappingURL=redditPost.routes.js.map