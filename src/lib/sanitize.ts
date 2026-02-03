import sanitizeHtml from 'sanitize-html';

// Sanitize Options
const STRICT_OPTIONS = {
    allowedTags: [],
    allowedAttributes: {},
    disallowedTagsMode: 'recursiveEscape' as const, // Escape tags instead of stripping content
};

const RICH_TEXT_OPTIONS = {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'h1', 'h2', 'h3', 'h4', 'span', 'div', 'u', 's']),
    allowedAttributes: {
        ...sanitizeHtml.defaults.allowedAttributes,
        'img': ['src', 'alt', 'width', 'height', 'class'],
        'div': ['class', 'style'],
        'span': ['class', 'style'],
        'p': ['class', 'style'],
        'td': ['class', 'style'],
        'th': ['class', 'style'],
        'a': ['href', 'name', 'target', 'class', 'style'],
    },
    allowedSchemes: ['http', 'https', 'mailto', 'data'],
};

/**
 * Helper for Strict Sanitization (Plain Text).
 * Removes all HTML tags. Use for names, titles, slugs, etc.
 */
export function sanitizeStrict(str: string | undefined | null) {
    if (!str) return "";
    return sanitizeHtml(str, STRICT_OPTIONS);
}

/**
 * Helper for Rich Text Sanitization (HTML Content).
 * Allows safe HTML tags (b, i, img, etc.) but removes scripts/iframes.
 * Use for content fields, descriptions, etc.
 */
export function sanitizeContent(str: string | undefined | null) {
    if (!str) return "";
    return sanitizeHtml(str, RICH_TEXT_OPTIONS);
}

/**
 * recursively sanitizes an object or array.
 * Uses sanitizeContent for all strings found.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function sanitizeRecursively(obj: any): any {
    if (typeof obj === 'string') {
        return sanitizeContent(obj);
    }
    if (Array.isArray(obj)) {
        return obj.map(item => sanitizeRecursively(item));
    }
    if (obj !== null && typeof obj === 'object') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result: any = {};
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                // Skip specific keys if needed, but safe to sanitize all for now
                result[key] = sanitizeRecursively(obj[key]);
            }
        }
        return result;
    }
    return obj;
}
