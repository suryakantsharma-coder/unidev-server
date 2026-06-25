import { Document, Types } from 'mongoose';
export type ConversationStatus = 'open' | 'pending' | 'closed';
export interface IConversation extends Document {
    contact: Types.ObjectId;
    leadId?: Types.ObjectId;
    assignedAgent?: Types.ObjectId;
    status: ConversationStatus;
    lastMessage?: string;
    lastMessageAt?: Date;
    unreadCount: number;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Conversation: import("mongoose").Model<IConversation, {}, {}, {}, Document<unknown, {}, IConversation, {}, {}> & IConversation & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Conversation.model.d.ts.map