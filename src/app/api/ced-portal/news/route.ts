import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import News from "@/collections/News";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { logSystemEvent } from "@/lib/audit";
import { headers } from "next/headers";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Validation Schema
const LocalizedStringSchema = z.object({
    th: z.string().default(""),
    en: z.string().default(""),
});

const NewsSchema = z.object({
    slug: z.string().trim().min(1, "Slug is required").regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
    title: z.object({
        th: z.string().trim().min(1, "Thai title is required"),
        en: z.string().trim().min(1, "English title is required"),
    }),
    summary: LocalizedStringSchema,
    content: LocalizedStringSchema,
    imageSrc: z.string().optional().default(""),
    imageAlt: z.string().optional().default(""),
    galleryImages: z.array(z.string()).optional().default([]),
    category: z.string().trim().min(1, "Category is required"),
    date: z.string().or(z.date()).transform((val) => new Date(val)),
    author: LocalizedStringSchema,
    status: z.enum(['published', 'draft', 'archived']).default('draft'),
    tags: z.array(z.string()).optional().default([]),
    isPinned: z.boolean().optional().default(false),
    pinnedAt: z.string().or(z.date()).optional().nullable().transform((val) => val ? new Date(val) : null),
});

import { sanitizeStrict, sanitizeContent } from "@/lib/sanitize";

// sanitizeObject removed as it was unused and contained explicit any.


async function getAdminSession() {
    const session = await auth();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const user = session?.user as any;
    if (!session || user?.role !== "superuser") {
        return null;
    }
    return session;
}

export async function GET() {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        await dbConnect();
        // Force dynamic behavior by using headers or setting revalidate
        await headers(); // Ensure dynamic behavior in Next.js 15+
        
        const news = await News.find({})
            .sort({ isPinned: -1, pinnedAt: -1, date: -1 })
            .lean();

        console.log(`[DEBUG] GET /api/ced-portal/news - Received ${news.length} items.`);
        news.slice(0, 5).forEach((n: any, i: number) => {
            console.log(`[DEBUG] Item ${i}: id=${n._id}, title=${n.title?.en}, isPinned=${n.isPinned}`);
        });
            
        return NextResponse.json(news, {
            headers: {
                'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0',
            }
        });
    } catch (error) {
        console.error("Error fetching news:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// Imports cleaned up
import { incrementAdminWriteLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Rate Limit Check
    const headersList = await headers();
    const ip = headersList.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
    const email = session.user?.email || undefined;

    // Check and Consume in one step (increment calls handleLimit with 'consume')
    // Or prefer 'check' then 'consume' pattern? 
    // Usually standard is: check -> if ok -> process -> consume. 
    // But 'handleLimit' in rate-limit.ts returns success:false if limit exceeded on consume too.
    // Let's use check then increment if we want to separate logic, or just increment.
    // Looking at search: it does check then increment.

    // Actually, to be strict and fail fast:
    const limitResult = await incrementAdminWriteLimit(ip, email);
    if (!limitResult.success) {
        return NextResponse.json(
            { error: 'Too many requests', retryAfter: Math.ceil(limitResult.msBeforeNext / 1000) },
            { status: 429 }
        );
    }

    try {
        await dbConnect();
        const body = await request.json();
        const parsed = NewsSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
        }

        const data = parsed.data;

        // Secure Sanitization using sanitize-html
        const sanitizedData = {
            ...data,
            slug: sanitizeStrict(data.slug),
            title: { th: sanitizeStrict(data.title.th), en: sanitizeStrict(data.title.en) },
            summary: { th: sanitizeStrict(data.summary.th), en: sanitizeStrict(data.summary.en) },
            // Content: Allow Safe HTML tags
            content: {
                th: sanitizeContent(data.content.th),
                en: sanitizeContent(data.content.en)
            },
            author: { th: sanitizeStrict(data.author.th), en: sanitizeStrict(data.author.en) },
            category: sanitizeStrict(data.category),
            tags: data.tags.map(t => sanitizeStrict(t)),
        };

        // Check for duplicate slug
        const existing = await News.findOne({ slug: sanitizedData.slug });
        if (existing) {
            return NextResponse.json({ error: "Slug already exists. Please choose a unique slug.", code: "SLUG_EXISTS" }, { status: 409 });
        }

        const newNews = await News.create(sanitizedData);

        // Audit Log
        const headersList = await headers();
        const ip = headersList.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
        await logSystemEvent({
            action: "CREATE_CONTENT",
            actorEmail: session.user?.email || "unknown",
            details: `Created News: ${newNews.title.en} (${newNews.status})`,
            ip,
            targetId: String(newNews._id)
        });

        return NextResponse.json(newNews, { status: 201 });

    } catch (error: unknown) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const err = error as any;
        console.error("Error creating news:", err);
        return NextResponse.json({ error: `Internal Server Error: ${err.message || "Unknown error"}` }, { status: 500 });
    }
}
