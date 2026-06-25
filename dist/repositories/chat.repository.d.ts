import { ChatMessageDocument, ChatRole } from '../types/chat.types';
export declare function createMessage(role: ChatRole, content: string): Promise<ChatMessageDocument>;
export declare function createManyMessages(messages: Array<{
    role: ChatRole;
    content: string;
}>): Promise<ChatMessageDocument[]>;
//# sourceMappingURL=chat.repository.d.ts.map