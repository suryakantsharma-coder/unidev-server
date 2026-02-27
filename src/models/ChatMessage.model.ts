import mongoose, { Schema, Document, Model } from 'mongoose';
import { ChatRole } from '../types/chat.types';

export interface IChatMessage extends Document {
  role: ChatRole;
  content: string;
  createdAt: Date;
}

const ChatMessageSchema = new Schema<IChatMessage>(
  {
    role: {
      type: String,
      enum: ['user', 'assistant'],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export const ChatMessage: Model<IChatMessage> =
  mongoose.models.ChatMessage ??
  mongoose.model<IChatMessage>('ChatMessage', ChatMessageSchema);
