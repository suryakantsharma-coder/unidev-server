import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as emailService from '../services/dashboardEmail.service';
import { startSequence } from '../services/emailSequence.service';
import { LeadContext } from '../services/aiContent.service';

const leadContextSchema = z.object({
  businessName:   z.string().optional(),
  contactPerson:  z.string().optional(),
  city:           z.string().optional(),
  state:          z.string().optional(),
  country:        z.string().optional(),
  phone:          z.string().optional(),
  website:        z.string().optional(),
  categoryName:   z.string().optional(),
  companySize:    z.string().optional(),
  position:       z.string().optional(),
  techStack:      z.string().optional(),
  businessInfo:   z.string().optional(),
  painPoints:     z.string().optional(),
  description:    z.string().optional(),
  senderName:     z.string().optional(),
  senderCompany:  z.string().optional(),
  offerSummary:   z.string().optional(),
}).optional();

const sendEmailSchema = z.object({
  to:             z.array(z.string().email()).min(1, 'At least one recipient required'),
  cc:             z.array(z.string().email()).optional(),
  bcc:            z.array(z.string().email()).optional(),
  subject:        z.string().min(1).max(500),
  body:           z.string().min(1).max(100_000),
  leadId:         z.string().optional(),
  autoFollowUp:   z.boolean().optional(),   // when true, schedules Day 3/7/14/21 follow-ups
  tone:           z.enum(['professional', 'friendly', 'formal', 'casual']).optional(),
  language:       z.string().optional(),
  leadContext:    leadContextSchema,
});

export async function sendEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const input  = sendEmailSchema.parse(req.body);
    const sentBy = String(req.user!._id);

    const record = await emailService.sendDashboardEmail({
      to:      input.to,
      cc:      input.cc,
      bcc:     input.bcc,
      subject: input.subject,
      body:    input.body,
      leadId:  input.leadId,
      sentBy,
    });

    // Auto follow-up: spin up a sequence in the background using the same email as step 1
    let sequence = null;
    if (input.autoFollowUp) {
      sequence = await startSequence({
        leadId:              input.leadId,
        to:                  input.to,
        cc:                  input.cc,
        subject:             input.subject,
        body:                input.body,
        tone:                input.tone,
        language:            input.language,
        leadContext:         (input.leadContext ?? {}) as LeadContext,
        createdBy:           sentBy,
        initialAlreadySent:  true, // initial email already sent above — don't resend
      });
    }

    res.status(201).json({
      success: true,
      data: record,
      ...(sequence ? {
        autoFollowUp: {
          enabled:    true,
          sequenceId: String(sequence._id),
          schedule:   sequence.steps.map(s => ({
            step:        s.stepNumber,
            label:       s.label,
            scheduledAt: s.scheduledAt,
          })),
        },
      } : { autoFollowUp: { enabled: false } }),
    });
  } catch (err) {
    next(err);
  }
}

export async function listEmails(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { sentBy, leadId, status, dateFrom, dateTo, page, limit } = req.query;
    const result = await emailService.listSentEmails({
      sentBy:   sentBy as string,
      leadId:   leadId as string,
      status:   status as 'sent' | 'failed',
      dateFrom: dateFrom as string,
      dateTo:   dateTo as string,
      page:     page  ? parseInt(String(page))  : undefined,
      limit:    limit ? parseInt(String(limit)) : undefined,
    });
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}

export async function getEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const email = await emailService.getSentEmail(req.params.id);
    res.json({ success: true, data: email });
  } catch (err) {
    next(err);
  }
}

export async function getEmailsByLead(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await emailService.listSentEmails({ leadId: req.params.leadId });
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}
