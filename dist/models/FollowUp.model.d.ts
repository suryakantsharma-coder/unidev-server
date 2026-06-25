import { Document, Types } from 'mongoose';
export type FollowUpStatus = 'pending' | 'completed' | 'cancelled' | 'overdue';
export interface IFollowUp extends Document {
    contact?: Types.ObjectId;
    leadId?: Types.ObjectId;
    assignedUser: Types.ObjectId;
    scheduledAt: Date;
    message: string;
    status: FollowUpStatus;
    notes?: string;
    completedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}
export declare const FollowUp: import("mongoose").Model<IFollowUp, {}, {}, {}, Document<unknown, {}, IFollowUp, {}, {}> & IFollowUp & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=FollowUp.model.d.ts.map