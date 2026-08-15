export function slugify(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function stripHtml(content: string): string {
  return content
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

export function estimateReadingTime(content: string): number {
  const words = stripHtml(content).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

export function excerptFrom(content: string): string {
  const plain = stripHtml(content);
  const firstParagraph = content
    .split(/\n\n|<\/p>/i)
    .find((p) => stripHtml(p).length > 0);
  const flat = firstParagraph ? stripHtml(firstParagraph) : plain;
  return flat.length > 180 ? `${flat.slice(0, 177)}...` : flat;
}
