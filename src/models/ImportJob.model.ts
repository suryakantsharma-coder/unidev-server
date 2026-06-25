import { Document, Schema, model, Types } from 'mongoose';

export type ImportJobStatus = 'queued' | 'processing' | 'done' | 'failed';

export interface IImportError {
  row: number;
  data: Record<string, unknown>;
  reason: string;
}

// Use a plain interface (not extending Document) to avoid conflict with
// Mongoose's built-in `errors` property on Document.
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

const importJobSchema = new Schema<IImportJob>(
  {
    filename:   { type: String, required: true },
    status:     { type: String, enum: ['queued', 'processing', 'done', 'failed'], default: 'queued' },
    total:      { type: Number, default: 0 },
    imported:   { type: Number, default: 0 },
    duplicates: { type: Number, default: 0 },
    failed:     { type: Number, default: 0 },
    importErrors: [
      {
        row:    Number,
        data:   { type: Schema.Types.Mixed },
        reason: String,
      },
    ],
    createdBy:    { type: Schema.Types.ObjectId, ref: 'User', required: true },
    completedAt:  { type: Date },
  },
  { timestamps: true }
);

export const ImportJob = model<IImportJob>('ImportJob', importJobSchema);
