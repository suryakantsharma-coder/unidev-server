"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("../controllers/user.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const rbac_middleware_1 = require("../middlewares/rbac.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authMiddleware);
router.get('/', rbac_middleware_1.requireAdmin, user_controller_1.listUsers);
router.patch('/:id/role', rbac_middleware_1.requireSuperAdmin, user_controller_1.updateUserRole);
router.patch('/:id/deactivate', rbac_middleware_1.requireSuperAdmin, user_controller_1.deactivateUser);
exports.default = router;
//# sourceMappingURL=user.routes.js.map