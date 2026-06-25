import nodemailer from 'nodemailer';
import { env } from '../config/env';
import { SentEmail } from '../models/SentEmail.model';

export interface SendEmailInput {
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  body: string;
  sentBy: string;
  leadId?: string;
}

function createMailtrapTransport() {
  return nodemailer.createTransport({
    host: env.MAILTRAP_HOST,
    port: env.MAILTRAP_PORT,
    auth: {
      user: env.MAILTRAP_USER,
      pass: env.MAILTRAP_PASS,
    },
  });
}

export async function sendDashboardEmail(input: SendEmailInput) {
  const from = env.MAILTRAP_FROM;
  const transporter = createMailtrapTransport();

  let status: 'sent' | 'failed' = 'sent';
  let errorMessage: string | undefined;

  try {
    await transporter.sendMail({
      from,
      to:      input.to.join(', '),
      cc:      input.cc?.join(', '),
      bcc:     input.bcc?.join(', '),
      subject: input.subject,
      html:    input.body,
      text:    input.body.replace(/<[^>]*>/g, ''),
    });
  } catch (err) {
    status = 'failed';
    errorMessage = err instanceof Error ? err.message : String(err);
  }

  // Always persist a copy — even failures are logged for debugging
  const record = await SentEmail.create({
    from,
    to:           input.to,
    cc:           input.cc,
    bcc:          input.bcc,
    subject:      input.subject,
    body:         input.body,
    status,
    errorMessage,
    sentBy:       input.sentBy,
    leadId:       input.leadId,
    sentAt:       new Date(),
  });

  if (status === 'failed') {
    throw Object.assign(
      new Error(`Email delivery failed: ${errorMessage}`),
      { statusCode: 502, logId: String(record._id) }
    );
  }

  return record;
}

export async function listSentEmails(filters: {
  sentBy?: string;
  leadId?: string;
  status?: 'sent' | 'failed';
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}) {
  const query: Record<string, unknown> = {};

  if (filters.sentBy) query.sentBy = filters.sentBy;
  if (filters.leadId) query.leadId = filters.leadId;
  if (filters.status) query.status = filters.status;

  if (filters.dateFrom || filters.dateTo) {
    const range: Record<string, Date> = {};
    if (filters.dateFrom) range.$gte = new Date(filters.dateFrom);
    if (filters.dateTo)   range.$lte = new Date(filters.dateTo);
    query.sentAt = range;
  }

  const page  = Math.max(1, filters.page ?? 1);
  const limit = Math.min(100, filters.limit ?? 20);
  const skip  = (page - 1) * limit;

  const [emails, total] = await Promise.all([
    SentEmail.find(query)
      .populate('sentBy', 'name email')
      .sort({ sentAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    SentEmail.countDocuments(query),
  ]);

  return { emails, total, page, limit, pages: Math.ceil(total / limit) };
}

export async function getSentEmail(id: string) {
  const email = await SentEmail.findById(id).populate('sentBy', 'name email');
  if (!email) throw Object.assign(new Error('Email record not found'), { statusCode: 404 });
  return email;
}
