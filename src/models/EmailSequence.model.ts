import { Schema, model, Types, Document } from 'mongoose';

export type SequenceStepStatus = 'pending' | 'sending' | 'sent' | 'failed' | 'skipped';
export type SequenceStatus     = 'active' | 'paused' | 'completed' | 'cancelled';

export interface ISequenceStep {
  stepNumber:   number;          // 1-5
  label:        string;          // "Initial Email", "Follow-up 1", etc.
  scheduledAt:  Date;
  sentAt?:      Date;
  subject:      string;
  body:         string;
  status:       SequenceStepStatus;
  errorMessage?: string;
}

export interface IEmailSequence extends Document {
  leadId?:       Types.ObjectId;
  to:            string[];
  cc?:           string[];
  from?:         string;
  createdBy:     Types.ObjectId;
  status:        SequenceStatus;
  // Store lead context so follow-ups can be re-generated with full context
  leadContext:   Record<string, unknown>;
  steps:         ISequenceStep[];
  createdAt:     Date;
  updatedAt:     Date;
}

const stepSchema = new Schema<ISequenceStep>({
  stepNumber:   { type: Number, required: true },
  label:        { type: String, required: true },
  scheduledAt:  { type: Date, required: true },
  sentAt:       { type: Date },
  subject:      { type: String, required: true },
  body:         { type: String, required: true },
  status:       { type: String, enum: ['pending','sending','sent','failed','skipped'], default: 'pending' },
  errorMessage: { type: String },
}, { _id: false });

const emailSequenceSchema = new Schema<IEmailSequence>({
  leadId:      { type: Schema.Types.ObjectId, ref: 'Lead' },
  to:          [{ type: String, required: true }],
  cc:          [{ type: String }],
  from:        { type: String },
  createdBy:   { type: Schema.Types.ObjectId, ref: 'User', required: true },
  status:      { type: String, enum: ['active','paused','completed','cancelled'], default: 'active' },
  leadContext: { type: Schema.Types.Mixed, default: {} },
  steps:       [stepSchema],
}, { timestamps: true });

emailSequenceSchema.index({ status: 1 });
emailSequenceSchema.index({ leadId: 1 });
emailSequenceSchema.index({ createdBy: 1 });
// For the cron job — quickly find active sequences with pending steps due now
emailSequenceSchema.index({ status: 1, 'steps.scheduledAt': 1, 'steps.status': 1 });

export const EmailSequence = model<IEmailSequence>('EmailSequence', emailSequenceSchema);
