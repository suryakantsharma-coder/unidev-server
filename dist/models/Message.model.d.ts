import { Document, Types } from 'mongoose';
export type MessageDirection = 'inbound' | 'outbound';
export type MessageType = 'text' | 'image' | 'document' | 'template' | 'audio' | 'video';
export type MessageStatus = 'sent' | 'delivered' | 'read' | 'failed' | 'received';
export interface IMessage extends Document {
    conversation: Types.ObjectId;
    contact: Types.ObjectId;
    direction: MessageDirection;
    type: MessageType;
    content: string;
    /** WhatsApp message ID from Meta API */
    waMessageId?: string;
    status: MessageStatus;
    /** Template name if type === 'template' */
    templateName?: string;
    /** URL for media messages */
    mediaUrl?: string;
    sentBy?: Types.ObjectId;
    failureReason?: string;
    statusUpdatedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Message: import("mongoose").Model<IMessage, {}, {}, {}, Document<unknown, {}, IMessage, {}, {}> & IMessage & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Message.model.d.ts.map