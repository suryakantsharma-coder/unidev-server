import { Document, Types } from 'mongoose';
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
export declare const Lead: import("mongoose").Model<ILead, {}, {}, {}, Document<unknown, {}, ILead, {}, {}> & ILead & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Lead.model.d.ts.map