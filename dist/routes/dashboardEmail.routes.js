"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const dashboardEmail_controller_1 = require("../controllers/dashboardEmail.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const rbac_middleware_1 = require("../middlewares/rbac.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authMiddleware);
router.post('/', rbac_middleware_1.requireAgent, dashboardEmail_controller_1.sendEmail);
router.get('/', rbac_middleware_1.requireAdmin, dashboardEmail_controller_1.listEmails);
router.get('/lead/:leadId', rbac_middleware_1.requireAgent, dashboardEmail_controller_1.getEmailsByLead); // all emails for a lead
router.get('/:id', rbac_middleware_1.requireAdmin, dashboardEmail_controller_1.getEmail);
exports.default = router;
//# sourceMappingURL=dashboardEmail.routes.js.map