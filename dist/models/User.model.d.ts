import mongoose, { Document } from 'mongoose';
export type UserRole = 'super_admin' | 'admin' | 'agent';
export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    role: UserRole;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    comparePassword(candidate: string): Promise<boolean>;
}
export declare const User: mongoose.Model<IUser, {}, {}, {}, mongoose.Document<unknown, {}, IUser, {}, {}> & IUser & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=User.model.d.ts.map