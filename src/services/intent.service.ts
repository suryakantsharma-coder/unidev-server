import { ChatMessagePayload } from '../types/chat.types';

/**
 * Optional intent detection / preprocessing for messages.
 * Can be extended for routing or system prompt selection.
 */
export function getConversationContext(messages: ChatMessagePayload[]): {
  lastUserMessage: string | null;
  messageCount: number;
} {
  const lastUser = [...messages].reverse().find((m) => m.role === 'user');
  return {
    lastUserMessage: lastUser?.content ?? null,
    messageCount: messages.length,
  };
}
