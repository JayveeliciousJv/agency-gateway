import { toast } from 'sonner';
import type { VisitorLog, SurveyResponse } from './store';

/* ------------------------------------------------------------------ */
/*  Module definitions – columns, samples, and instructions           */
/* ------------------------------------------------------------------ */

export type MigrationModule = 'visitors' | 'letters' | 'surveys';

interface ColumnDef {
  key: string;
  label: string;
  required: boolean;
  sample: string;
  note?: string;
}

const VISITOR_COLUMNS: ColumnDef[] = [
  { key: 'name', label: 'Full Name', required: true, sample: 'Juan Dela Cruz' },
  { key: 'sex', label: 'Sex', required: true, sample: 'Male', note: 'Male | Female | Prefer not to say' },
  { key: 'ageGroup', label: 'Age Group', required: false, sample: '25-34', note: '18-24 | 25-34 | 35-44 | 45-54 | 55-64 | 65+' },
  { key: 'educationLevel', label: 'Education Level', required: false, sample: 'College', note: 'Elementary | High School | Vocational | College | Post-Graduate' },
  { key: 'occupation', label: 'Occupation', required: false, sample: 'Government Employee' },
  { key: 'region', label: 'Region', required: false, sample: 'Region V' },
  { key: 'sectorClassification', label: 'Sector', required: true, sample: 'Employed/Working' },
  { key: 'purpose', label: 'Purpose', required: true, sample: 'Transaction' },
  { key: 'service', label: 'Service Availed', required: true, sample: 'Business Permit Application' },
  { key: 'contactNumber', label: 'Contact Number', required: true, sample: '09171234567' },
  { key: 'email', label: 'Email', required: true, sample: 'juan@email.com' },
  { key: 'date', label: 'Date (YYYY-MM-DD)', required: true, sample: new Date().toISOString().split('T')[0] },
  { key: 'time', label: 'Time (HH:MM)', required: true, sample: '09:30' },
];

const LETTER_COLUMNS: ColumnDef[] = [
  { key: 'name', label: 'Delivered By', required: true, sample: 'Maria Santos' },
  { key: 'sex', label: 'Sex', required: true, sample: 'Female', note: 'Male | Female | Prefer not to say' },
  { key: 'sectorClassification', label: 'Sector', required: true, sample: 'Government Employee' },
  { key: 'letterSubject', label: 'Letter Subject', required: true, sample: 'Request for Technical Assistance' },
  { key: 'letterFrom', label: 'Letter From', required: true, sample: 'DICT Region IV' },
  { key: 'letterProject', label: 'Project', required: false, sample: 'DigiGov', note: 'DigiGov | ILCDB | PNPKI | Cybersecurity | FreeWifi4All | Other' },
  { key: 'letterProjectOther', label: 'Project (if Other)', required: false, sample: '' },
  { key: 'letterStatus', label: 'Status', required: false, sample: 'Received', note: 'Received | Processed | Pending | Forwarded | Archived' },
  { key: 'letterScanLink', label: 'Scan Link URL', required: false, sample: 'https://drive.google.com/file/...' },
  { key: 'letterReceivedBy', label: 'Received By', required: false, sample: 'System Administrator' },
  { key: 'contactNumber', label: 'Contact Number', required: true, sample: '09171234567' },
  { key: 'email', label: 'Email', required: true, sample: 'maria@agency.gov.ph' },
  { key: 'date', label: 'Date (YYYY-MM-DD)', required: true, sample: new Date().toISOString().split('T')[0] },
  { key: 'time', label: 'Time (HH:MM)', required: true, sample: '10:00' },
];

const SURVEY_COLUMNS: ColumnDef[] = [
  { key: 'visitorId', label: 'Visitor ID (optional)', required: false, sample: '', note: 'Leave blank to auto-generate' },
  { key: 'service', label: 'Service Availed', required: true, sample: 'Business Permit Application' },
  { key: 'responsiveness', label: 'Responsiveness (1-5)', required: true, sample: '5' },
  { key: 'reliability', label: 'Reliability (1-5)', required: true, sample: '4' },
  { key: 'accessFacilities', label: 'Access & Facilities (1-5)', required: true, sample: '4' },
  { key: 'communication', label: 'Communication (1-5)', required: true, sample: '5' },
  { key: 'costs', label: 'Costs (1-5)', required: true, sample: '4' },
  { key: 'integrity', label: 'Integrity (1-5)', required: true, sample: '5' },
  { key: 'assurance', label: 'Assurance (1-5)', required: true, sample: '4' },
  { key: 'outcome', label: 'Outcome (1-5)', required: true, sample: '5' },
  { key: 'overallSatisfaction', label: 'Overall Satisfaction (1-5)', required: true, sample: '5' },
  { key: 'comment', label: 'Comment', required: false, sample: 'Great service!' },
  { key: 'date', label: 'Date (YYYY-MM-DD)', required: true, sample: new Date().toISOString().split('T')[0] },
];

export const MODULE_DEFS: Record<MigrationModule, { label: string; columns: ColumnDef[] }> = {
  visitors: { label: 'Visitors', columns: VISITOR_COLUMNS },
  letters: { label: 'Incoming Letters', columns: LETTER_COLUMNS },
  surveys: { label: 'Surveys', columns: SURVEY_COLUMNS },
};

/* ------------------------------------------------------------------ */
/*  Template generation                                                */
/* ------------------------------------------------------------------ */

function buildCsvInstructions(mod: MigrationModule): string {
  const def = MODULE_DEFS[mod];
  const lines = [
    `# Migration Template: ${def.label}`,
    `# Instructions:`,
    `# 1. Fill in data starting from the row after the header.`,
    `# 2. Required columns are marked with (*).`,
    `# 3. Dates must be YYYY-MM-DD, times HH:MM (24h).`,
    `# 4. Ratings (surveys) must be 1-5.`,
    `# 5. Remove this instruction block and sample row before uploading.`,
    `#`,
    ...def.columns.filter(c => c.note).map(c => `# ${c.label}: ${c.note}`),
    `#`,
  ];
  return lines.join('\n');
}

function escapeCsv(val: string): string {
  if (val.includes(',') || val.includes('"') || val.includes('\n')) {
    return `"${val.replace(/"/g, '""')}"`;
  }
  return val;
}

export function downloadTemplate(mod: MigrationModule, format: 'csv' | 'json') {
  const def = MODULE_DEFS[mod];

  if (format === 'csv') {
    const instructions = buildCsvInstructions(mod);
    const header = def.columns.map(c => escapeCsv(`${c.label}${c.required ? ' *' : ''}`)).join(',');
    const sample = def.columns.map(c => escapeCsv(c.sample)).join(',');
    const content = `${instructions}\n${header}\n${sample}\n`;
    downloadFile(content, `migration-template-${mod}.csv`, 'text/csv');
  } else {
    const template = {
      _instructions: [
        `Migration Template: ${def.label}`,
        'Fill the "data" array with your records.',
        'Required fields are listed in "requiredFields".',
        'Remove the sample record before uploading.',
      ],
      module: mod,
      requiredFields: def.columns.filter(c => c.required).map(c => c.key),
      fieldNotes: Object.fromEntries(def.columns.filter(c => c.note).map(c => [c.key, c.note])),
      data: [Object.fromEntries(def.columns.map(c => [c.key, c.sample]))],
    };
    downloadFile(JSON.stringify(template, null, 2), `migration-template-${mod}.json`, 'application/json');
  }

  toast.success(`${def.label} migration template downloaded.`);
}

/* ------------------------------------------------------------------ */
/*  Export reports as migration files                                  */
/* ------------------------------------------------------------------ */

export function exportAsMigration(mod: MigrationModule, records: Record<string, unknown>[], format: 'csv' | 'json') {
  const def = MODULE_DEFS[mod];

  if (format === 'csv') {
    const header = def.columns.map(c => escapeCsv(c.label)).join(',');
    const rows = records.map(r =>
      def.columns.map(c => escapeCsv(String(r[c.key] ?? ''))).join(',')
    );
    downloadFile([header, ...rows].join('\n'), `export-${mod}-${new Date().toISOString().slice(0, 10)}.csv`, 'text/csv');
  } else {
    const payload = { module: mod, exportedAt: new Date().toISOString(), data: records };
    downloadFile(JSON.stringify(payload, null, 2), `export-${mod}-${new Date().toISOString().slice(0, 10)}.json`, 'application/json');
  }
  toast.success(`${def.label} exported as migration file.`);
}

/* ------------------------------------------------------------------ */
/*  Parse & validate uploaded migration file                          */
/* ------------------------------------------------------------------ */

export interface ParseResult {
  module: MigrationModule;
  records: Record<string, string>[];
  errors: string[];
  warnings: string[];
}

function parseCsv(text: string): string[][] {
  // Strip instruction lines starting with #
  const lines = text.split('\n').filter(l => !l.trimStart().startsWith('#') && l.trim() !== '');
  const result: string[][] = [];
  for (const line of lines) {
    const row: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (inQuotes) {
        if (ch === '"' && line[i + 1] === '"') { current += '"'; i++; }
        else if (ch === '"') { inQuotes = false; }
        else { current += ch; }
      } else {
        if (ch === '"') { inQuotes = true; }
        else if (ch === ',') { row.push(current.trim()); current = ''; }
        else { current += ch; }
      }
    }
    row.push(current.trim());
    result.push(row);
  }
  return result;
}

function detectModule(headers: string[], jsonModule?: string): MigrationModule | null {
  if (jsonModule && jsonModule in MODULE_DEFS) return jsonModule as MigrationModule;

  // Try to match headers to a module
  for (const [mod, def] of Object.entries(MODULE_DEFS)) {
    const keys = def.columns.map(c => c.key);
    const labels = def.columns.map(c => c.label.replace(' *', '').toLowerCase());
    const lowerHeaders = headers.map(h => h.replace(' *', '').toLowerCase().trim());
    const matchByLabel = labels.filter(l => lowerHeaders.includes(l)).length;
    const matchByKey = keys.filter(k => lowerHeaders.includes(k.toLowerCase())).length;
    if (matchByLabel >= 3 || matchByKey >= 3) return mod as MigrationModule;
  }
  return null;
}

function normalizeHeader(header: string, columns: ColumnDef[]): string | null {
  const clean = header.replace(/\*/g, '').trim().toLowerCase();
  for (const c of columns) {
    if (c.key.toLowerCase() === clean || c.label.toLowerCase() === clean) return c.key;
  }
  return null;
}

export function parseMigrationFile(content: string, fileName: string): ParseResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const isJson = fileName.endsWith('.json');

  let rawRecords: Record<string, string>[] = [];
  let detectedModule: MigrationModule | null = null;

  if (isJson) {
    try {
      const parsed = JSON.parse(content);
      detectedModule = detectModule([], parsed.module);
      const dataArr = Array.isArray(parsed.data) ? parsed.data : Array.isArray(parsed) ? parsed : null;
      if (!dataArr) { errors.push('JSON must contain a "data" array.'); return { module: 'visitors', records: [], errors, warnings }; }
      rawRecords = dataArr.map((r: unknown) => {
        if (typeof r !== 'object' || !r) return {};
        const obj: Record<string, string> = {};
        for (const [k, v] of Object.entries(r as Record<string, unknown>)) { obj[k] = String(v ?? ''); }
        return obj;
      });
    } catch { errors.push('Invalid JSON file.'); return { module: 'visitors', records: [], errors, warnings }; }
  } else {
    const rows = parseCsv(content);
    if (rows.length < 2) { errors.push('CSV must have a header row and at least one data row.'); return { module: 'visitors', records: [], errors, warnings }; }
    const headers = rows[0];
    detectedModule = detectModule(headers);
    if (detectedModule) {
      const cols = MODULE_DEFS[detectedModule].columns;
      const keyMap = headers.map(h => normalizeHeader(h, cols));
      for (let i = 1; i < rows.length; i++) {
        const obj: Record<string, string> = {};
        rows[i].forEach((val, ci) => { const k = keyMap[ci]; if (k) obj[k] = val; });
        rawRecords.push(obj);
      }
    }
  }

  if (!detectedModule) {
    errors.push('Could not detect module type. Ensure headers match a known template (Visitors, Letters, or Surveys).');
    return { module: 'visitors', records: [], errors, warnings };
  }

  // Validate required fields
  const def = MODULE_DEFS[detectedModule];
  const requiredKeys = def.columns.filter(c => c.required).map(c => c.key);
  const validRecords: Record<string, string>[] = [];

  rawRecords.forEach((rec, idx) => {
    const row = idx + 1;
    const missing = requiredKeys.filter(k => !rec[k] || rec[k].trim() === '' || rec[k] === 'undefined');
    if (missing.length > 0) {
      errors.push(`Row ${row}: Missing required fields — ${missing.join(', ')}`);
    } else {
      // Validate specific fields
      if (detectedModule === 'surveys' || detectedModule === 'visitors') {
        if (rec.date && !/^\d{4}-\d{2}-\d{2}$/.test(rec.date)) {
          warnings.push(`Row ${row}: Date "${rec.date}" may not be in YYYY-MM-DD format.`);
        }
      }
      if (detectedModule === 'surveys') {
        const ratingKeys = ['responsiveness', 'reliability', 'accessFacilities', 'communication', 'costs', 'integrity', 'assurance', 'outcome', 'overallSatisfaction'];
        for (const rk of ratingKeys) {
          const v = Number(rec[rk]);
          if (isNaN(v) || v < 1 || v > 5) {
            warnings.push(`Row ${row}: ${rk} should be 1-5, got "${rec[rk]}".`);
          }
        }
      }
      validRecords.push(rec);
    }
  });

  if (validRecords.length === 0 && errors.length === 0) {
    errors.push('No data rows found in the file.');
  }

  return { module: detectedModule, records: validRecords, errors, warnings };
}

/* ------------------------------------------------------------------ */
/*  Convert parsed records to store-ready objects                     */
/* ------------------------------------------------------------------ */

export function toVisitorLogs(records: Record<string, string>[], isLetter: boolean): VisitorLog[] {
  return records.map((r, i) => ({
    id: `mig_v${Date.now()}_${i}`,
    name: r.name || '',
    sex: (r.sex as VisitorLog['sex']) || 'Prefer not to say',
    ageGroup: (r.ageGroup as VisitorLog['ageGroup']) || undefined,
    educationLevel: (r.educationLevel as VisitorLog['educationLevel']) || undefined,
    occupation: r.occupation || undefined,
    region: r.region || undefined,
    sectorClassification: r.sectorClassification || '',
    purpose: isLetter ? 'Incoming Letter' : (r.purpose || 'Transaction'),
    service: isLetter ? 'Incoming Letter' : (r.service || ''),
    letterSubject: r.letterSubject || undefined,
    letterFrom: r.letterFrom || undefined,
    letterProject: r.letterProject || undefined,
    letterProjectOther: r.letterProjectOther || undefined,
    letterStatus: (r.letterStatus as VisitorLog['letterStatus']) || undefined,
    letterScanLink: r.letterScanLink || undefined,
    letterReceivedBy: r.letterReceivedBy || undefined,
    contactNumber: r.contactNumber || '',
    email: r.email || '',
    date: r.date || new Date().toISOString().split('T')[0],
    time: r.time || '00:00',
  }));
}

export function toSurveyResponses(records: Record<string, string>[]): SurveyResponse[] {
  return records.map((r, i) => ({
    id: `mig_s${Date.now()}_${i}`,
    visitorId: r.visitorId || '',
    service: r.service || '',
    responsiveness: clampRating(r.responsiveness),
    reliability: clampRating(r.reliability),
    accessFacilities: clampRating(r.accessFacilities),
    communication: clampRating(r.communication),
    costs: clampRating(r.costs),
    integrity: clampRating(r.integrity),
    assurance: clampRating(r.assurance),
    outcome: clampRating(r.outcome),
    overallSatisfaction: clampRating(r.overallSatisfaction),
    comment: r.comment || '',
    date: r.date || new Date().toISOString().split('T')[0],
  }));
}

function clampRating(val: string | undefined): number {
  const n = Number(val);
  if (isNaN(n)) return 3;
  return Math.max(1, Math.min(5, Math.round(n)));
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function downloadFile(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
