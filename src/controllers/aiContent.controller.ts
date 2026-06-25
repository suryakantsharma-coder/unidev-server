import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { generateContent, getAiContentByLead, listAiContent } from '../services/aiContent.service';

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

const generateSchema = z.object({
  type:          z.enum(['email', 'whatsapp', 'follow_up', 'proposal']),
  outreachType:  z.enum(['outsourcing', 'client', 'partnership']).optional(),
  tone:          z.enum(['professional', 'friendly', 'formal', 'casual']).optional(),
  language:      z.string().optional(),
  subject:       z.string().optional(),
  instructions:  z.string().max(500).optional(),
  leadId:        z.string().optional(),
  analyze:       z.boolean().optional(),       // run company research + growth assessment
  scrapeWebsite: z.boolean().optional(),       // fetch & read the website URL before generating
  leadContext:   leadContextSchema,
});

export async function generate(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const input  = generateSchema.parse(req.body);
    const result = await generateContent({
      ...input,
      createdBy: String(req.user!._id),
    });
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function getByLead(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await getAiContentByLead(req.params.leadId);
    res.json({ success: true, total: data.length, data });
  } catch (err) {
    next(err);
  }
}

export async function listAll(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { leadId, type, createdBy } = req.query;
    const data = await listAiContent({
      leadId:    leadId as string,
      type:      type as 'email' | 'whatsapp' | 'follow_up' | 'proposal',
      createdBy: createdBy as string,
    });
    res.json({ success: true, total: data.length, data });
  } catch (err) {
    next(err);
  }
}
