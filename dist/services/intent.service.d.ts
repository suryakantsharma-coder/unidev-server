import { ChatMessagePayload } from '../types/chat.types';
/**
 * Optional intent detection / preprocessing for messages.
 * Can be extended for routing or system prompt selection.
 */
export declare function getConversationContext(messages: ChatMessagePayload[]): {
    lastUserMessage: string | null;
    messageCount: number;
};
//# sourceMappingURL=intent.service.d.ts.map