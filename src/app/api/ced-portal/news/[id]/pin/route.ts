import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import News from "@/collections/News";
import { auth } from "@/lib/auth";
import { logSystemEvent } from "@/lib/audit";
import { headers } from "next/headers";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const MAX_PINNED = 3;

async function getAdminSession() {
    const session = await auth();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const user = session?.user as any;
    if (!session || user?.role !== "superuser") {
        return null;
    }
    return session;
}

// PATCH /api/ced-portal/news/[id]/pin - Toggle pin status
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        await dbConnect();

        const newsItem = await News.findById(id);
        if (!newsItem) {
            console.error(`[DEBUG] News item NOT FOUND in DB for ID: ${id}`);
            return NextResponse.json({ error: "News item not found" }, { status: 404 });
        }

        const shouldPin = !newsItem.isPinned;
        console.log(`[DEBUG] Current state in DB: isPinned=${newsItem.isPinned}, will change to: ${shouldPin}`);

        // If pinning, check limit
        if (shouldPin) {
            const pinnedCount = await News.countDocuments({ isPinned: true });
            console.log(`[DEBUG] Current pinned count in DB: ${pinnedCount}`);
            if (pinnedCount >= MAX_PINNED) {
                return NextResponse.json(
                    { error: "Maximum pinned news reached", code: "MAX_PINNED", maxPinned: MAX_PINNED },
                    { status: 400 }
                );
            }
        }

        // Update the pin status with strict execution using findByIdAndUpdate for better ID handling
        const updatedNews = await News.findByIdAndUpdate(
            id,
            {
                $set: {
                    isPinned: shouldPin,
                    pinnedAt: shouldPin ? new Date() : null
                }
            },
            { new: true, runValidators: true }
        ).lean();

        console.log(`[DEBUG] Update result from DB:`, { 
            id: updatedNews?._id, 
            isPinned: updatedNews?.isPinned, 
            pinnedAt: updatedNews?.pinnedAt 
        });

        if (!updatedNews) {
            console.error(`[DEBUG] Failed to update news with ID: ${id}`);
            return NextResponse.json({ error: "Failed to update news item" }, { status: 500 });
        }

        // Audit Log
        const headersList = await headers();
        const ip = headersList.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
        await logSystemEvent({
            action: "UPDATE_CONTENT",
            actorEmail: session.user?.email || "unknown",
            details: `${shouldPin ? "Pinned" : "Unpinned"} News: ${updatedNews.title.en}`,
            ip,
            targetId: String(updatedNews._id)
        });

        return NextResponse.json({
            success: true,
            isPinned: shouldPin,
            item: updatedNews
        }, {
            headers: {
                'Cache-Control': 'no-store, no-cache, must-revalidate',
            }
        });

    } catch (error: unknown) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const err = error as any;
        console.error("Error toggling pin:", err);
        return NextResponse.json({ error: `Internal Server Error: ${err.message || "Unknown error"}` }, { status: 500 });
    }
}
