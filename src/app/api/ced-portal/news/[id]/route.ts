import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import News from "@/collections/News";
import { getAdminSession } from "@/lib/auth";
import { NewsSchema } from "@/lib/validations/news";
import { logSystemEvent } from "@/lib/audit";
import { headers } from "next/headers";
import { sanitizeStrict, sanitizeContent } from "@/lib/sanitize";

export const dynamic = 'force-dynamic';

// Reusing sanitizeStrict for simple string sanitization
function sanitize(str: string) {
    if (!str) return "";
    return sanitizeStrict(str);
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

            content: {
                th: sanitizeContent(data.content.th),
                en: sanitizeContent(data.content.en)
            },
            author: { th: sanitize(data.author.th), en: sanitize(data.author.en) },
            category: sanitize(data.category),
            tags: data.tags.map(t => sanitize(t)),
            isPinned: data.isPinned,
            pinnedAt: data.pinnedAt,
        };

        // Check if slug is taken by ANOTHER item
        const existingSlug = await News.findOne({ slug: sanitizedData.slug, _id: { $ne: id } });
        if (existingSlug) {
            return NextResponse.json({ error: "Slug already exists. Please choose a unique slug.", code: "SLUG_EXISTS" }, { status: 409 });
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
            actor: (session.user as { username?: string }).username || "unknown",
            details: `Updated News: ${updatedNews.title.en}`,
            ip,
            targetId: String(updatedNews._id)
        });

        return NextResponse.json(updatedNews);

    } catch (error: unknown) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const err = error as any;
        console.error("Error updating news:", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
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
            actor: (session.user as { username?: string }).username || "unknown",
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
