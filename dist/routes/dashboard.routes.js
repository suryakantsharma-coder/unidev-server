"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const dashboard_controller_1 = require("../controllers/dashboard.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const rbac_middleware_1 = require("../middlewares/rbac.middleware");
const router = (0, express_1.Router)();
router.get('/stats', auth_middleware_1.authMiddleware, rbac_middleware_1.requireAdmin, dashboard_controller_1.getStats);
exports.default = router;
//# sourceMappingURL=dashboard.routes.js.map