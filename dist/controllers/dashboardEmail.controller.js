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
exports.sendEmail = sendEmail;
exports.listEmails = listEmails;
exports.getEmail = getEmail;
exports.getEmailsByLead = getEmailsByLead;
const zod_1 = require("zod");
const emailService = __importStar(require("../services/dashboardEmail.service"));
const emailSequence_service_1 = require("../services/emailSequence.service");
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
}).optional();
const sendEmailSchema = zod_1.z.object({
    to: zod_1.z.array(zod_1.z.string().email()).min(1, 'At least one recipient required'),
    cc: zod_1.z.array(zod_1.z.string().email()).optional(),
    bcc: zod_1.z.array(zod_1.z.string().email()).optional(),
    subject: zod_1.z.string().min(1).max(500),
    body: zod_1.z.string().min(1).max(100_000),
    leadId: zod_1.z.string().optional(),
    autoFollowUp: zod_1.z.boolean().optional(), // when true, schedules Day 3/7/14/21 follow-ups
    tone: zod_1.z.enum(['professional', 'friendly', 'formal', 'casual']).optional(),
    language: zod_1.z.string().optional(),
    leadContext: leadContextSchema,
});
async function sendEmail(req, res, next) {
    try {
        const input = sendEmailSchema.parse(req.body);
        const sentBy = String(req.user._id);
        const record = await emailService.sendDashboardEmail({
            to: input.to,
            cc: input.cc,
            bcc: input.bcc,
            subject: input.subject,
            body: input.body,
            leadId: input.leadId,
            sentBy,
        });
        // Respond immediately — don't wait for AI sequence generation
        res.status(201).json({
            success: true,
            data: record,
            autoFollowUp: { enabled: !!input.autoFollowUp, status: input.autoFollowUp ? 'scheduling' : 'disabled' },
        });
        // Auto follow-up: generate in background after response is sent (avoids timeout)
        if (input.autoFollowUp) {
            (0, emailSequence_service_1.startSequence)({
                leadId: input.leadId,
                to: input.to,
                cc: input.cc,
                subject: input.subject,
                body: input.body,
                tone: input.tone,
                language: input.language,
                leadContext: (input.leadContext ?? {}),
                createdBy: sentBy,
                initialAlreadySent: true,
            }).catch(err => {
                process.stderr.write(`[AutoFollowUp] Failed to create sequence: ${err}\n`);
            });
        }
    }
    catch (err) {
        next(err);
    }
}
async function listEmails(req, res, next) {
    try {
        const { sentBy, leadId, status, dateFrom, dateTo, page, limit } = req.query;
        const result = await emailService.listSentEmails({
            sentBy: sentBy,
            leadId: leadId,
            status: status,
            dateFrom: dateFrom,
            dateTo: dateTo,
            page: page ? parseInt(String(page)) : undefined,
            limit: limit ? parseInt(String(limit)) : undefined,
        });
        res.json({ success: true, ...result });
    }
    catch (err) {
        next(err);
    }
}
async function getEmail(req, res, next) {
    try {
        const email = await emailService.getSentEmail(req.params.id);
        res.json({ success: true, data: email });
    }
    catch (err) {
        next(err);
    }
}
async function getEmailsByLead(req, res, next) {
    try {
        const result = await emailService.listSentEmails({ leadId: req.params.leadId });
        res.json({ success: true, ...result });
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=dashboardEmail.controller.js.map