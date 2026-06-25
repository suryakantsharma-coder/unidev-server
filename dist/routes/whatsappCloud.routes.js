"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const whatsappCloud_controller_1 = require("../controllers/whatsappCloud.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const rbac_middleware_1 = require("../middlewares/rbac.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authMiddleware, rbac_middleware_1.requireAdmin);
router.post('/send/text', whatsappCloud_controller_1.sendText);
router.post('/send/template', whatsappCloud_controller_1.sendTemplate);
router.post('/send/media', whatsappCloud_controller_1.sendMedia);
exports.default = router;
//# sourceMappingURL=whatsappCloud.routes.js.map