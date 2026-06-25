import { Request, Response, NextFunction } from 'express';
import { importLeadsFromBuffer, getImportJob, listImportJobs } from '../services/leadImport.service';

const ALLOWED_MIME_TYPES = new Set([
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
  'application/vnd.ms-excel',                                           // .xls
  'text/csv',
  'application/csv',
  'text/plain', // some clients send CSV as text/plain
]);

const ALLOWED_EXTENSIONS = new Set(['xlsx', 'xls', 'csv']);

export async function importLeads(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const file = req.file;
    if (!file) {
      res.status(400).json({ success: false, message: 'No file uploaded. Use multipart/form-data with field name "file".' });
      return;
    }

    const ext = file.originalname.split('.').pop()?.toLowerCase() ?? '';
    if (!ALLOWED_EXTENSIONS.has(ext) && !ALLOWED_MIME_TYPES.has(file.mimetype)) {
      res.status(400).json({ success: false, message: 'Unsupported file type. Upload .xlsx, .xls, or .csv.' });
      return;
    }

    const createdBy  = String(req.user!._id);
    const categoryId = req.body.categoryId as string | undefined;

    const result = await importLeadsFromBuffer(file.buffer, file.originalname, createdBy, categoryId);

    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function getJob(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const job = await getImportJob(req.params.jobId);
    res.json({ success: true, data: job });
  } catch (err) {
    next(err);
  }
}

export async function listJobs(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const jobs = await listImportJobs();
    res.json({ success: true, data: jobs });
  } catch (err) {
    next(err);
  }
}
