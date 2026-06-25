import { Types, Document } from 'mongoose';
export type SequenceStepStatus = 'pending' | 'sending' | 'sent' | 'failed' | 'skipped';
export type SequenceStatus = 'active' | 'paused' | 'completed' | 'cancelled';
export interface ISequenceStep {
    stepNumber: number;
    label: string;
    scheduledAt: Date;
    sentAt?: Date;
    subject: string;
    body: string;
    status: SequenceStepStatus;
    errorMessage?: string;
}
export interface IEmailSequence extends Document {
    leadId?: Types.ObjectId;
    to: string[];
    cc?: string[];
    from?: string;
    createdBy: Types.ObjectId;
    status: SequenceStatus;
    leadContext: Record<string, unknown>;
    steps: ISequenceStep[];
    createdAt: Date;
    updatedAt: Date;
}
export declare const EmailSequence: import("mongoose").Model<IEmailSequence, {}, {}, {}, Document<unknown, {}, IEmailSequence, {}, {}> & IEmailSequence & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=EmailSequence.model.d.ts.map