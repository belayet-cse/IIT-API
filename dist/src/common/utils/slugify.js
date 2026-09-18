"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.slugify = slugify;
exports.stripHtml = stripHtml;
exports.estimateReadingTime = estimateReadingTime;
exports.excerptFrom = excerptFrom;
function slugify(text) {
    return text
        .trim()
        .toLowerCase()
        .replace(/['"]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}
function stripHtml(content) {
    return content
        .replace(/<[^>]*>/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/\s+/g, ' ')
        .trim();
}
function estimateReadingTime(content) {
    const words = stripHtml(content).split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.round(words / 200));
}
function excerptFrom(content) {
    const plain = stripHtml(content);
    const firstParagraph = content
        .split(/\n\n|<\/p>/i)
        .find((p) => stripHtml(p).length > 0);
    const flat = firstParagraph ? stripHtml(firstParagraph) : plain;
    return flat.length > 180 ? `${flat.slice(0, 177)}...` : flat;
}
//# sourceMappingURL=slugify.js.map