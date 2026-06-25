"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const chat_controller_1 = require("../controllers/chat.controller");
const validate_middleware_1 = require("../middlewares/validate.middleware");
const router = (0, express_1.Router)();
router.post('/input', validate_middleware_1.validateChatInput, chat_controller_1.chatInput);
router.post('/output', validate_middleware_1.validateChatInput, chat_controller_1.chatOutput);
exports.default = router;
//# sourceMappingURL=chat.routes.js.map