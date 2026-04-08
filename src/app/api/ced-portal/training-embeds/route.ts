
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/mongoose';
import Setting from '@/collections/Setting';
import { globalRateLimit as rateLimit } from '@/lib/rate-limit';
import { sanitizeInput } from '@/lib/sanitize';

export const GET = async (req: Request) => {
    const rateLimitError = await rateLimit(req);
    if (rateLimitError) return rateLimitError;

    try {
        const session = await auth();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const user = session?.user as any;
        if (!session || user.role !== 'superuser') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        const keys = [
            'training_embed_1', 'training_embed_2', 'training_embed_3',
            'training_og_1', 'training_og_2', 'training_og_3',
        ];
        const settings = await Setting.find({ key: { $in: keys } });
        const getVal = (key: string) => settings.find(s => s.key === key)?.value;

        const result = {
            embed1: getVal('training_embed_1') || '',
            embed2: getVal('training_embed_2') || '',
            embed3: getVal('training_embed_3') || '',
            og1: getVal('training_og_1') || null,
            og2: getVal('training_og_2') || null,
            og3: getVal('training_og_3') || null,
        };

        return NextResponse.json(result);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Internal Server Error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export const PUT = async (req: Request) => {
    const rateLimitError = await rateLimit(req);
    if (rateLimitError) return rateLimitError;

    try {
        const session = await auth();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const user = session?.user as any;
        if (!session || user.role !== 'superuser') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const data = await req.json();
        let { embed1, embed2, embed3 } = data;
        embed1 = sanitizeInput(embed1 || '');
        embed2 = sanitizeInput(embed2 || '');
        embed3 = sanitizeInput(embed3 || '');

        /**
         * Fetch OG metadata from a Facebook post URL (server-to-server, no CORS issues).
         * Called once at save time — result is cached in DB.
         */
        const fetchOGData = async (url: string) => {
            if (!url) return null;
            try {
                const response = await fetch(url, {
                    headers: {
                        'User-Agent': 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
                        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                        'Accept-Language': 'th,en;q=0.5',
                    },
                    redirect: 'follow',
                    cache: 'no-store',
                    signal: AbortSignal.timeout(10000),
                });

                if (!response.ok) return null;

                const buffer = await response.arrayBuffer();
                const html = new TextDecoder('utf-8').decode(buffer);

                const getMetaContent = (property: string): string => {
                    const patterns = [
                        new RegExp(`<meta[^>]+property=["']${property}["'][^>]+content=["']([^"']*?)["']`, 'i'),
                        new RegExp(`<meta[^>]+content=["']([^"']*?)["'][^>]+property=["']${property}["']`, 'i'),
                    ];
                    for (const regex of patterns) {
                        const match = html.match(regex);
                        if (match?.[1]?.trim()) return decodeEntities(match[1].trim());
                    }
                    return '';
                };

                const title = getMetaContent('og:title') || getMetaContent('twitter:title');
                const description = getMetaContent('og:description') || getMetaContent('twitter:description');
                const image = getMetaContent('og:image') || getMetaContent('twitter:image');

                if (!title && !image) return null;
                return { title, description, image, url };
            } catch (err) {
                console.error('[Training Embeds] OG fetch failed for', url, err instanceof Error ? err.message : err);
                return null;
            }
        };

        // Fetch OG data for all 3 embeds in parallel (one-time cost at save time)
        const [og1, og2, og3] = await Promise.all([
            fetchOGData(embed1),
            fetchOGData(embed2),
            fetchOGData(embed3),
        ]);

        await dbConnect();

        const updates = [
            { key: 'training_embed_1', value: embed1 },
            { key: 'training_embed_2', value: embed2 },
            { key: 'training_embed_3', value: embed3 },
            { key: 'training_og_1', value: og1 },
            { key: 'training_og_2', value: og2 },
            { key: 'training_og_3', value: og3 },
        ];

        await Promise.all(updates.map(update =>
            Setting.findOneAndUpdate(
                { key: update.key },
                { value: update.value },
                { upsert: true, new: true }
            )
        ));

        return NextResponse.json({ success: true, og1, og2, og3 });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Internal Server Error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

function decodeEntities(text: string): string {
    return text
        .replace(/&#x([0-9a-fA-F]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
        .replace(/&#([0-9]+);/g, (_, dec) => String.fromCodePoint(parseInt(dec, 10)))
        .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&apos;/g, "'")
        .replace(/&nbsp;/g, ' ');
}
