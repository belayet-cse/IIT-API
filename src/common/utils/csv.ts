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
