import { Document, Schema, model, Types } from 'mongoose';

export interface IAiContent extends Document {
  leadId?: Types.ObjectId;
  type: 'email' | 'whatsapp' | 'follow_up' | 'proposal';
  tone: string;
  language: string;
  subject?: string;
  body: string;
  createdBy: Types.ObjectId;
  createdAt: Date;
}

const aiContentSchema = new Schema<IAiContent>(
  {
    leadId:    { type: Schema.Types.ObjectId, ref: 'Lead' },
    type:      { type: String, enum: ['email', 'whatsapp', 'follow_up', 'proposal'], required: true },
    tone:      { type: String, required: true },
    language:  { type: String, required: true },
    subject:   { type: String },
    body:      { type: String, required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

aiContentSchema.index({ leadId: 1 });
aiContentSchema.index({ createdBy: 1 });
aiContentSchema.index({ createdAt: -1 });

export const AiContent = model<IAiContent>('AiContent', aiContentSchema);
