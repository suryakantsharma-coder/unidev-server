export type ContentType = 'email' | 'whatsapp' | 'follow_up' | 'proposal';
export type ContentTone = 'professional' | 'friendly' | 'formal' | 'casual';
/**
 * outreachType controls the angle of the email:
 *
 * 'outsourcing'   — Target is a software agency / IT company that delivers
 *                   projects to their own clients. Pitch Unidev as their
 *                   white-label / outsourcing dev partner so they can take on
 *                   more work without hiring.
 *
 * 'client'        — Target needs software built for their own business.
 *                   Standard cold-outreach / new-client email (default).
 *
 * 'partnership'   — Mutual referral or co-sell partnership angle.
 */
export type OutreachType = 'outsourcing' | 'client' | 'partnership';
export interface LeadContext {
    businessName?: string;
    contactPerson?: string;
    city?: string;
    state?: string;
    country?: string;
    phone?: string;
    website?: string;
    categoryName?: string;
    companySize?: string;
    position?: string;
    techStack?: string;
    businessInfo?: string;
    painPoints?: string;
    description?: string;
    senderName?: string;
    senderCompany?: string;
    offerSummary?: string;
}
export interface GenerateContentInput {
    type: ContentType;
    outreachType?: OutreachType;
    tone?: ContentTone;
    language?: string;
    subject?: string;
    instructions?: string;
    leadId?: string;
    createdBy?: string;
    leadContext: LeadContext;
    analyze?: boolean;
    scrapeWebsite?: boolean;
}
export interface WebsiteScrape {
    url: string;
    excerpt: string;
    title?: string;
}
export interface CompanyAnalysis {
    summary: string;
    growthSignals: string;
    growthScore: number;
    worthTrying: boolean;
    worthTryingReason: string;
    needsHelp: string[];
    recommendation: string;
    websiteInsights?: string;
}
export interface GeneratedContent {
    subject?: string;
    body: string;
    type: ContentType;
    outreachType: OutreachType;
    tone: ContentTone;
    language: string;
    analysis?: CompanyAnalysis;
    websiteScrape?: WebsiteScrape;
}
export declare function generateContent(input: GenerateContentInput): Promise<GeneratedContent>;
export declare function getAiContentByLead(leadId: string): Promise<(import("mongoose").FlattenMaps<import("../models/AiContent.model").IAiContent> & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
})[]>;
export declare function listAiContent(filters: {
    leadId?: string;
    type?: ContentType;
    createdBy?: string;
}): Promise<(import("mongoose").FlattenMaps<import("../models/AiContent.model").IAiContent> & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
})[]>;
//# sourceMappingURL=aiContent.service.d.ts.map