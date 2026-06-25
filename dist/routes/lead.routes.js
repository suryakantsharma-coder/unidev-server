"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const lead_controller_1 = require("../controllers/lead.controller");
const leadImport_controller_1 = require("../controllers/leadImport.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const rbac_middleware_1 = require("../middlewares/rbac.middleware");
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB
});
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authMiddleware);
// File import (before /:id to avoid param clash)
router.post('/import', rbac_middleware_1.requireAdmin, upload.single('file'), leadImport_controller_1.importLeads);
router.get('/import/jobs', rbac_middleware_1.requireAdmin, leadImport_controller_1.listJobs);
router.get('/import/:jobId', rbac_middleware_1.requireAdmin, leadImport_controller_1.getJob);
// Bulk JSON insert & delete
router.post('/bulk', rbac_middleware_1.requireAgent, lead_controller_1.bulkCreate);
router.delete('/bulk', rbac_middleware_1.requireAdmin, lead_controller_1.bulkDelete);
// Search
router.get('/search', rbac_middleware_1.requireAgent, lead_controller_1.search);
// CRUD
router.get('/', rbac_middleware_1.requireAgent, lead_controller_1.list);
router.post('/', rbac_middleware_1.requireAgent, lead_controller_1.create);
router.get('/:id', rbac_middleware_1.requireAgent, lead_controller_1.getOne);
router.patch('/:id', rbac_middleware_1.requireAgent, lead_controller_1.update);
router.delete('/:id', rbac_middleware_1.requireAdmin, lead_controller_1.remove);
exports.default = router;
//# sourceMappingURL=lead.routes.js.map