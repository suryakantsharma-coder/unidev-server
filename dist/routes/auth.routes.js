"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const rbac_middleware_1 = require("../middlewares/rbac.middleware");
const router = (0, express_1.Router)();
// One-time setup — only works when no super_admin exists yet, then auto-disables itself
router.post('/setup', auth_controller_1.setup);
// Only super_admin can create new users (prevents open registration)
router.post('/register', auth_middleware_1.authMiddleware, rbac_middleware_1.requireSuperAdmin, auth_controller_1.register);
router.post('/login', auth_controller_1.login);
router.get('/me', auth_middleware_1.authMiddleware, auth_controller_1.me);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map