import { Document, Schema, model, Types } from 'mongoose';

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

const messageSchema = new Schema<IMessage>(
  {
    conversation: { type: Schema.Types.ObjectId, ref: 'Conversation', required: true },
    contact: { type: Schema.Types.ObjectId, ref: 'Contact', required: true },
    direction: { type: String, enum: ['inbound', 'outbound'], required: true },
    type: {
      type: String,
      enum: ['text', 'image', 'document', 'template', 'audio', 'video'],
      default: 'text',
    },
    content: { type: String, required: true },
    waMessageId: { type: String, index: true },
    status: {
      type: String,
      enum: ['sent', 'delivered', 'read', 'failed', 'received'],
      default: 'sent',
    },
    templateName: { type: String },
    mediaUrl: { type: String },
    sentBy: { type: Schema.Types.ObjectId, ref: 'User' },
    failureReason: { type: String },
    statusUpdatedAt: { type: Date },
  },
  { timestamps: true }
);

messageSchema.index({ conversation: 1, createdAt: 1 });
messageSchema.index({ waMessageId: 1 });

export const Message = model<IMessage>('Message', messageSchema);
