"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitizeContent = sanitizeContent;
const sanitize_html_1 = __importDefault(require("sanitize-html"));
const ALLOWED_STYLE_VALUES = {
    color: [/^#[0-9a-f]{3,8}$/i, /^rgb\(/i, /^rgba\(/i],
    'background-color': [/^#[0-9a-f]{3,8}$/i, /^rgb\(/i, /^rgba\(/i],
    'text-align': [/^(left|right|center|justify)$/],
    'font-size': [/^\d+(\.\d+)?(px|pt|em|rem|%)$/],
    'font-family': [/^[\w\s,'"-]+$/],
    'line-height': [/^[\d.]+(px|em|%)?$/],
};
function sanitizeContent(html) {
    return (0, sanitize_html_1.default)(html, {
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
        allowedSchemesByTag: { img: ['data', 'http', 'https'] },
        allowProtocolRelative: false,
    });
}
//# sourceMappingURL=sanitize.js.map