import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as followUpService from '../services/followUp.service';

const followUpSchema = z.object({
  contact:      z.string().optional(),
  leadId:       z.string().optional(),
  assignedUser: z.string().optional(), // defaults to the logged-in user
  scheduledAt:  z.coerce.date(),
  message:      z.string().min(1).max(2000),
  notes:        z.string().max(2000).optional(),
});

const updateSchema = followUpSchema.partial().extend({
  status: z.enum(['pending', 'completed', 'cancelled', 'overdue']).optional(),
});

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const input = followUpSchema.parse(req.body);
    const fu = await followUpService.createFollowUp({
      ...input,
      assignedUser: input.assignedUser ?? String(req.user!._id),
    });
    res.status(201).json({ success: true, data: fu });
  } catch (err) {
    next(err);
  }
}

export async function list(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { assignedUser, contact, leadId, status, dateFrom, dateTo, dueToday, page, limit } = req.query;
    const result = await followUpService.listFollowUps({
      assignedUser: assignedUser as string,
      contact:      contact  as string,
      leadId:       leadId   as string,
      status:       status   as 'pending' | 'completed' | 'cancelled' | 'overdue' | undefined,
      dateFrom:     dateFrom as string,
      dateTo:       dateTo   as string,
      dueToday:     dueToday === 'true',
      page:  page  ? parseInt(String(page))  : undefined,
      limit: limit ? parseInt(String(limit)) : undefined,
    });
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}

export async function getByLead(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const followUps = await followUpService.getFollowUpsByLead(req.params.leadId);
    res.json({ success: true, total: followUps.length, data: followUps });
  } catch (err) {
    next(err);
  }
}

export async function getOne(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const fu = await followUpService.getFollowUp(req.params.id);
    res.json({ success: true, data: fu });
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const input = updateSchema.parse(req.body);
    const fu = await followUpService.updateFollowUp(req.params.id, input);
    res.json({ success: true, data: fu });
  } catch (err) {
    next(err);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await followUpService.deleteFollowUp(req.params.id);
    res.json({ success: true, message: 'Follow-up deleted' });
  } catch (err) {
    next(err);
  }
}
