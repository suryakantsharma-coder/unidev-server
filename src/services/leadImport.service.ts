import * as XLSX from 'xlsx';
import { Lead } from '../models/Lead.model';
import { ImportJob } from '../models/ImportJob.model';

/**
 * Maps spreadsheet column headers → Lead field names.
 * Keys are Lead model fields; values are accepted column header aliases (case-insensitive).
 */
const FIELD_ALIASES: Record<string, string[]> = {
  title:            ['title', 'name', 'company', 'company name', 'business', 'organization', 'place'],
  categoryName:     ['category', 'categoryname', 'category name', 'industry', 'sector', 'type'],
  categories:       ['categories'],
  address:          ['address', 'full address'],
  neighborhood:     ['neighborhood', 'area', 'locality'],
  street:           ['street', 'street address'],
  city:             ['city', 'town'],
  state:            ['state', 'province', 'region'],
  postalCode:       ['postalcode', 'postal code', 'zip', 'zip code', 'pincode'],
  countryCode:      ['countrycode', 'country code', 'country'],
  website:          ['website', 'web', 'url', 'site'],
  phone:            ['phone', 'phone number', 'mobile', 'contact number', 'tel'],
  phoneUnformatted: ['phoneunformatted', 'phone unformatted', 'raw phone'],
  plusCode:         ['pluscode', 'plus code'],
  status:           ['status', 'lead status'],
  priority:         ['priority', 'lead priority'],
  notes:            ['notes', 'note', 'remarks', 'comments', 'description'],
};

const VALID_STATUSES   = new Set(['New', 'Contacted', 'Proposal', 'Negotiation', 'Qualified', 'Won', 'Lost']);
const VALID_PRIORITIES = new Set(['high', 'medium', 'low']);
const BATCH_SIZE = 500;

export interface ImportResult {
  jobId: string;
  total: number;
  imported: number;
  duplicates: number;
  failed: number;
  errors: Array<{ row: number; data: Record<string, unknown>; reason: string }>;
}

export async function importLeadsFromBuffer(
  buffer: Buffer,
  filename: string,
  createdBy: string,
  categoryId?: string
): Promise<ImportResult> {
  const job = await ImportJob.create({ filename, status: 'processing', createdBy });

  try {
    const rows = parseFileBuffer(buffer);
    await ImportJob.findByIdAndUpdate(job._id, { total: rows.length });

    let imported = 0;
    let duplicates = 0;
    let failed = 0;
    const errors: ImportResult['errors'] = [];

    for (let batchStart = 0; batchStart < rows.length; batchStart += BATCH_SIZE) {
      const batch = rows.slice(batchStart, batchStart + BATCH_SIZE);
      const result = await processBatch(batch, batchStart + 2, categoryId); // +2 = 1-based + header row

      imported   += result.imported;
      duplicates += result.duplicates;
      failed     += result.failed;
      errors.push(...result.errors);

      await ImportJob.findByIdAndUpdate(job._id, { imported, duplicates, failed, importErrors: errors });
    }

    await ImportJob.findByIdAndUpdate(job._id, {
      status: 'done',
      imported,
      duplicates,
      failed,
      importErrors: errors,
      completedAt: new Date(),
    });

    return { jobId: String(job._id), total: rows.length, imported, duplicates, failed, errors };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await ImportJob.findByIdAndUpdate(job._id, {
      status: 'failed',
      importErrors: [{ row: 0, data: {}, reason: message }],
    });
    throw err;
  }
}

export async function getImportJob(jobId: string) {
  const job = await ImportJob.findById(jobId).populate('createdBy', 'name email').lean();
  if (!job) throw Object.assign(new Error('Import job not found'), { statusCode: 404 });
  return job;
}

export async function listImportJobs(createdBy?: string) {
  const query = createdBy ? { createdBy } : {};
  return ImportJob.find(query)
    .populate('createdBy', 'name email')
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();
}

// ─── Internal helpers ────────────────────────────────────────────────────────

function parseFileBuffer(buffer: Buffer): Record<string, unknown>[] {
  const workbook = XLSX.read(buffer, { type: 'buffer', cellDates: true, raw: false });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  if (!sheet) throw new Error('File has no readable sheet');

  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '', raw: false });
  if (rows.length === 0) throw new Error('File is empty or has no data rows');
  return rows;
}

function buildColumnMap(headers: string[]): Map<string, string> {
  const colMap = new Map<string, string>();
  for (const header of headers) {
    const normalized = header.trim().toLowerCase().replace(/\s+/g, ' ');
    for (const [field, aliases] of Object.entries(FIELD_ALIASES)) {
      if (aliases.includes(normalized)) {
        colMap.set(header, field);
        break;
      }
    }
  }
  return colMap;
}

interface BatchResult {
  imported: number;
  duplicates: number;
  failed: number;
  errors: ImportResult['errors'];
}

async function processBatch(
  rows: Record<string, unknown>[],
  startRowNumber: number,
  categoryId?: string
): Promise<BatchResult> {
  const result: BatchResult = { imported: 0, duplicates: 0, failed: 0, errors: [] };
  const headers = Object.keys(rows[0] ?? {});
  const colMap  = buildColumnMap(headers);

  for (let i = 0; i < rows.length; i++) {
    const rowNumber = startRowNumber + i;
    const rawRow    = rows[i];

    try {
      const lead = mapRowToLead(rawRow, colMap);

      if (!lead.title) {
        result.failed++;
        result.errors.push({ row: rowNumber, data: rawRow, reason: 'Missing required field: title' });
        continue;
      }

      const isDuplicate = await checkDuplicate(
        lead.phoneUnformatted as string | undefined,
        lead.phone as string | undefined
      );
      if (isDuplicate) {
        result.duplicates++;
        continue;
      }

      // categoryId from the upload overrides any category detected in the row
      if (categoryId) lead.category = categoryId;

      await Lead.create(lead);
      result.imported++;
    } catch (err) {
      result.failed++;
      result.errors.push({
        row: rowNumber,
        data: rawRow,
        reason: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return result;
}

// All known top-level Lead fields — anything else goes into metadata
const KNOWN_FIELDS = new Set(Object.keys(FIELD_ALIASES));

function mapRowToLead(
  row: Record<string, unknown>,
  colMap: Map<string, string>
): Record<string, unknown> {
  const lead: Record<string, unknown> = { status: 'New', priority: 'medium', metadata: {} };
  const metadata: Record<string, unknown> = {};

  // Map known columns to lead fields
  for (const [header, fieldName] of colMap.entries()) {
    const rawValue = String(row[header] ?? '').trim();
    if (!rawValue) continue;

    switch (fieldName) {
      case 'status': {
        const matched = [...VALID_STATUSES].find(
          (s) => s.toLowerCase() === rawValue.toLowerCase()
        );
        if (matched) lead.status = matched;
        break;
      }
      case 'priority': {
        const matched = [...VALID_PRIORITIES].find(
          (p) => p.toLowerCase() === rawValue.toLowerCase()
        );
        if (matched) lead.priority = matched;
        break;
      }
      case 'categories': {
        lead.categories = rawValue.split(/[,;|]/).map((c) => c.trim()).filter(Boolean);
        break;
      }
      default: {
        lead[fieldName] = rawValue;
      }
    }
  }

  // Any column that didn't match a known field → goes into metadata
  for (const header of Object.keys(row)) {
    if (colMap.has(header)) continue; // already mapped above
    const rawValue = String(row[header] ?? '').trim();
    if (!rawValue) continue;
    metadata[header] = rawValue;
  }

  if (Object.keys(metadata).length > 0) lead.metadata = metadata;

  return lead;
}

async function checkDuplicate(phoneUnformatted?: string, phone?: string): Promise<boolean> {
  const orConditions: Array<Record<string, unknown>> = [];
  if (phoneUnformatted) orConditions.push({ phoneUnformatted });
  else if (phone)       orConditions.push({ phone });
  if (orConditions.length === 0) return false;
  return !!(await Lead.exists({ $or: orConditions }));
}
