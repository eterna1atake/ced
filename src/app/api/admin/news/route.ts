import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import News from "@/collections/News";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { logSystemEvent } from "@/lib/audit";
import { headers } from "next/headers";

export const dynamic = 'force-dynamic';

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
});

// Helper for XSS Sanitization (removing basic tags)
function sanitize(str: string) {
    if (!str) return "";
    return str.replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gim, "")
        .replace(/<[^>]*>/g, ""); // Aggressive strip, might want to allow basic HTML if using WYSIWYG later
}

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
        // Return everything for admin, sorted by created date desc
        const news = await News.find({}).sort({ createdAt: -1 });
        return NextResponse.json(news);
    } catch (error) {
        console.error("Error fetching news:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        await dbConnect();
        const body = await request.json();
        const parsed = NewsSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
        }

        const data = parsed.data;

        // Custom Sanitization
        // We want to keep HTML in 'content' but strip scripts.
        // For other fields, we can be more aggressive if we want, but usually simple script stripping is enough.
        const sanitizedData = {
            ...data,
            slug: sanitize(data.slug),
            title: { th: sanitize(data.title.th), en: sanitize(data.title.en) },
            summary: { th: sanitize(data.summary.th), en: sanitize(data.summary.en) },
            // Content: Allow HTML tags but remove scripts
            content: {
                th: data.content.th.replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gim, ""),
                en: data.content.en.replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gim, "")
            },
            author: { th: sanitize(data.author.th), en: sanitize(data.author.en) },
            category: sanitize(data.category),
            tags: data.tags.map(t => sanitize(t)),
        };

        // Check for duplicate slug
        const existing = await News.findOne({ slug: sanitizedData.slug });
        if (existing) {
            return NextResponse.json({ error: "Slug already exists. Please choose a unique slug." }, { status: 409 });
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
