"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const followUp_controller_1 = require("../controllers/followUp.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const rbac_middleware_1 = require("../middlewares/rbac.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authMiddleware, rbac_middleware_1.requireAgent);
router.post('/', followUp_controller_1.create);
router.get('/', followUp_controller_1.list); // ?leadId= ?contact= ?status= ?dateFrom= ?dateTo= ?dueToday=
router.get('/lead/:leadId', followUp_controller_1.getByLead); // all follow-ups for a specific lead
router.get('/:id', followUp_controller_1.getOne);
router.patch('/:id', followUp_controller_1.update);
router.delete('/:id', followUp_controller_1.remove);
exports.default = router;
//# sourceMappingURL=followUp.routes.js.map