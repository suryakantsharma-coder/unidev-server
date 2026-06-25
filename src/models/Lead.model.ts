import { Document, Schema, model, Types } from 'mongoose';

export type LeadStatus = 'New' | 'Contacted' | 'Proposal' | 'Negotiation' | 'Qualified' | 'Won' | 'Lost';
export type LeadPriority = 'high' | 'medium' | 'low';

export interface ILeadLocation {
  lat: number;
  lng: number;
}

export interface ILead extends Document {
  title: string;
  categories: string[];
  categoryName?: string;
  /** Reference to the Category collection — set at import/create time */
  category?: Types.ObjectId;
  address?: string;
  neighborhood?: string;
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  countryCode?: string;
  website?: string;
  phone?: string;
  phoneUnformatted?: string;
  location?: ILeadLocation;
  plusCode?: string;
  status: LeadStatus;
  priority: LeadPriority;
  notes?: string;
  /** Free-form extra fields — store anything here, no restrictions */
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const leadSchema = new Schema<ILead>(
  {
    title:            { type: String, required: true, trim: true },
    categories:       [{ type: String, trim: true }],
    categoryName:     { type: String, trim: true },
    category:         { type: Schema.Types.ObjectId, ref: 'Category' },
    address:          { type: String, trim: true },
    neighborhood:     { type: String, trim: true },
    street:           { type: String, trim: true },
    city:             { type: String, trim: true },
    state:            { type: String, trim: true },
    postalCode:       { type: String, trim: true },
    countryCode:      { type: String, trim: true, uppercase: true },
    website:          { type: String, trim: true },
    phone:            { type: String, trim: true },
    phoneUnformatted: { type: String, trim: true },
    location: {
      lat: { type: Number },
      lng: { type: Number },
    },
    plusCode:  { type: String, trim: true },
    status: {
      type: String,
      enum: ['New', 'Contacted', 'Proposal', 'Negotiation', 'Qualified', 'Won', 'Lost'],
      default: 'New',
    },
    priority: {
      type: String,
      enum: ['high', 'medium', 'low'],
      default: 'medium',
    },
    notes:    { type: String },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

leadSchema.index({ status: 1 });
leadSchema.index({ priority: 1 });
leadSchema.index({ category: 1 });
leadSchema.index({ createdAt: -1 });
leadSchema.index({ city: 1 });
leadSchema.index({ state: 1 });
leadSchema.index({ countryCode: 1 });
leadSchema.index({ phoneUnformatted: 1 });
leadSchema.index({ title: 'text', categoryName: 'text', city: 'text', phone: 'text' });

export const Lead = model<ILead>('Lead', leadSchema);
