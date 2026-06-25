import { Document, Schema, model, Types } from 'mongoose';

export interface IContact extends Document {
  name: string;
  phone: string;
  email?: string;
  tags: string[];
  notes?: string;
  assignedAgent?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const contactSchema = new Schema<IContact>(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, unique: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    tags: [{ type: String, trim: true }],
    notes: { type: String },
    assignedAgent: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

contactSchema.index({ phone: 1 });
contactSchema.index({ assignedAgent: 1 });

export const Contact = model<IContact>('Contact', contactSchema);
