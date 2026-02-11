
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/mongoose';
import Setting from '@/collections/Setting';
import { rateLimit, sanitizeInput } from '@/lib/security';

export const GET = async (req: Request) => {
    // Rate limit GET as well
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

        const keys = ['training_embed_1', 'training_embed_2', 'training_embed_3'];
        const settings = await Setting.find({ key: { $in: keys } });

        const result = {
            embed1: settings.find(s => s.key === 'training_embed_1')?.value || '',
            embed2: settings.find(s => s.key === 'training_embed_2')?.value || '',
            embed3: settings.find(s => s.key === 'training_embed_3')?.value || '',
        };

        return NextResponse.json(result);
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
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
        // Sanitize inputs
        let { embed1, embed2, embed3 } = data;
        embed1 = sanitizeInput(embed1 || '');
        embed2 = sanitizeInput(embed2 || '');
        embed3 = sanitizeInput(embed3 || '');

        // Helper to resolve redirects (e.g. for /share/ links)
        const resolveUrl = async (url: string) => {
            if (!url || !url.includes('facebook.com')) return url;
            // Only try to resolve if it looks like a short/share link
            if (url.includes('/share/') || url.length < 50) {
                try {
                    const res = await fetch(url, {
                        method: 'HEAD',
                        redirect: 'follow',
                        headers: {
                            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36'
                        }
                    });
                    // If we got a longer URL (likely the permalink), use it
                    if (res.url && res.url.length > url.length) {
                        // Extract the clean URL (remove extra tracking params if possible, but keep it simple for now)
                        const cleanUrl = new URL(res.url);
                        // If it redirected to a login page, it might still have the 'next' param or be useless. 
                        // But usually public posts redirect to the post page.
                        return cleanUrl.toString();
                    }
                } catch (e) {
                    // Ignore errors, use original
                }
            }
            return url;
        };

        // Resolve all URLs in parallel
        const [resolvedEmbed1, resolvedEmbed2, resolvedEmbed3] = await Promise.all([
            resolveUrl(embed1),
            resolveUrl(embed2),
            resolveUrl(embed3)
        ]);

        embed1 = resolvedEmbed1;
        embed2 = resolvedEmbed2;
        embed3 = resolvedEmbed3;

        await dbConnect();

        const updates = [
            { key: 'training_embed_1', value: embed1 },
            { key: 'training_embed_2', value: embed2 },
            { key: 'training_embed_3', value: embed3 },
        ];

        await Promise.all(updates.map(update =>
            Setting.findOneAndUpdate(
                { key: update.key },
                { value: update.value },
                { upsert: true, new: true }
            )
        ));

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
