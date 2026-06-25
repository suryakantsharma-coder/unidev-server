"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const category_controller_1 = require("../controllers/category.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const rbac_middleware_1 = require("../middlewares/rbac.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authMiddleware);
router.get('/', rbac_middleware_1.requireAgent, category_controller_1.list);
router.get('/:id', rbac_middleware_1.requireAgent, category_controller_1.getOne);
router.post('/', rbac_middleware_1.requireAdmin, category_controller_1.create);
router.patch('/:id', rbac_middleware_1.requireAdmin, category_controller_1.update);
router.delete('/:id', rbac_middleware_1.requireAdmin, category_controller_1.remove);
exports.default = router;
//# sourceMappingURL=category.routes.js.map