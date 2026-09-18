"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseCsvEmails = parseCsvEmails;
exports.parseCsvNameEmail = parseCsvNameEmail;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
function parseCsvEmails(csvText) {
    const lines = csvText.split(/\r?\n/);
    const emails = new Set();
    for (const line of lines) {
        const firstCell = line.split(',')[0].replace(/^"|"$/g, '').trim().toLowerCase();
        if (EMAIL_REGEX.test(firstCell))
            emails.add(firstCell);
    }
    return Array.from(emails);
}
function stripQuotes(value) {
    return value.replace(/^"|"$/g, '').trim();
}
function parseCsvNameEmail(csvText) {
    const lines = csvText.split(/\r?\n/);
    const seen = new Set();
    const rows = [];
    for (const line of lines) {
        const cells = line.split(',').map(stripQuotes).filter(Boolean);
        if (cells.length === 0)
            continue;
        const emailCell = cells.find((c) => EMAIL_REGEX.test(c.toLowerCase()));
        if (!emailCell)
            continue;
        const email = emailCell.toLowerCase();
        if (seen.has(email))
            continue;
        seen.add(email);
        const nameCell = cells.find((c) => c.toLowerCase() !== email && c);
        rows.push({ name: nameCell ?? email.split('@')[0], email });
    }
    return rows;
}
//# sourceMappingURL=csv.js.map