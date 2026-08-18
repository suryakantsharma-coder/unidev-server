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
// Ingest — called by the scraper directly, authenticated with a shared API key
router.post('/bulk', requireApiKey, redditPost_controller_1.bulkIngest);
// Reads — dashboard-facing, standard JWT auth
router.get('/', auth_middleware_1.authMiddleware, rbac_middleware_1.requireAgent, redditPost_controller_1.list);
router.get('/:id', auth_middleware_1.authMiddleware, rbac_middleware_1.requireAgent, redditPost_controller_1.getOne);
exports.default = router;
//# sourceMappingURL=redditPost.routes.js.map