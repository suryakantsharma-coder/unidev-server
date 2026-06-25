import { Document, Types } from 'mongoose';
export type ImportJobStatus = 'queued' | 'processing' | 'done' | 'failed';
export interface IImportError {
    row: number;
    data: Record<string, unknown>;
    reason: string;
}
export interface IImportJob {
    _id: Types.ObjectId;
    filename: string;
    status: ImportJobStatus;
    total: number;
    imported: number;
    duplicates: number;
    failed: number;
    importErrors: IImportError[];
    createdBy: Types.ObjectId;
    completedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}
export declare const ImportJob: import("mongoose").Model<IImportJob, {}, {}, {}, Document<unknown, {}, IImportJob, {}, {}> & IImportJob & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=ImportJob.model.d.ts.map