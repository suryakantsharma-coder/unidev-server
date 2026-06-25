import { FollowUp, FollowUpStatus } from '../models/FollowUp.model';
import { Types } from 'mongoose';

export interface FollowUpInput {
  contact?:      string;
  leadId?:       string;
  assignedUser:  string;  // always resolved before reaching service
  scheduledAt:   Date;
  message:       string;
  notes?:        string;
}

export async function createFollowUp(input: FollowUpInput) {
  return FollowUp.create(input);
}

export async function getFollowUpsByLead(leadId: string) {
  return FollowUp.find({ leadId: new Types.ObjectId(leadId) })
    .populate('assignedUser', 'name email')
    .populate('leadId', 'title phone website')
    .sort({ scheduledAt: 1 })
    .lean();
}

export async function listFollowUps(filters: {
  assignedUser?: string;
  contact?: string;
  leadId?: string;
  status?: FollowUpStatus;
  dateFrom?: string;
  dateTo?: string;
  dueToday?: boolean;
  page?: number;
  limit?: number;
}) {
  const query: Record<string, unknown> = {};
  if (filters.assignedUser) query.assignedUser = new Types.ObjectId(filters.assignedUser);
  if (filters.contact)      query.contact      = new Types.ObjectId(filters.contact);
  if (filters.leadId)       query.leadId       = new Types.ObjectId(filters.leadId);
  if (filters.status)       query.status       = filters.status;

  if (filters.dateFrom || filters.dateTo) {
    const range: Record<string, Date> = {};
    if (filters.dateFrom) range.$gte = new Date(filters.dateFrom);
    if (filters.dateTo)   range.$lte = new Date(filters.dateTo);
    query.scheduledAt = range;
  }
  if (filters.dueToday) {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    query.scheduledAt = { $gte: start, $lte: end };
    query.status = 'pending';
  }

  const page = Math.max(1, filters.page ?? 1);
  const limit = Math.min(100, filters.limit ?? 20);
  const skip = (page - 1) * limit;

  const [followUps, total] = await Promise.all([
    FollowUp.find(query)
      .populate('contact', 'name phone')
      .populate('leadId', 'title phone website city')
      .populate('assignedUser', 'name email')
      .sort({ scheduledAt: 1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    FollowUp.countDocuments(query),
  ]);

  return { followUps, total, page, limit, pages: Math.ceil(total / limit) };
}

export async function getFollowUp(id: string) {
  const fu = await FollowUp.findById(id)
    .populate('contact', 'name phone email')
    .populate('leadId', 'title phone website city categoryName')
    .populate('assignedUser', 'name email');
  if (!fu) throw Object.assign(new Error('Follow-up not found'), { statusCode: 404 });
  return fu;
}

export async function updateFollowUp(id: string, input: Partial<FollowUpInput & { status: FollowUpStatus }>) {
  const update: Record<string, unknown> = { ...input };
  if (input.status === 'completed') update.completedAt = new Date();

  const fu = await FollowUp.findByIdAndUpdate(id, update, { new: true, runValidators: true });
  if (!fu) throw Object.assign(new Error('Follow-up not found'), { statusCode: 404 });
  return fu;
}

export async function deleteFollowUp(id: string) {
  const fu = await FollowUp.findByIdAndDelete(id);
  if (!fu) throw Object.assign(new Error('Follow-up not found'), { statusCode: 404 });
}

/** Count follow-ups due today across all users */
export async function countDueToday(): Promise<number> {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  return FollowUp.countDocuments({ scheduledAt: { $gte: start, $lte: end }, status: 'pending' });
}
