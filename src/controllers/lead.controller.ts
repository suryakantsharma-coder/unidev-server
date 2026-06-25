import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as leadService from '../services/lead.service';

const STATUSES   = ['New', 'Contacted', 'Proposal', 'Negotiation', 'Qualified', 'Won', 'Lost'] as const;
const PRIORITIES = ['high', 'medium', 'low'] as const;

const leadSchema = z.object({
  title:            z.string().min(1).max(500),
  categories:       z.array(z.string()).optional(),
  categoryName:     z.string().max(200).optional(),
  address:          z.string().max(1000).optional(),
  neighborhood:     z.string().max(300).optional(),
  street:           z.string().max(500).optional(),
  city:             z.string().max(100).optional(),
  state:            z.string().max(100).optional(),
  postalCode:       z.string().max(20).optional(),
  countryCode:      z.string().max(5).optional(),
  website:          z.string().url().optional().or(z.literal('')),
  phone:            z.string().max(30).optional(),
  phoneUnformatted: z.string().max(30).optional(),
  location:         z.object({ lat: z.number(), lng: z.number() }).optional(),
  plusCode:         z.string().max(20).optional(),
  status:           z.enum(STATUSES).optional(),
  priority:         z.enum(PRIORITIES).optional(),
  notes:            z.string().max(5000).optional(),
  metadata:         z.record(z.unknown()).optional(),
});

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const input = leadSchema.parse(req.body);
    const lead = await leadService.createLead(input);
    res.status(201).json({ success: true, data: lead });
  } catch (err) {
    next(err);
  }
}

const bulkCreateSchema = z.object({
  categoryId: z.string().optional(),
  leads: z.array(leadSchema).min(1).max(5000),
});

export async function bulkCreate(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { categoryId, leads } = bulkCreateSchema.parse(req.body);
    const result = await leadService.bulkCreateLeads(leads, categoryId);
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function list(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { search, status, priority, city, state, countryCode,
            categoryName, category, hasWebsite, dateFrom, dateTo, page, limit, sortBy, sortOrder } = req.query;

    const result = await leadService.listLeads({
      search:       search as string,
      status:       status as typeof STATUSES[number],
      priority:     priority as typeof PRIORITIES[number],
      city:         city as string,
      state:        state as string,
      countryCode:  countryCode as string,
      categoryName: categoryName as string,
      category:     category as string,
      hasWebsite:   hasWebsite === 'true' ? true : hasWebsite === 'false' ? false : undefined,
      dateFrom:     dateFrom as string,
      dateTo:       dateTo as string,
      page:         page  ? parseInt(String(page))  : undefined,
      limit:        limit ? parseInt(String(limit)) : undefined,
      sortBy:       sortBy as string,
      sortOrder:    sortOrder as 'asc' | 'desc',
    });

    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}

export async function getOne(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const lead = await leadService.getLead(req.params.id);
    res.json({ success: true, data: lead });
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const input = leadSchema.partial().parse(req.body);
    const lead = await leadService.updateLead(req.params.id, input);
    res.json({ success: true, data: lead });
  } catch (err) {
    next(err);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await leadService.deleteLead(req.params.id);
    res.json({ success: true, message: 'Lead deleted' });
  } catch (err) {
    next(err);
  }
}

export async function search(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const q     = String(req.query.q ?? '').trim();
    const limit = req.query.limit ? parseInt(String(req.query.limit)) : 20;

    if (!q) {
      res.status(400).json({ success: false, message: 'Query param "q" is required' });
      return;
    }

    // fields=title,phone,city  →  ['title', 'phone', 'city']
    // if not provided, search all fields
    let fields: leadService.SearchableField[] | undefined;
    if (req.query.fields) {
      const requested = String(req.query.fields).split(',').map((f) => f.trim());
      const invalid   = requested.filter((f) => !leadService.SEARCHABLE_FIELDS.includes(f as leadService.SearchableField));

      if (invalid.length > 0) {
        res.status(400).json({
          success: false,
          message: `Invalid field(s): ${invalid.join(', ')}`,
          allowedFields: leadService.SEARCHABLE_FIELDS,
        });
        return;
      }

      fields = requested as leadService.SearchableField[];
    }

    const results = await leadService.searchLeads(q, fields, limit);
    res.json({
      success: true,
      total: results.length,
      searchedFields: fields ?? leadService.SEARCHABLE_FIELDS,
      data: results,
    });
  } catch (err) {
    next(err);
  }
}

export async function bulkDelete(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { ids } = z.object({ ids: z.array(z.string()).min(1).max(1000) }).parse(req.body);
    const result = await leadService.bulkDeleteLeads(ids);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}
