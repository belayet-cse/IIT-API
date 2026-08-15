export function slugify(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function estimateReadingTime(content: string): number {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

export function excerptFrom(content: string): string {
  const firstParagraph =
    content.split('\n\n').find((p) => p.trim().length > 0) ?? content;
  const flat = firstParagraph.replace(/\s+/g, ' ').trim();
  return flat.length > 180 ? `${flat.slice(0, 177)}...` : flat;
}
