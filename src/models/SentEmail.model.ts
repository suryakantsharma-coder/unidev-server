import { Document, Schema, model, Types } from 'mongoose';

export type EmailStatus = 'sent' | 'failed';

export interface ISentEmail extends Document {
  from: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  body: string;
  status: EmailStatus;
  errorMessage?: string;
  sentBy: Types.ObjectId;
  leadId?: Types.ObjectId;
  sentAt: Date;
}

const sentEmailSchema = new Schema<ISentEmail>({
  from:         { type: String, required: true },
  to:           [{ type: String, required: true }],
  cc:           [{ type: String }],
  bcc:          [{ type: String }],
  subject:      { type: String, required: true },
  body:         { type: String, required: true },
  status:       { type: String, enum: ['sent', 'failed'], required: true },
  errorMessage: { type: String },
  sentBy:       { type: Schema.Types.ObjectId, ref: 'User', required: true },
  leadId:       { type: Schema.Types.ObjectId, ref: 'Lead' },
  sentAt:       { type: Date, default: Date.now },
});

sentEmailSchema.index({ sentBy: 1 });
sentEmailSchema.index({ sentAt: -1 });
sentEmailSchema.index({ leadId: 1 });

// Auto-delete after 4 months (≈120 days)
sentEmailSchema.index({ sentAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 120 });

export const SentEmail = model<ISentEmail>('SentEmail', sentEmailSchema);
