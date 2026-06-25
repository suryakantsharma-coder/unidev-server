import { FollowUpStatus } from '../models/FollowUp.model';
import { Types } from 'mongoose';
export interface FollowUpInput {
    contact?: string;
    leadId?: string;
    assignedUser: string;
    scheduledAt: Date;
    message: string;
    notes?: string;
}
export declare function createFollowUp(input: FollowUpInput): Promise<import("mongoose").Document<unknown, {}, import("../models/FollowUp.model").IFollowUp, {}, {}> & import("../models/FollowUp.model").IFollowUp & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}>;
export declare function getFollowUpsByLead(leadId: string): Promise<(import("mongoose").FlattenMaps<import("../models/FollowUp.model").IFollowUp> & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
})[]>;
export declare function listFollowUps(filters: {
    assignedUser?: string;
    contact?: string;
    leadId?: string;
    status?: FollowUpStatus;
    dateFrom?: string;
    dateTo?: string;
    dueToday?: boolean;
    page?: number;
    limit?: number;
}): Promise<{
    followUps: (import("mongoose").FlattenMaps<import("../models/FollowUp.model").IFollowUp> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    })[];
    total: number;
    page: number;
    limit: number;
    pages: number;
}>;
export declare function getFollowUp(id: string): Promise<import("mongoose").Document<unknown, {}, import("../models/FollowUp.model").IFollowUp, {}, {}> & import("../models/FollowUp.model").IFollowUp & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}>;
export declare function updateFollowUp(id: string, input: Partial<FollowUpInput & {
    status: FollowUpStatus;
}>): Promise<import("mongoose").Document<unknown, {}, import("../models/FollowUp.model").IFollowUp, {}, {}> & import("../models/FollowUp.model").IFollowUp & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}>;
export declare function deleteFollowUp(id: string): Promise<void>;
/** Count follow-ups due today across all users */
export declare function countDueToday(): Promise<number>;
//# sourceMappingURL=followUp.service.d.ts.map