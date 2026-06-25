import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as convService from '../services/conversation.service';

const statusSchema = z.object({
  status: z.enum(['open', 'pending', 'closed']),
});

const assignSchema = z.object({
  agentId: z.string(),
});

export async function list(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { status, assignedAgent, page, limit } = req.query;
    const result = await convService.listConversations({
      status: status as 'open' | 'pending' | 'closed' | undefined,
      assignedAgent: assignedAgent as string,
      page: page ? parseInt(String(page)) : undefined,
      limit: limit ? parseInt(String(limit)) : undefined,
    });
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}

export async function getOne(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const conv = await convService.getConversation(req.params.id);
    res.json({ success: true, data: conv });
  } catch (err) {
    next(err);
  }
}

export async function updateStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { status } = statusSchema.parse(req.body);
    const conv = await convService.updateConversationStatus(req.params.id, status);
    res.json({ success: true, data: conv });
  } catch (err) {
    next(err);
  }
}

export async function assign(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { agentId } = assignSchema.parse(req.body);
    const conv = await convService.assignConversation(req.params.id, agentId);
    res.json({ success: true, data: conv });
  } catch (err) {
    next(err);
  }
}

export async function getMessages(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { page, limit } = req.query;
    const result = await convService.listMessages(
      req.params.id,
      page ? parseInt(String(page)) : undefined,
      limit ? parseInt(String(limit)) : undefined
    );
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}
