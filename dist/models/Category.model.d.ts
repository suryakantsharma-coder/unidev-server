import { Document } from 'mongoose';
export interface ICategory extends Document {
    name: string;
    description?: string;
    color?: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Category: import("mongoose").Model<ICategory, {}, {}, {}, Document<unknown, {}, ICategory, {}, {}> & ICategory & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Category.model.d.ts.map