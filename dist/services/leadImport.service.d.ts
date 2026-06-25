export interface ImportResult {
    jobId: string;
    total: number;
    imported: number;
    duplicates: number;
    failed: number;
    errors: Array<{
        row: number;
        data: Record<string, unknown>;
        reason: string;
    }>;
}
export declare function importLeadsFromBuffer(buffer: Buffer, filename: string, createdBy: string, categoryId?: string): Promise<ImportResult>;
export declare function getImportJob(jobId: string): Promise<import("mongoose").FlattenMaps<{
    _id: import("mongoose").Types.ObjectId;
    filename: string;
    status: import("../models/ImportJob.model").ImportJobStatus;
    total: number;
    imported: number;
    duplicates: number;
    failed: number;
    importErrors: {
        row: number;
        data: {
            [x: string]: unknown;
        };
        reason: string;
    }[];
    createdBy: import("mongoose").Types.ObjectId;
    completedAt?: Date | undefined;
    createdAt: Date;
    updatedAt: Date;
}> & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}>;
export declare function listImportJobs(createdBy?: string): Promise<(import("mongoose").FlattenMaps<{
    _id: import("mongoose").Types.ObjectId;
    filename: string;
    status: import("../models/ImportJob.model").ImportJobStatus;
    total: number;
    imported: number;
    duplicates: number;
    failed: number;
    importErrors: {
        row: number;
        data: {
            [x: string]: unknown;
        };
        reason: string;
    }[];
    createdBy: import("mongoose").Types.ObjectId;
    completedAt?: Date | undefined;
    createdAt: Date;
    updatedAt: Date;
}> & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
})[]>;
//# sourceMappingURL=leadImport.service.d.ts.map