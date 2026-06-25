import { Document, Types } from 'mongoose';
export interface IContact extends Document {
    name: string;
    phone: string;
    email?: string;
    tags: string[];
    notes?: string;
    assignedAgent?: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Contact: import("mongoose").Model<IContact, {}, {}, {}, Document<unknown, {}, IContact, {}, {}> & IContact & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Contact.model.d.ts.map