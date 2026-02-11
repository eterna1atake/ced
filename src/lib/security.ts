import { RateLimiterMemory } from 'rate-limiter-flexible';
import sanitizeHtml from 'sanitize-html';
import { NextResponse } from 'next/server';

// --- Rate Limiting ---
const rateLimiter = new RateLimiterMemory({
    points: 60, // 60 requests
    duration: 60, // Per 60 seconds
});

export async function rateLimit(req: Request) {
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    try {
        await rateLimiter.consume(ip);
    } catch {
        return NextResponse.json({ error: 'Too Many Requests' }, { status: 429 });
    }
    return null;
}

// --- Sanitization ---
export function sanitizeInput(input: string): string {
    if (typeof input !== 'string') return input;
    return sanitizeHtml(input, {
        allowedTags: [], // Remove all HTML tags
        allowedAttributes: {},
    }).trim();
}

// --- Validation Helper ---
export function validateUrl(url: string, allowedDomains: string[] = []): boolean {
    if (!url) return false;
    try {
        const parsed = new URL(url);
        if (allowedDomains.length > 0) {
            return allowedDomains.some(domain => parsed.hostname.endsWith(domain));
        }
        return true;
    } catch {
        return false;
    }
}
