"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendLeadEmail = sendLeadEmail;
exports.sendTestLeadEmail = sendTestLeadEmail;
exports.sendVoiceLeadEmail = sendVoiceLeadEmail;
exports.sendVoiceTestLeadEmail = sendVoiceTestLeadEmail;
const nodemailer_1 = __importDefault(require("nodemailer"));
async function sendLeadEmail(lead, options) {
    const host = process.env.SMTP_HOST;
    const port = process.env.SMTP_PORT
        ? Number(process.env.SMTP_PORT)
        : undefined;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const from = process.env.EMAIL_FROM || "no-reply@unidevsolutions.in";
    const to = options?.to || process.env.EMAIL_TO || "hello@unidevsolutions.in";
    if (!host || !port || !user || !pass) {
        return;
    }
    const transporter = nodemailer_1.default.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
    });
    const prefix = options?.isTest ? "[TEST] " : "";
    const subject = options?.subject || `${prefix}New lead from chatbot: ${lead.name || "Unknown"}`;
    const lines = [
        "New lead captured from the Unidev chatbot:",
        "",
        `Name: ${lead.name}`,
        `Email: ${lead.email}`,
        `Company: ${lead.company || "-"}`,
        `Budget: ${lead.budget || "-"}`,
        `Timeline: ${lead.timeline || "-"}`,
        "",
        "Project Summary:",
        lead.projectSummary,
    ];
    await transporter.sendMail({
        from,
        to,
        subject,
        text: lines.join("\n"),
    });
}
/** Dummy lead data for test emails. */
const TEST_LEAD = {
    name: "Test User",
    email: "test@example.com",
    company: "Test Company",
    budget: "$5k–$10k",
    timeline: "2–3 months",
    projectSummary: "This is a test email from the Unidev chatbot to verify email delivery.",
};
/** Send a test lead email using the same flow as real leads (for "send test email" requests). */
async function sendTestLeadEmail() {
    await sendLeadEmail(TEST_LEAD, { isTest: true });
}
const VOICE_LEADS_TO = process.env.VOICE_LEADS_TO || "hello@unidevsolutions.in";
const VOICE_LEADS_SUBJECT = "voice agent leads";
/** Send voice-agent lead email to dedicated Unidev inbox. */
async function sendVoiceLeadEmail(lead) {
    await sendLeadEmail(lead, {
        to: VOICE_LEADS_TO,
        subject: VOICE_LEADS_SUBJECT,
    });
}
/** Send a test voice-agent lead email to dedicated Unidev inbox. */
async function sendVoiceTestLeadEmail() {
    await sendLeadEmail(TEST_LEAD, {
        isTest: true,
        to: VOICE_LEADS_TO,
        subject: VOICE_LEADS_SUBJECT,
    });
}
//# sourceMappingURL=email.service.js.map