"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generate = generate;
exports.getByLead = getByLead;
exports.listAll = listAll;
const zod_1 = require("zod");
const aiContent_service_1 = require("../services/aiContent.service");
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
const generateSchema = zod_1.z.object({
    type: zod_1.z.enum(['email', 'whatsapp', 'follow_up', 'proposal']),
    outreachType: zod_1.z.enum(['outsourcing', 'client', 'partnership']).optional(),
    tone: zod_1.z.enum(['professional', 'friendly', 'formal', 'casual']).optional(),
    language: zod_1.z.string().optional(),
    subject: zod_1.z.string().optional(),
    instructions: zod_1.z.string().max(500).optional(),
    leadId: zod_1.z.string().optional(),
    analyze: zod_1.z.boolean().optional(), // run company research + growth assessment
    scrapeWebsite: zod_1.z.boolean().optional(), // fetch & read the website URL before generating
    leadContext: leadContextSchema,
});
async function generate(req, res, next) {
    try {
        const input = generateSchema.parse(req.body);
        const result = await (0, aiContent_service_1.generateContent)({
            ...input,
            createdBy: String(req.user._id),
        });
        res.json({ success: true, data: result });
    }
    catch (err) {
        next(err);
    }
}
async function getByLead(req, res, next) {
    try {
        const data = await (0, aiContent_service_1.getAiContentByLead)(req.params.leadId);
        res.json({ success: true, total: data.length, data });
    }
    catch (err) {
        next(err);
    }
}
async function listAll(req, res, next) {
    try {
        const { leadId, type, createdBy } = req.query;
        const data = await (0, aiContent_service_1.listAiContent)({
            leadId: leadId,
            type: type,
            createdBy: createdBy,
        });
        res.json({ success: true, total: data.length, data });
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=aiContent.controller.js.map