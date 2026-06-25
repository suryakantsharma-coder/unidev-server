import { Document, Types } from 'mongoose';
export type EmailStatus = 'sent' | 'failed';
export interface ISentEmail extends Document {
    from: string;
    to: string[];
    cc?: string[];
    bcc?: string[];
    subject: string;
    body: string;
    status: EmailStatus;
    errorMessage?: string;
    sentBy: Types.ObjectId;
    leadId?: Types.ObjectId;
    sentAt: Date;
}
export declare const SentEmail: import("mongoose").Model<ISentEmail, {}, {}, {}, Document<unknown, {}, ISentEmail, {}, {}> & ISentEmail & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=SentEmail.model.d.ts.map