import { NextResponse } from 'next/server';
import { globalRateLimit as rateLimit } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

/**
 * Fetches Open Graph metadata from a given URL server-side.
 * This bypasses CORS and Facebook's iframe restrictions entirely.
 * Facebook always allows bots/crawlers to read OG Tags (used by WhatsApp, LINE, Twitter previews).
 */
export const GET = async (req: Request) => {
    const rateLimitError = await rateLimit(req);
    if (rateLimitError) return rateLimitError;

    const { searchParams } = new URL(req.url);
    const url = searchParams.get('url');

    if (!url) {
        return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
    }

    // Only allow Facebook URLs for security
    try {
        const parsed = new URL(url);
        if (!parsed.hostname.includes('facebook.com') && !parsed.hostname.includes('fb.com')) {
            return NextResponse.json({ error: 'Only Facebook URLs are allowed' }, { status: 403 });
        }
    } catch {
        return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
    }

    try {
        // Fetch the page HTML server-side (like WhatsApp/LINE do for link previews)
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'th,en;q=0.5',
            },
            redirect: 'follow',
            cache: 'no-store', // << Never cache at the Next.js fetch level
            signal: AbortSignal.timeout(8000),
        });

        if (!response.ok) {
            return NextResponse.json({ error: 'Failed to fetch URL', status: response.status }, { status: 502 });
        }

        // Get the raw bytes and decode properly as UTF-8
        const buffer = await response.arrayBuffer();
        const html = new TextDecoder('utf-8').decode(buffer);

        console.log('[OG Preview] Fetched HTML length:', html.length, 'for URL:', url);

        // Helper to extract OG tag content - handles both attribute orderings
        const getMetaContent = (property: string): string => {
            // Try all combinations of attribute ordering and quote styles
            const patterns = [
                // property="..." content="..."
                new RegExp(`<meta[^>]+property=["']${escapeRegex(property)}["'][^>]+content=["']([^"']*?)["']`, 'i'),
                // content="..." property="..."
                new RegExp(`<meta[^>]+content=["']([^"']*?)["'][^>]+property=["']${escapeRegex(property)}["']`, 'i'),
            ];
            for (const regex of patterns) {
                const match = html.match(regex);
                if (match?.[1]?.trim()) {
                    const raw = match[1];
                    console.log(`[OG Preview] ${property} raw value:`, raw.substring(0, 80));
                    return decodeHtmlEntities(raw.trim());
                }
            }
            return '';
        };

        const title = getMetaContent('og:title') || getMetaContent('twitter:title') || extractTitle(html);
        const description = getMetaContent('og:description') || getMetaContent('twitter:description') || '';
        const image = getMetaContent('og:image') || getMetaContent('twitter:image') || '';
        const siteName = getMetaContent('og:site_name') || 'Facebook';

        console.log('[OG Preview] Result:', { title: title.substring(0, 50), hasImage: !!image });

        return NextResponse.json(
            { title, description, image, siteName, url },
            {
                headers: {
                    // No caching so fixes take effect immediately
                    'Cache-Control': 'no-store, no-cache, must-revalidate',
                }
            }
        );
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Internal Server Error';
        console.error('[OG Preview] Error fetching URL:', url, message);
        return NextResponse.json({ error: message }, { status: 500 });
    }
};

function escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(':', ':');
}

/**
 * Decodes HTML entities including:
 * - Hex Unicode:     &#xe2b; → ห
 * - Decimal Unicode: &#3627; → ห
 * - Named entities:  &amp; &lt; &gt; etc.
 */
function decodeHtmlEntities(text: string): string {
    return text
        .replace(/&#x([0-9a-fA-F]+);/gi, (_, hex) =>
            String.fromCodePoint(parseInt(hex, 16))
        )
        .replace(/&#([0-9]+);/g, (_, dec) =>
            String.fromCodePoint(parseInt(dec, 10))
        )
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&apos;/g, "'")
        .replace(/&nbsp;/g, ' ');
}

function extractTitle(html: string): string {
    const match = html.match(/<title>([^<]+)<\/title>/i);
    return match?.[1] ? decodeHtmlEntities(match[1]) : '';
}
