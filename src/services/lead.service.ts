import { Types } from 'mongoose';
import { Lead, ILead, LeadStatus, LeadPriority } from '../models/Lead.model';

export interface LeadInput {
  title: string;
  categories?: string[];
  categoryName?: string;
  address?: string;
  neighborhood?: string;
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  countryCode?: string;
  website?: string;
  phone?: string;
  phoneUnformatted?: string;
  location?: { lat: number; lng: number };
  plusCode?: string;
  status?: LeadStatus;
  priority?: LeadPriority;
  notes?: string;
  metadata?: Record<string, unknown>;
}

export interface LeadFilters {
  search?: string;
  status?: LeadStatus;
  priority?: LeadPriority;
  city?: string;
  state?: string;
  countryCode?: string;
  categoryName?: string;
  category?: string;       // filter by Category ObjectId
  hasWebsite?: boolean;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export async function createLead(input: LeadInput): Promise<ILead> {
  return Lead.create(input);
}

export async function bulkCreateLeads(
  inputs: LeadInput[],
  categoryId?: string
): Promise<{
  inserted: number;
  duplicates: number;
  failed: number;
  errors: Array<{ index: number; title: string; reason: string }>;
}> {
  let inserted = 0;
  let duplicates = 0;
  let failed = 0;
  const errors: Array<{ index: number; title: string; reason: string }> = [];

  for (let i = 0; i < inputs.length; i++) {
    const item = inputs[i];
    try {
      // Deduplicate by phoneUnformatted or phone within this bulk operation
      const orConditions: Array<Record<string, unknown>> = [];
      if (item.phoneUnformatted) orConditions.push({ phoneUnformatted: item.phoneUnformatted });
      else if (item.phone) orConditions.push({ phone: item.phone });

      if (orConditions.length > 0) {
        const exists = await Lead.exists({ $or: orConditions });
        if (exists) {
          duplicates++;
          continue;
        }
      }

      // categoryId passed at upload level overrides any per-row category
      await Lead.create(categoryId ? { ...item, category: categoryId } : item);
      inserted++;
    } catch (err) {
      failed++;
      errors.push({
        index: i,
        title: item.title ?? '(unknown)',
        reason: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return { inserted, duplicates, failed, errors };
}

export async function listLeads(filters: LeadFilters) {
  const query: Record<string, unknown> = {};

  if (filters.search) {
    query.$text = { $search: filters.search };
  }
  if (filters.status)       query.status       = filters.status;
  if (filters.priority)     query.priority     = filters.priority;
  if (filters.city)         query.city         = { $regex: filters.city, $options: 'i' };
  if (filters.state)        query.state        = { $regex: filters.state, $options: 'i' };
  if (filters.countryCode)  query.countryCode  = filters.countryCode.toUpperCase();
  if (filters.categoryName) query.categoryName = { $regex: filters.categoryName, $options: 'i' };
  if (filters.category)     query.category = new Types.ObjectId(filters.category);

  if (filters.hasWebsite === true)  query.website = { $exists: true, $nin: ['', null] };
  if (filters.hasWebsite === false) query.$or = [{ website: { $exists: false } }, { website: '' }, { website: null }];

  if (filters.dateFrom || filters.dateTo) {
    const range: Record<string, Date> = {};
    if (filters.dateFrom) range.$gte = new Date(filters.dateFrom);
    if (filters.dateTo)   range.$lte = new Date(filters.dateTo);
    query.createdAt = range;
  }

  const page  = Math.max(1, filters.page ?? 1);
  const limit = Math.min(200, filters.limit ?? 20);
  const skip  = (page - 1) * limit;

  const sortField = filters.sortBy ?? 'createdAt';
  const sortDir   = filters.sortOrder === 'asc' ? 1 : -1;

  const [leads, total] = await Promise.all([
    Lead.find(query)
      .populate('category', 'name color')
      .sort({ [sortField]: sortDir })
      .skip(skip)
      .limit(limit)
      .lean(),
    Lead.countDocuments(query),
  ]);

  return {
    leads,
    total,
    page,
    limit,
    pages: Math.ceil(total / limit),
  };
}

export async function getLead(id: string): Promise<ILead> {
  const lead = await Lead.findById(id).populate('category', 'name color description');
  if (!lead) throw Object.assign(new Error('Lead not found'), { statusCode: 404 });
  return lead;
}

export async function updateLead(id: string, input: Partial<LeadInput>): Promise<ILead> {
  const lead = await Lead.findByIdAndUpdate(id, input, { new: true, runValidators: true })
    .populate('category', 'name color');
  if (!lead) throw Object.assign(new Error('Lead not found'), { statusCode: 404 });
  return lead;
}

// All fields allowed for targeted search
export const SEARCHABLE_FIELDS = [
  'title', 'phone', 'phoneUnformatted', 'city', 'state',
  'countryCode', 'categoryName', 'website', 'address',
  'neighborhood', 'street', 'postalCode', 'notes', 'plusCode',
] as const;

export type SearchableField = typeof SEARCHABLE_FIELDS[number];

export async function searchLeads(
  q: string,
  fields: SearchableField[] = [...SEARCHABLE_FIELDS],
  limit = 20
) {
  if (!q.trim()) return [];

  const regex = { $regex: q.trim(), $options: 'i' };

  const orConditions = fields.map((field) => ({ [field]: regex }));

  return Lead.find({ $or: orConditions })
    .populate('category', 'name color')
    .sort({ createdAt: -1 })
    .limit(Math.min(100, limit))
    .lean();
}

export async function deleteLead(id: string): Promise<void> {
  const lead = await Lead.findByIdAndDelete(id);
  if (!lead) throw Object.assign(new Error('Lead not found'), { statusCode: 404 });
}

export async function bulkDeleteLeads(ids: string[]): Promise<{ deleted: number; notFound: number }> {
  const result = await Lead.deleteMany({ _id: { $in: ids } });
  const deleted = result.deletedCount;
  const notFound = ids.length - deleted;
  return { deleted, notFound };
}
