import { Conversation, ConversationStatus } from '../models/Conversation.model';
import { Message, MessageDirection, MessageType } from '../models/Message.model';
import { Types } from 'mongoose';

export async function findOrCreateConversation(contactId: string) {
  let conversation = await Conversation.findOne({
    contact: new Types.ObjectId(contactId),
    status: { $ne: 'closed' },
  });
  if (!conversation) {
    conversation = await Conversation.create({ contact: contactId, status: 'open' });
  }
  return conversation;
}

export async function listConversations(filters: {
  status?: ConversationStatus;
  assignedAgent?: string;
  page?: number;
  limit?: number;
}) {
  const query: Record<string, unknown> = {};
  if (filters.status) query.status = filters.status;
  if (filters.assignedAgent) query.assignedAgent = new Types.ObjectId(filters.assignedAgent);

  const page = Math.max(1, filters.page ?? 1);
  const limit = Math.min(100, filters.limit ?? 20);
  const skip = (page - 1) * limit;

  const [conversations, total] = await Promise.all([
    Conversation.find(query)
      .populate('contact', 'name phone email')
      .populate('assignedAgent', 'name email')
      .sort({ lastMessageAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Conversation.countDocuments(query),
  ]);

  return { conversations, total, page, limit, pages: Math.ceil(total / limit) };
}

export async function getConversation(id: string) {
  const conv = await Conversation.findById(id)
    .populate('contact', 'name phone email tags')
    .populate('assignedAgent', 'name email');
  if (!conv) throw Object.assign(new Error('Conversation not found'), { statusCode: 404 });
  return conv;
}

export async function updateConversationStatus(id: string, status: ConversationStatus) {
  const conv = await Conversation.findByIdAndUpdate(id, { status }, { new: true });
  if (!conv) throw Object.assign(new Error('Conversation not found'), { statusCode: 404 });
  return conv;
}

export async function assignConversation(id: string, agentId: string) {
  const conv = await Conversation.findByIdAndUpdate(
    id,
    { assignedAgent: new Types.ObjectId(agentId) },
    { new: true }
  );
  if (!conv) throw Object.assign(new Error('Conversation not found'), { statusCode: 404 });
  return conv;
}

export async function listMessages(
  conversationId: string,
  page = 1,
  limit = 50
) {
  const skip = (Math.max(1, page) - 1) * Math.min(100, limit);
  const [messages, total] = await Promise.all([
    Message.find({ conversation: new Types.ObjectId(conversationId) })
      .populate('sentBy', 'name')
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Message.countDocuments({ conversation: new Types.ObjectId(conversationId) }),
  ]);
  return { messages, total, page, limit };
}

export async function saveMessage(data: {
  conversationId: string;
  contactId: string;
  direction: MessageDirection;
  type: MessageType;
  content: string;
  waMessageId?: string;
  sentBy?: string;
  templateName?: string;
  mediaUrl?: string;
}) {
  const message = await Message.create({
    conversation: data.conversationId,
    contact: data.contactId,
    direction: data.direction,
    type: data.type,
    content: data.content,
    waMessageId: data.waMessageId,
    status: data.direction === 'inbound' ? 'received' : 'sent',
    sentBy: data.sentBy,
    templateName: data.templateName,
    mediaUrl: data.mediaUrl,
  });

  // Keep conversation summary up to date
  await Conversation.findByIdAndUpdate(data.conversationId, {
    lastMessage: data.content.slice(0, 200),
    lastMessageAt: message.createdAt,
    ...(data.direction === 'inbound' ? { $inc: { unreadCount: 1 } } : {}),
  });

  return message;
}

/** Update message delivery/read status from webhook events */
export async function updateMessageStatus(
  waMessageId: string,
  status: 'delivered' | 'read' | 'failed',
  failureReason?: string
) {
  return Message.findOneAndUpdate(
    { waMessageId },
    { status, failureReason, statusUpdatedAt: new Date() },
    { new: true }
  );
}
