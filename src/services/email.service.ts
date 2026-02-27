import nodemailer from "nodemailer";
import { LeadData } from "../types/chat.types";

export async function sendLeadEmail(
  lead: LeadData,
  options?: { isTest?: boolean },
): Promise<void> {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT
    ? Number(process.env.SMTP_PORT)
    : undefined;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.EMAIL_FROM || "no-reply@unidevsolutions.in";
  const to = process.env.EMAIL_TO || "hello@unidevsolutions.in";

  if (!host || !port || !user || !pass) {
    return;
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  const prefix = options?.isTest ? "[TEST] " : "";
  const subject = `${prefix}New lead from chatbot: ${lead.name || "Unknown"}`;

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
const TEST_LEAD: LeadData = {
  name: "Test User",
  email: "test@example.com",
  company: "Test Company",
  budget: "$5k–$10k",
  timeline: "2–3 months",
  projectSummary:
    "This is a test email from the Unidev chatbot to verify email delivery.",
};

/** Send a test lead email using the same flow as real leads (for "send test email" requests). */
export async function sendTestLeadEmail(): Promise<void> {
  await sendLeadEmail(TEST_LEAD, { isTest: true });
}
