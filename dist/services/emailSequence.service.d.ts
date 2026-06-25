import { IEmailSequence } from '../models/EmailSequence.model';
import { LeadContext, ContentTone } from './aiContent.service';
export interface StartSequenceInput {
    leadId?: string;
    to: string[];
    cc?: string[];
    subject: string;
    body: string;
    tone?: ContentTone;
    language?: string;
    leadContext: LeadContext;
    createdBy: string;
    analyze?: boolean;
    initialAlreadySent?: boolean;
}
export declare function startSequence(input: StartSequenceInput): Promise<import("mongoose").Document<unknown, {}, IEmailSequence, {}, {}> & IEmailSequence & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}>;
export declare function getSequence(id: string): Promise<(import("mongoose").FlattenMaps<IEmailSequence> & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}) | null>;
export declare function listSequences(filters: {
    leadId?: string;
    status?: string;
    createdBy?: string;
    page?: number;
    limit?: number;
}): Promise<{
    sequences: (import("mongoose").FlattenMaps<IEmailSequence> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[];
    total: number;
    page: number;
    limit: number;
    pages: number;
}>;
export declare function getSequencesByLead(leadId: string): Promise<(import("mongoose").FlattenMaps<IEmailSequence> & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
})[]>;
export declare function listProgress(filters: {
    status?: string;
    leadId?: string;
    createdBy?: string;
    page?: number;
    limit?: number;
}): Promise<{
    sequences: {
        sequenceId: string;
        status: any;
        lead: any;
        to: any;
        createdBy: any;
        createdAt: any;
        progress: {
            total: any;
            sent: any;
            failed: any;
            skipped: any;
            remaining: any;
            percentDone: number;
        };
        nextEmail: {
            step: any;
            label: any;
            scheduledAt: any;
            subject: any;
        } | null;
        steps: any;
    }[];
    total: number;
    page: number;
    limit: number;
    pages: number;
}>;
export declare function getProgressById(id: string): Promise<{
    sequenceId: string;
    status: any;
    lead: any;
    to: any;
    createdBy: any;
    createdAt: any;
    progress: {
        total: any;
        sent: any;
        failed: any;
        skipped: any;
        remaining: any;
        percentDone: number;
    };
    nextEmail: {
        step: any;
        label: any;
        scheduledAt: any;
        subject: any;
    } | null;
    steps: any;
}>;
export declare function cancelSequence(id: string): Promise<import("mongoose").Document<unknown, {}, IEmailSequence, {}, {}> & IEmailSequence & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}>;
export declare function processDueSteps(): Promise<{
    processed: number;
    errors: number;
}>;
//# sourceMappingURL=emailSequence.service.d.ts.map