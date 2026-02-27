import { ChatMessage } from '../models/ChatMessage.model';
import { ChatMessageDocument, ChatRole } from '../types/chat.types';

export async function createMessage(
  role: ChatRole,
  content: string
): Promise<ChatMessageDocument> {
  const doc = await ChatMessage.create({ role, content });
  return {
    role: doc.role as ChatRole,
    content: doc.content,
    createdAt: doc.createdAt,
  };
}

export async function createManyMessages(
  messages: Array<{ role: ChatRole; content: string }>
): Promise<ChatMessageDocument[]> {
  if (messages.length === 0) return [];
  const docs = await ChatMessage.insertMany(messages);
  return docs.map((d) => ({
    role: d.role as ChatRole,
    content: d.content,
    createdAt: d.createdAt,
  }));
}
