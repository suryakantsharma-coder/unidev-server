import { Contact, IContact } from '../models/Contact.model';
import { Types } from 'mongoose';

export interface ContactInput {
  name: string;
  phone: string;
  email?: string;
  tags?: string[];
  notes?: string;
  assignedAgent?: string;
}

export async function createContact(input: ContactInput): Promise<IContact> {
  const existing = await Contact.findOne({ phone: input.phone });
  if (existing) throw Object.assign(new Error('Contact with this phone already exists'), { statusCode: 409 });
  return Contact.create(input);
}

export async function listContacts(filters: {
  assignedAgent?: string;
  tags?: string[];
  search?: string;
  page?: number;
  limit?: number;
}) {
  const query: Record<string, unknown> = {};
  if (filters.assignedAgent) query.assignedAgent = new Types.ObjectId(filters.assignedAgent);
  if (filters.tags?.length) query.tags = { $in: filters.tags };
  if (filters.search) {
    query.$or = [
      { name: { $regex: filters.search, $options: 'i' } },
      { phone: { $regex: filters.search, $options: 'i' } },
      { email: { $regex: filters.search, $options: 'i' } },
    ];
  }

  const page = Math.max(1, filters.page ?? 1);
  const limit = Math.min(100, filters.limit ?? 20);
  const skip = (page - 1) * limit;

  const [contacts, total] = await Promise.all([
    Contact.find(query).populate('assignedAgent', 'name email').skip(skip).limit(limit).lean(),
    Contact.countDocuments(query),
  ]);

  return { contacts, total, page, limit, pages: Math.ceil(total / limit) };
}

export async function getContact(id: string): Promise<IContact> {
  const contact = await Contact.findById(id).populate('assignedAgent', 'name email');
  if (!contact) throw Object.assign(new Error('Contact not found'), { statusCode: 404 });
  return contact;
}

export async function updateContact(id: string, input: Partial<ContactInput>): Promise<IContact> {
  const contact = await Contact.findByIdAndUpdate(id, input, { new: true, runValidators: true });
  if (!contact) throw Object.assign(new Error('Contact not found'), { statusCode: 404 });
  return contact;
}

export async function deleteContact(id: string): Promise<void> {
  const result = await Contact.findByIdAndDelete(id);
  if (!result) throw Object.assign(new Error('Contact not found'), { statusCode: 404 });
}

/** Find or create a contact by phone number — used by the webhook handler */
export async function findOrCreateByPhone(phone: string, name?: string): Promise<IContact> {
  let contact = await Contact.findOne({ phone });
  if (!contact) {
    contact = await Contact.create({ phone, name: name ?? phone });
  }
  return contact;
}
