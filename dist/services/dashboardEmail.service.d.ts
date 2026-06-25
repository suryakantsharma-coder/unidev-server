export interface SendEmailInput {
    to: string[];
    cc?: string[];
    bcc?: string[];
    subject: string;
    body: string;
    sentBy: string;
    leadId?: string;
}
export declare function sendDashboardEmail(input: SendEmailInput): Promise<import("mongoose").Document<unknown, {}, import("../models/SentEmail.model").ISentEmail, {}, {}> & import("../models/SentEmail.model").ISentEmail & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}>;
export declare function listSentEmails(filters: {
    sentBy?: string;
    leadId?: string;
    status?: 'sent' | 'failed';
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    limit?: number;
}): Promise<{
    emails: (import("mongoose").FlattenMaps<import("../models/SentEmail.model").ISentEmail> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[];
    total: number;
    page: number;
    limit: number;
    pages: number;
}>;
export declare function getSentEmail(id: string): Promise<import("mongoose").Document<unknown, {}, import("../models/SentEmail.model").ISentEmail, {}, {}> & import("../models/SentEmail.model").ISentEmail & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}>;
//# sourceMappingURL=dashboardEmail.service.d.ts.map