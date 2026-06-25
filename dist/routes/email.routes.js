"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const email_controller_1 = require("../controllers/email.controller");
const validate_middleware_1 = require("../middlewares/validate.middleware");
const router = (0, express_1.Router)();
/** POST /api/email/test – send a test email (dummy lead) to EMAIL_TO */
router.post("/test", email_controller_1.sendTestEmail);
/** POST /api/email/lead – send a lead email with body { name, email, projectSummary, ... } */
router.post("/lead", validate_middleware_1.validateLeadBody, email_controller_1.sendLeadFromEndpoint);
exports.default = router;
//# sourceMappingURL=email.routes.js.map