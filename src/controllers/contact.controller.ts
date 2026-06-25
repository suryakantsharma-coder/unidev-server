import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as contactService from '../services/contact.service';

const contactSchema = z.object({
  name: z.string().min(1).max(200),
  phone: z.string().min(7).max(20),
  email: z.string().email().optional(),
  tags: z.array(z.string()).optional(),
  notes: z.string().max(2000).optional(),
  assignedAgent: z.string().optional(),
});

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const input = contactSchema.parse(req.body);
    const contact = await contactService.createContact(input);
    res.status(201).json({ success: true, data: contact });
  } catch (err) {
    next(err);
  }
}

export async function list(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { assignedAgent, tags, search, page, limit } = req.query;
    const result = await contactService.listContacts({
      assignedAgent: assignedAgent as string,
      tags: tags ? String(tags).split(',') : undefined,
      search: search as string,
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
    const contact = await contactService.getContact(req.params.id);
    res.json({ success: true, data: contact });
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const input = contactSchema.partial().parse(req.body);
    const contact = await contactService.updateContact(req.params.id, input);
    res.json({ success: true, data: contact });
  } catch (err) {
    next(err);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await contactService.deleteContact(req.params.id);
    res.json({ success: true, message: 'Contact deleted' });
  } catch (err) {
    next(err);
  }
}
