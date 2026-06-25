"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.startSequence = startSequence;
exports.listSequences = listSequences;
exports.getSequence = getSequence;
exports.cancelSequence = cancelSequence;
exports.listProgress = listProgress;
exports.getProgress = getProgress;
exports.getSequencesByLead = getSequencesByLead;
const zod_1 = require("zod");
const seqService = __importStar(require("../services/emailSequence.service"));
const leadContextSchema = zod_1.z.object({
    businessName: zod_1.z.string().optional(),
    contactPerson: zod_1.z.string().optional(),
    city: zod_1.z.string().optional(),
    state: zod_1.z.string().optional(),
    country: zod_1.z.string().optional(),
    phone: zod_1.z.string().optional(),
    website: zod_1.z.string().optional(),
    categoryName: zod_1.z.string().optional(),
    companySize: zod_1.z.string().optional(),
    position: zod_1.z.string().optional(),
    techStack: zod_1.z.string().optional(),
    businessInfo: zod_1.z.string().optional(),
    painPoints: zod_1.z.string().optional(),
    description: zod_1.z.string().optional(),
    senderName: zod_1.z.string().optional(),
    senderCompany: zod_1.z.string().optional(),
    offerSummary: zod_1.z.string().optional(),
});
const startSchema = zod_1.z.object({
    leadId: zod_1.z.string().optional(),
    to: zod_1.z.array(zod_1.z.string().email()).min(1),
    cc: zod_1.z.array(zod_1.z.string().email()).optional(),
    subject: zod_1.z.string().min(1).max(500),
    body: zod_1.z.string().min(1),
    tone: zod_1.z.enum(['professional', 'friendly', 'formal', 'casual']).optional(),
    language: zod_1.z.string().optional(),
    leadContext: leadContextSchema,
});
async function startSequence(req, res, next) {
    try {
        const input = startSchema.parse(req.body);
        const seq = await seqService.startSequence({
            ...input,
            createdBy: String(req.user._id),
        });
        res.status(201).json({
            success: true,
            message: 'Email sequence started. Follow-ups are scheduled automatically.',
            sequenceId: String(seq._id),
            schedule: seq.steps.map(s => ({
                step: s.stepNumber,
                label: s.label,
                scheduledAt: s.scheduledAt,
                subject: s.subject,
            })),
        });
    }
    catch (err) {
        next(err);
    }
}
async function listSequences(req, res, next) {
    try {
        const { leadId, status, createdBy, page, limit } = req.query;
        const result = await seqService.listSequences({
            leadId: leadId,
            status: status,
            createdBy: createdBy,
            page: page ? parseInt(String(page)) : undefined,
            limit: limit ? parseInt(String(limit)) : undefined,
        });
        res.json({ success: true, ...result });
    }
    catch (err) {
        next(err);
    }
}
async function getSequence(req, res, next) {
    try {
        const seq = await seqService.getSequence(req.params.id);
        if (!seq) {
            res.status(404).json({ success: false, message: 'Sequence not found' });
            return;
        }
        res.json({ success: true, data: seq });
    }
    catch (err) {
        next(err);
    }
}
async function cancelSequence(req, res, next) {
    try {
        const seq = await seqService.cancelSequence(req.params.id);
        res.json({ success: true, message: 'Sequence cancelled. All pending emails skipped.', data: seq });
    }
    catch (err) {
        next(err);
    }
}
async function listProgress(req, res, next) {
    try {
        const { status, leadId, createdBy, page, limit } = req.query;
        const result = await seqService.listProgress({
            status: status,
            leadId: leadId,
            createdBy: createdBy,
            page: page ? parseInt(String(page)) : undefined,
            limit: limit ? parseInt(String(limit)) : undefined,
        });
        res.json({ success: true, ...result });
    }
    catch (err) {
        next(err);
    }
}
async function getProgress(req, res, next) {
    try {
        const data = await seqService.getProgressById(req.params.id);
        res.json({ success: true, data });
    }
    catch (err) {
        next(err);
    }
}
async function getSequencesByLead(req, res, next) {
    try {
        const sequences = await seqService.getSequencesByLead(req.params.leadId);
        // Flatten to a timeline view: each step as its own entry
        const timeline = sequences.flatMap(seq => seq.steps.map(step => ({
            sequenceId: String(seq._id),
            sequenceStatus: seq.status,
            createdBy: seq.createdBy,
            step: step.stepNumber,
            label: step.label,
            subject: step.subject,
            body: step.body,
            status: step.status,
            scheduledAt: step.scheduledAt,
            sentAt: step.sentAt ?? null,
            errorMessage: step.errorMessage ?? null,
        })));
        res.json({ success: true, total: timeline.length, data: timeline });
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=emailSequence.controller.js.map