const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Accepts either a bare list of emails (one per line) or a CSV with email in
// the first column. Non-email first lines (headers) are silently skipped.
export function parseCsvEmails(csvText: string): string[] {
  const lines = csvText.split(/\r?\n/);
  const emails = new Set<string>();
  for (const line of lines) {
    const firstCell = line.split(',')[0].replace(/^"|"$/g, '').trim().toLowerCase();
    if (EMAIL_REGEX.test(firstCell)) emails.add(firstCell);
  }
  return Array.from(emails);
}

function stripQuotes(value: string): string {
  return value.replace(/^"|"$/g, '').trim();
}

// Quote-aware cell split — handles a double-quoted field containing a comma
// (e.g. a name like "Khan, Abdul"), which plain `line.split(',')` breaks.
function splitCsvLine(line: string): string[] {
  const cells: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (inQuotes) {
      if (char === '"' && line[i + 1] === '"') {
        current += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        current += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ',') {
      cells.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  cells.push(current);
  return cells;
}

// Accepts "name,email" per line (either column order — whichever cell looks
// like an email wins) or a bare list of emails, in which case the name
// defaults to the email's local part.
export function parseCsvNameEmail(csvText: string): { name: string; email: string }[] {
  const lines = csvText.split(/\r?\n/);
  const seen = new Set<string>();
  const rows: { name: string; email: string }[] = [];

  for (const line of lines) {
    const cells = line.split(',').map(stripQuotes).filter(Boolean);
    if (cells.length === 0) continue;

    const emailCell = cells.find((c) => EMAIL_REGEX.test(c.toLowerCase()));
    if (!emailCell) continue;

    const email = emailCell.toLowerCase();
    if (seen.has(email)) continue;
    seen.add(email);

    const nameCell = cells.find((c) => c.toLowerCase() !== email && c);
    rows.push({ name: nameCell ?? email.split('@')[0], email });
  }

  return rows;
}

export interface AlumniImportRow {
  name: string;
  email: string;
  phone?: string;
  linkedin?: string;
  designation?: string;
  organization?: string;
  certification?: 'CDCS' | 'CSDG' | 'CITF' | 'CTFP' | 'OTHER';
  batch?: string;
  country?: string;
}

// Only name+email are truly required — real legacy data (e.g. the old
// iitrade.org member list) often has nothing else. designation/organization
// are stored as empty strings when absent (the AlumniProfile columns are
// NOT NULL) and can be filled in later via the admin edit UI.
const ALUMNI_IMPORT_REQUIRED_HEADERS = ['name', 'email'];
const ALUMNI_IMPORT_OPTIONAL_HEADERS = [
  'phone',
  'linkedin',
  'designation',
  'organization',
  'certification',
  'batch',
  'country',
];
const ALUMNI_IMPORT_KNOWN_HEADERS = new Set([
  ...ALUMNI_IMPORT_REQUIRED_HEADERS,
  ...ALUMNI_IMPORT_OPTIONAL_HEADERS,
]);

// Header-driven (not positional) — this format carries too many columns for
// "whichever cell looks like an email wins" to stay reliable. The first
// non-empty line is the header row; column order doesn't matter, but the
// required columns (name,email,designation,organization) must be present,
// or this throws with the exact mismatch so a wrong file fails loudly in
// Preview instead of silently misimporting.
export function parseCsvAlumniImport(csvText: string): AlumniImportRow[] {
  const lines = csvText.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length === 0) throw new Error('The file is empty.');

  const headerCells = splitCsvLine(lines[0]).map((c) => stripQuotes(c).toLowerCase());
  const missing = ALUMNI_IMPORT_REQUIRED_HEADERS.filter((h) => !headerCells.includes(h));
  if (missing.length > 0) {
    throw new Error(
      `CSV is missing required column(s): ${missing.join(', ')}. Expected a header row with: ${ALUMNI_IMPORT_REQUIRED_HEADERS.join(', ')} (optionally also: ${ALUMNI_IMPORT_OPTIONAL_HEADERS.join(', ')}). Found: ${headerCells.join(', ')}.`,
    );
  }

  const unknown = headerCells.filter((h) => h && !ALUMNI_IMPORT_KNOWN_HEADERS.has(h));
  if (unknown.length > 0) {
    throw new Error(`CSV has unrecognized column(s): ${unknown.join(', ')}.`);
  }

  const seen = new Set<string>();
  const rows: AlumniImportRow[] = [];

  for (const line of lines.slice(1)) {
    const cells = splitCsvLine(line).map(stripQuotes);
    const get = (header: string): string | undefined => {
      const index = headerCells.indexOf(header);
      const value = index === -1 ? undefined : cells[index];
      return value ? value : undefined;
    };

    const email = get('email')?.toLowerCase();
    if (!email || !EMAIL_REGEX.test(email)) continue;
    if (seen.has(email)) continue;
    seen.add(email);

    const name = get('name');
    if (!name) continue;

    const certificationRaw = get('certification')?.toUpperCase();
    const certification =
      certificationRaw && ['CDCS', 'CSDG', 'CITF', 'CTFP', 'OTHER'].includes(certificationRaw)
        ? (certificationRaw as AlumniImportRow['certification'])
        : undefined;

    rows.push({
      name,
      email,
      phone: get('phone'),
      linkedin: get('linkedin'),
      designation: get('designation'),
      organization: get('organization'),
      certification,
      batch: get('batch'),
      country: get('country'),
    });
  }

  return rows;
}
