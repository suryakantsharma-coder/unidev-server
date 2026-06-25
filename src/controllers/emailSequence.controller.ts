import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as seqService from '../services/emailSequence.service';

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
});

const startSchema = z.object({
  leadId:      z.string().optional(),
  to:          z.array(z.string().email()).min(1),
  cc:          z.array(z.string().email()).optional(),
  subject:     z.string().min(1).max(500),
  body:        z.string().min(1),
  tone:        z.enum(['professional', 'friendly', 'formal', 'casual']).optional(),
  language:    z.string().optional(),
  leadContext: leadContextSchema,
});

export async function startSequence(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const input = startSchema.parse(req.body);
    const seq   = await seqService.startSequence({
      ...input,
      createdBy: String(req.user!._id),
    });
    res.status(201).json({
      success: true,
      message: 'Email sequence started. Follow-ups are scheduled automatically.',
      sequenceId: String(seq._id),
      schedule: seq.steps.map(s => ({
        step:        s.stepNumber,
        label:       s.label,
        scheduledAt: s.scheduledAt,
        subject:     s.subject,
      })),
    });
  } catch (err) {
    next(err);
  }
}

export async function listSequences(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { leadId, status, createdBy, page, limit } = req.query;
    const result = await seqService.listSequences({
      leadId:    leadId as string,
      status:    status as string,
      createdBy: createdBy as string,
      page:      page  ? parseInt(String(page))  : undefined,
      limit:     limit ? parseInt(String(limit)) : undefined,
    });
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}

export async function getSequence(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const seq = await seqService.getSequence(req.params.id);
    if (!seq) {
      res.status(404).json({ success: false, message: 'Sequence not found' });
      return;
    }
    res.json({ success: true, data: seq });
  } catch (err) {
    next(err);
  }
}

export async function cancelSequence(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const seq = await seqService.cancelSequence(req.params.id);
    res.json({ success: true, message: 'Sequence cancelled. All pending emails skipped.', data: seq });
  } catch (err) {
    next(err);
  }
}

export async function listProgress(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { status, leadId, createdBy, page, limit } = req.query;
    const result = await seqService.listProgress({
      status:    status    as string,
      leadId:    leadId    as string,
      createdBy: createdBy as string,
      page:      page  ? parseInt(String(page))  : undefined,
      limit:     limit ? parseInt(String(limit)) : undefined,
    });
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}

export async function getProgress(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await seqService.getProgressById(req.params.id);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function getSequencesByLead(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const sequences = await seqService.getSequencesByLead(req.params.leadId);
    // Flatten to a timeline view: each step as its own entry
    const timeline = sequences.flatMap(seq =>
      seq.steps.map(step => ({
        sequenceId:  String(seq._id),
        sequenceStatus: seq.status,
        createdBy:   seq.createdBy,
        step:        step.stepNumber,
        label:       step.label,
        subject:     step.subject,
        body:        step.body,
        status:      step.status,
        scheduledAt: step.scheduledAt,
        sentAt:      step.sentAt ?? null,
        errorMessage: step.errorMessage ?? null,
      }))
    );
    res.json({ success: true, total: timeline.length, data: timeline });
  } catch (err) {
    next(err);
  }
}
