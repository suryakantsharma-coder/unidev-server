"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const conversation_controller_1 = require("../controllers/conversation.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const rbac_middleware_1 = require("../middlewares/rbac.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authMiddleware, rbac_middleware_1.requireAgent);
router.get('/', conversation_controller_1.list);
router.get('/:id', conversation_controller_1.getOne);
router.patch('/:id/status', conversation_controller_1.updateStatus);
router.patch('/:id/assign', conversation_controller_1.assign);
router.get('/:id/messages', conversation_controller_1.getMessages);
exports.default = router;
//# sourceMappingURL=conversation.routes.js.map