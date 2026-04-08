import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * Image proxy for Facebook CDN images.
 * Facebook blocks direct hotlinking from external sites,
 * so we fetch the image server-side and stream it to the browser.
 */
export const GET = async (req: Request) => {
    const { searchParams } = new URL(req.url);
    const imageUrl = searchParams.get('url');

    if (!imageUrl) {
        return new NextResponse('Missing url', { status: 400 });
    }

    // Security: only allow Facebook CDN domains
    try {
        const parsed = new URL(imageUrl);
        const allowedHosts = ['fbsbx.com', 'fbcdn.net', 'facebook.com', 'fb.com'];
        const isAllowed = allowedHosts.some(host => parsed.hostname.endsWith(host));
        if (!isAllowed) {
            return new NextResponse('Domain not allowed', { status: 403 });
        }
    } catch {
        return new NextResponse('Invalid URL', { status: 400 });
    }

    try {
        const response = await fetch(imageUrl, {
            headers: {
                // Use facebookexternalhit to bypass hotlink protection
                'User-Agent': 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
                'Referer': 'https://www.facebook.com/',
                'Accept': 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
            },
            signal: AbortSignal.timeout(8000),
        });

        if (!response.ok) {
            return new NextResponse('Failed to fetch image', { status: 502 });
        }

        const contentType = response.headers.get('content-type') || 'image/jpeg';
        const buffer = await response.arrayBuffer();

        return new NextResponse(buffer, {
            status: 200,
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800', // Cache 1 day
                'Access-Control-Allow-Origin': '*',
            },
        });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Internal Server Error';
        console.error('[OG Image Proxy] Error:', message);
        return new NextResponse('Error fetching image', { status: 500 });
    }
};
