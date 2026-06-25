"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.importLeads = importLeads;
exports.getJob = getJob;
exports.listJobs = listJobs;
const leadImport_service_1 = require("../services/leadImport.service");
const ALLOWED_MIME_TYPES = new Set([
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'application/vnd.ms-excel', // .xls
    'text/csv',
    'application/csv',
    'text/plain', // some clients send CSV as text/plain
]);
const ALLOWED_EXTENSIONS = new Set(['xlsx', 'xls', 'csv']);
async function importLeads(req, res, next) {
    try {
        const file = req.file;
        if (!file) {
            res.status(400).json({ success: false, message: 'No file uploaded. Use multipart/form-data with field name "file".' });
            return;
        }
        const ext = file.originalname.split('.').pop()?.toLowerCase() ?? '';
        if (!ALLOWED_EXTENSIONS.has(ext) && !ALLOWED_MIME_TYPES.has(file.mimetype)) {
            res.status(400).json({ success: false, message: 'Unsupported file type. Upload .xlsx, .xls, or .csv.' });
            return;
        }
        const createdBy = String(req.user._id);
        const categoryId = req.body.categoryId;
        const result = await (0, leadImport_service_1.importLeadsFromBuffer)(file.buffer, file.originalname, createdBy, categoryId);
        res.json({ success: true, data: result });
    }
    catch (err) {
        next(err);
    }
}
async function getJob(req, res, next) {
    try {
        const job = await (0, leadImport_service_1.getImportJob)(req.params.jobId);
        res.json({ success: true, data: job });
    }
    catch (err) {
        next(err);
    }
}
async function listJobs(req, res, next) {
    try {
        const jobs = await (0, leadImport_service_1.listImportJobs)();
        res.json({ success: true, data: jobs });
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=leadImport.controller.js.map