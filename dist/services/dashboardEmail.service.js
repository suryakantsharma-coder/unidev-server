"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendDashboardEmail = sendDashboardEmail;
exports.listSentEmails = listSentEmails;
exports.getSentEmail = getSentEmail;
const nodemailer_1 = __importDefault(require("nodemailer"));
const env_1 = require("../config/env");
const SentEmail_model_1 = require("../models/SentEmail.model");
function createMailtrapTransport() {
    return nodemailer_1.default.createTransport({
        host: env_1.env.MAILTRAP_HOST,
        port: env_1.env.MAILTRAP_PORT,
        auth: {
            user: env_1.env.MAILTRAP_USER,
            pass: env_1.env.MAILTRAP_PASS,
        },
    });
}
async function sendDashboardEmail(input) {
    const from = env_1.env.MAILTRAP_FROM;
    const transporter = createMailtrapTransport();
    let status = 'sent';
    let errorMessage;
    try {
        await transporter.sendMail({
            from,
            to: input.to.join(', '),
            cc: input.cc?.join(', '),
            bcc: input.bcc?.join(', '),
            subject: input.subject,
            html: input.body,
            text: input.body.replace(/<[^>]*>/g, ''),
        });
    }
    catch (err) {
        status = 'failed';
        errorMessage = err instanceof Error ? err.message : String(err);
    }
    // Always persist a copy — even failures are logged for debugging
    const record = await SentEmail_model_1.SentEmail.create({
        from,
        to: input.to,
        cc: input.cc,
        bcc: input.bcc,
        subject: input.subject,
        body: input.body,
        status,
        errorMessage,
        sentBy: input.sentBy,
        leadId: input.leadId,
        sentAt: new Date(),
    });
    if (status === 'failed') {
        throw Object.assign(new Error(`Email delivery failed: ${errorMessage}`), { statusCode: 502, logId: String(record._id) });
    }
    return record;
}
async function listSentEmails(filters) {
    const query = {};
    if (filters.sentBy)
        query.sentBy = filters.sentBy;
    if (filters.leadId)
        query.leadId = filters.leadId;
    if (filters.status)
        query.status = filters.status;
    if (filters.dateFrom || filters.dateTo) {
        const range = {};
        if (filters.dateFrom)
            range.$gte = new Date(filters.dateFrom);
        if (filters.dateTo)
            range.$lte = new Date(filters.dateTo);
        query.sentAt = range;
    }
    const page = Math.max(1, filters.page ?? 1);
    const limit = Math.min(100, filters.limit ?? 20);
    const skip = (page - 1) * limit;
    const [emails, total] = await Promise.all([
        SentEmail_model_1.SentEmail.find(query)
            .populate('sentBy', 'name email')
            .sort({ sentAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        SentEmail_model_1.SentEmail.countDocuments(query),
    ]);
    return { emails, total, page, limit, pages: Math.ceil(total / limit) };
}
async function getSentEmail(id) {
    const email = await SentEmail_model_1.SentEmail.findById(id).populate('sentBy', 'name email');
    if (!email)
        throw Object.assign(new Error('Email record not found'), { statusCode: 404 });
    return email;
}
//# sourceMappingURL=dashboardEmail.service.js.map