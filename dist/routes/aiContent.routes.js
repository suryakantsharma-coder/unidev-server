"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const aiContent_controller_1 = require("../controllers/aiContent.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const rbac_middleware_1 = require("../middlewares/rbac.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authMiddleware, rbac_middleware_1.requireAgent);
router.post('/generate', aiContent_controller_1.generate); // generate + save
router.post('/analyze', aiContent_controller_1.analyze); // pattern analysis & suggestions
router.post('/chat', aiContent_controller_1.chat); // conversational assistant
router.get('/', aiContent_controller_1.listAll); // list all (filter by leadId, type, createdBy)
router.get('/lead/:leadId', aiContent_controller_1.getByLead); // all AI content for a specific lead
exports.default = router;
//# sourceMappingURL=aiContent.routes.js.map