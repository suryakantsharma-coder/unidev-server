import { ConversationStatus } from '../models/Conversation.model';
import { MessageDirection, MessageType } from '../models/Message.model';
import { Types } from 'mongoose';
export declare function findOrCreateConversation(contactId: string): Promise<import("mongoose").Document<unknown, {}, import("../models/Conversation.model").IConversation, {}, {}> & import("../models/Conversation.model").IConversation & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}>;
export declare function listConversations(filters: {
    status?: ConversationStatus;
    assignedAgent?: string;
    page?: number;
    limit?: number;
}): Promise<{
    conversations: (import("mongoose").FlattenMaps<import("../models/Conversation.model").IConversation> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    })[];
    total: number;
    page: number;
    limit: number;
    pages: number;
}>;
export declare function getConversation(id: string): Promise<import("mongoose").Document<unknown, {}, import("../models/Conversation.model").IConversation, {}, {}> & import("../models/Conversation.model").IConversation & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}>;
export declare function updateConversationStatus(id: string, status: ConversationStatus): Promise<import("mongoose").Document<unknown, {}, import("../models/Conversation.model").IConversation, {}, {}> & import("../models/Conversation.model").IConversation & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}>;
export declare function assignConversation(id: string, agentId: string): Promise<import("mongoose").Document<unknown, {}, import("../models/Conversation.model").IConversation, {}, {}> & import("../models/Conversation.model").IConversation & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}>;
export declare function listMessages(conversationId: string, page?: number, limit?: number): Promise<{
    messages: (import("mongoose").FlattenMaps<import("../models/Message.model").IMessage> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    })[];
    total: number;
    page: number;
    limit: number;
}>;
export declare function saveMessage(data: {
    conversationId: string;
    contactId: string;
    direction: MessageDirection;
    type: MessageType;
    content: string;
    waMessageId?: string;
    sentBy?: string;
    templateName?: string;
    mediaUrl?: string;
}): Promise<import("mongoose").Document<unknown, {}, import("../models/Message.model").IMessage, {}, {}> & import("../models/Message.model").IMessage & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}>;
/** Update message delivery/read status from webhook events */
export declare function updateMessageStatus(waMessageId: string, status: 'delivered' | 'read' | 'failed', failureReason?: string): Promise<(import("mongoose").Document<unknown, {}, import("../models/Message.model").IMessage, {}, {}> & import("../models/Message.model").IMessage & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}) | null>;
//# sourceMappingURL=conversation.service.d.ts.map