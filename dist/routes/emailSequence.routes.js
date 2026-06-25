"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const emailSequence_controller_1 = require("../controllers/emailSequence.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const rbac_middleware_1 = require("../middlewares/rbac.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authMiddleware);
router.post('/', rbac_middleware_1.requireAgent, emailSequence_controller_1.startSequence); // start a new sequence
router.get('/progress', rbac_middleware_1.requireAgent, emailSequence_controller_1.listProgress); // all sequences with progress summary
router.get('/progress/:id', rbac_middleware_1.requireAgent, emailSequence_controller_1.getProgress); // one sequence progress detail
router.get('/', rbac_middleware_1.requireAdmin, emailSequence_controller_1.listSequences); // raw list (admin)
router.get('/lead/:leadId', rbac_middleware_1.requireAgent, emailSequence_controller_1.getSequencesByLead); // timeline for a lead
router.get('/:id', rbac_middleware_1.requireAgent, emailSequence_controller_1.getSequence); // raw sequence doc
router.patch('/:id/cancel', rbac_middleware_1.requireAgent, emailSequence_controller_1.cancelSequence); // stop sequence
exports.default = router;
//# sourceMappingURL=emailSequence.routes.js.map