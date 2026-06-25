import { Document, Schema, model, Types } from 'mongoose';

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

const conversationSchema = new Schema<IConversation>(
  {
    contact:       { type: Schema.Types.ObjectId, ref: 'Contact', required: true },
    leadId:        { type: Schema.Types.ObjectId, ref: 'Lead' },
    assignedAgent: { type: Schema.Types.ObjectId, ref: 'User' },
    status: {
      type: String,
      enum: ['open', 'pending', 'closed'],
      default: 'open',
    },
    lastMessage:    { type: String },
    lastMessageAt:  { type: Date },
    unreadCount:    { type: Number, default: 0 },
  },
  { timestamps: true }
);

conversationSchema.index({ contact: 1 });
conversationSchema.index({ leadId: 1 });
conversationSchema.index({ status: 1 });
conversationSchema.index({ assignedAgent: 1 });
conversationSchema.index({ lastMessageAt: -1 });

export const Conversation = model<IConversation>('Conversation', conversationSchema);
