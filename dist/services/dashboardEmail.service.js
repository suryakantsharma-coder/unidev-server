"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendDashboardEmail = sendDashboardEmail;
exports.listSentEmails = listSentEmails;
exports.getSentEmail = getSentEmail;
const env_1 = require("../config/env");
const SentEmail_model_1 = require("../models/SentEmail.model");
async function sendViaMailtrapApi(opts) {
    const toAddresses = opts.to.map(e => ({ email: e }));
    const ccAddresses = opts.cc?.map(e => ({ email: e }));
    const bccAddresses = opts.bcc?.map(e => ({ email: e }));
    const body = {
        from: { email: opts.from },
        to: toAddresses,
        subject: opts.subject,
        html: opts.html,
        text: opts.text,
    };
    if (ccAddresses?.length)
        body.cc = ccAddresses;
    if (bccAddresses?.length)
        body.bcc = bccAddresses;
    const res = await fetch('https://send.api.mailtrap.io/api/send', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${env_1.env.MAILTRAP_API_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Mailtrap API ${res.status}: ${text}`);
    }
}
async function sendDashboardEmail(input) {
    const from = env_1.env.MAILTRAP_FROM;
    let status = 'sent';
    let errorMessage;
    try {
        await sendViaMailtrapApi({
            from,
            to: input.to,
            cc: input.cc,
            bcc: input.bcc,
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