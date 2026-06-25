"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const webhook_controller_1 = require("../controllers/webhook.controller");
const router = (0, express_1.Router)();
// These routes are public — Meta calls them directly
router.get('/whatsapp', webhook_controller_1.verifyWebhook);
router.post('/whatsapp', webhook_controller_1.receiveWebhook);
exports.default = router;
//# sourceMappingURL=webhook.routes.js.map