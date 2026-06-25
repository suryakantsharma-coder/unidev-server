"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const contact_controller_1 = require("../controllers/contact.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const rbac_middleware_1 = require("../middlewares/rbac.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authMiddleware);
router.get('/', rbac_middleware_1.requireAgent, contact_controller_1.list);
router.post('/', rbac_middleware_1.requireAgent, contact_controller_1.create);
router.get('/:id', rbac_middleware_1.requireAgent, contact_controller_1.getOne);
router.patch('/:id', rbac_middleware_1.requireAgent, contact_controller_1.update);
router.delete('/:id', rbac_middleware_1.requireAdmin, contact_controller_1.remove); // Only admins can delete contacts
exports.default = router;
//# sourceMappingURL=contact.routes.js.map