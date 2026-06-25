import { Document, Schema, model, Types } from 'mongoose';

export type FollowUpStatus = 'pending' | 'completed' | 'cancelled' | 'overdue';

export interface IFollowUp extends Document {
  contact?: Types.ObjectId;
  leadId?: Types.ObjectId;
  assignedUser: Types.ObjectId;
  scheduledAt: Date;
  message: string;
  status: FollowUpStatus;
  notes?: string;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const followUpSchema = new Schema<IFollowUp>(
  {
    contact:      { type: Schema.Types.ObjectId, ref: 'Contact' },
    leadId:       { type: Schema.Types.ObjectId, ref: 'Lead' },
    assignedUser: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    scheduledAt: { type: Date, required: true },
    message: { type: String, required: true },
    status: {
      type: String,
      enum: ['pending', 'completed', 'cancelled', 'overdue'],
      default: 'pending',
    },
    notes: { type: String },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

followUpSchema.index({ assignedUser: 1, scheduledAt: 1 });
followUpSchema.index({ contact: 1 });
followUpSchema.index({ leadId: 1 });
followUpSchema.index({ status: 1 });

export const FollowUp = model<IFollowUp>('FollowUp', followUpSchema);
