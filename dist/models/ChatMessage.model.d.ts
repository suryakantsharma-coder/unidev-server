import { Document, Model } from 'mongoose';
import { ChatRole } from '../types/chat.types';
export interface IChatMessage extends Document {
    role: ChatRole;
    content: string;
    createdAt: Date;
}
export declare const ChatMessage: Model<IChatMessage>;
//# sourceMappingURL=ChatMessage.model.d.ts.map