import sanitizeHtml from 'sanitize-html';

const ALLOWED_STYLE_VALUES = {
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
    allowProtocolRelative: false,
  });
}
