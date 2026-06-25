import { Document, Types } from 'mongoose';
export interface IAiContent extends Document {
    leadId?: Types.ObjectId;
    type: 'email' | 'whatsapp' | 'follow_up' | 'proposal';
    tone: string;
    language: string;
    subject?: string;
    body: string;
    createdBy: Types.ObjectId;
    createdAt: Date;
}
export declare const AiContent: import("mongoose").Model<IAiContent, {}, {}, {}, Document<unknown, {}, IAiContent, {}, {}> & IAiContent & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=AiContent.model.d.ts.map