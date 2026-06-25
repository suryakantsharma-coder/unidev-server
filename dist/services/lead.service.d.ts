import { Types } from 'mongoose';
import { ILead, LeadStatus, LeadPriority } from '../models/Lead.model';
export interface LeadInput {
    title: string;
    categories?: string[];
    categoryName?: string;
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
    location?: {
        lat: number;
        lng: number;
    };
    plusCode?: string;
    status?: LeadStatus;
    priority?: LeadPriority;
    notes?: string;
    metadata?: Record<string, unknown>;
}
export interface LeadFilters {
    search?: string;
    status?: LeadStatus;
    priority?: LeadPriority;
    city?: string;
    state?: string;
    countryCode?: string;
    categoryName?: string;
    category?: string;
    hasWebsite?: boolean;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
export declare function createLead(input: LeadInput): Promise<ILead>;
export declare function bulkCreateLeads(inputs: LeadInput[], categoryId?: string): Promise<{
    inserted: number;
    duplicates: number;
    failed: number;
    errors: Array<{
        index: number;
        title: string;
        reason: string;
    }>;
}>;
export declare function listLeads(filters: LeadFilters): Promise<{
    leads: (import("mongoose").FlattenMaps<ILead> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    })[];
    total: number;
    page: number;
    limit: number;
    pages: number;
}>;
export declare function getLead(id: string): Promise<ILead>;
export declare function updateLead(id: string, input: Partial<LeadInput>): Promise<ILead>;
export declare const SEARCHABLE_FIELDS: readonly ["title", "phone", "phoneUnformatted", "city", "state", "countryCode", "categoryName", "website", "address", "neighborhood", "street", "postalCode", "notes", "plusCode"];
export type SearchableField = typeof SEARCHABLE_FIELDS[number];
export declare function searchLeads(q: string, fields?: SearchableField[], limit?: number): Promise<(import("mongoose").FlattenMaps<ILead> & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
})[]>;
export declare function deleteLead(id: string): Promise<void>;
export declare function bulkDeleteLeads(ids: string[]): Promise<{
    deleted: number;
    notFound: number;
}>;
//# sourceMappingURL=lead.service.d.ts.map