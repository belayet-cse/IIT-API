import sanitizeHtml from 'sanitize-html';

// One CSS length (or 0 / auto), with an optional sign — used for margin,
// padding and indent so writers can adjust spacing in the editor. No url(),
// calc() or expressions are allowed by these patterns.
const LENGTH = String.raw`(?:-?\d+(?:\.\d+)?(?:px|pt|em|rem|%)?|auto)`;
const LENGTHS = new RegExp(`^${LENGTH}(?:\\s+${LENGTH}){0,3}$`);

const ALLOWED_STYLE_VALUES = {
  margin: [LENGTHS],
  'margin-top': [LENGTHS],
  'margin-right': [LENGTHS],
  'margin-bottom': [LENGTHS],
  'margin-left': [LENGTHS],
  padding: [LENGTHS],
  'padding-top': [LENGTHS],
  'padding-right': [LENGTHS],
  'padding-bottom': [LENGTHS],
  'padding-left': [LENGTHS],
  'text-indent': [LENGTHS],
  'letter-spacing': [LENGTHS],
  'word-spacing': [LENGTHS],
  'white-space': [/^(normal|pre-wrap|pre-line)$/],
  'font-weight': [/^(normal|bold|[1-9]00)$/],
  'font-style': [/^(normal|italic)$/],
  'text-decoration': [/^(none|underline|line-through)$/],
  color: [/^#[0-9a-f]{3,8}$/i, /^rgb\(/i, /^rgba\(/i],
  'background-color': [/^#[0-9a-f]{3,8}$/i, /^rgb\(/i, /^rgba\(/i],
  'text-align': [/^(left|right|center|justify)$/],
  'font-size': [/^\d+(\.\d+)?(px|pt|em|rem|%)$/],
  'font-family': [/^[\w\s,'"-]+$/],
  'line-height': [/^[\d.]+(px|em|%)?$/],
};

export function sanitizeContent(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: [
      'p',
      'br',
      'hr',
      'span',
      'div',
      'h1',
      'h2',
      'h3',
      'h4',
      'strong',
      'b',
      'em',
      'i',
      'u',
      's',
      'sup',
      'sub',
      'ul',
      'ol',
      'li',
      'a',
      'img',
      'table',
      'thead',
      'tbody',
      'tr',
      'td',
      'th',
      'blockquote',
      'pre',
      'code',
    ],
    allowedAttributes: {
      a: ['href', 'target', 'rel', 'title'],
      img: ['src', 'alt', 'width', 'height'],
      '*': ['style', 'class'],
    },
    allowedStyles: { '*': ALLOWED_STYLE_VALUES },
    allowedSchemes: ['http', 'https', 'mailto'],
    // Images inserted through the editor are embedded as base64 data: URIs
    // (no upload backend is configured) — without this, sanitize-html strips
    // the src entirely since data: isn't in the default allowedSchemes.
    allowedSchemesByTag: { img: ['data', 'http', 'https'] },
    allowProtocolRelative: false,
  });
}
