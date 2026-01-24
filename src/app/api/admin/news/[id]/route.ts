import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import News from "@/collections/News";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { logSystemEvent } from "@/lib/audit";
import { headers } from "next/headers";

export const dynamic = 'force-dynamic';

// Validation Schema (Same as POST but allow partials if needed, or enforce full payload)
// For PUT, we usually expect full payload or at least validation of what's sent.
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

function sanitize(str: string) {
    if (!str) return "";
    return str.replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gim, "")
        .replace(/<[^>]*>/g, "");
}

async function getAdminSession() {
    const session = await auth();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const user = session?.user as any;
    if (!session || user?.role !== "superuser") {
        return null;
    }
    return session;
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        await dbConnect();
        const news = await News.findById(id);
        if (!news) {
            return NextResponse.json({ error: "News item not found" }, { status: 404 });
        }
        return NextResponse.json(news);
    } catch (error) {
        console.error("Error fetching news item:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
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

        // Sanitization
        const sanitizedData = {
            ...data,
            slug: sanitize(data.slug),
            title: { th: sanitize(data.title.th), en: sanitize(data.title.en) },
            summary: { th: sanitize(data.summary.th), en: sanitize(data.summary.en) },
            content: {
                th: data.content.th.replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gim, ""),
                en: data.content.en.replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gim, "")
            },
            author: { th: sanitize(data.author.th), en: sanitize(data.author.en) },
            category: sanitize(data.category),
            tags: data.tags.map(t => sanitize(t)),
        };

        // Check if slug is taken by ANOTHER item
        const existingSlug = await News.findOne({ slug: sanitizedData.slug, _id: { $ne: id } });
        if (existingSlug) {
            return NextResponse.json({ error: "Slug already exists. Please choose a unique slug." }, { status: 409 });
        }

        const updatedNews = await News.findByIdAndUpdate(id, sanitizedData, { new: true });

        if (!updatedNews) {
            return NextResponse.json({ error: "News item not found" }, { status: 404 });
        }

        // Audit Log
        const headersList = await headers();
        const ip = headersList.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
        await logSystemEvent({
            action: "UPDATE_CONTENT",
            actorEmail: session.user?.email || "unknown",
            details: `Updated News: ${updatedNews.title.en}`,
            ip,
            targetId: String(updatedNews._id)
        });

        return NextResponse.json(updatedNews);

    } catch (error: unknown) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const err = error as any;
        console.error("Error updating news:", err);
        return NextResponse.json({ error: `Internal Server Error: ${err.message || "Unknown error"}` }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        await dbConnect();
        const deletedNews = await News.findByIdAndDelete(id);

        if (!deletedNews) {
            return NextResponse.json({ error: "News item not found" }, { status: 404 });
        }

        // Audit Log
        const headersList = await headers();
        const ip = headersList.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
        await logSystemEvent({
            action: "DELETE_CONTENT",
            actorEmail: session.user?.email || "unknown",
            details: `Deleted News: ${deletedNews.title?.en || id}`,
            ip,
            targetId: String(id)
        });

        return NextResponse.json({ success: true, message: "News item deleted successfully" });

    } catch (error) {
        console.error("Error deleting news:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
