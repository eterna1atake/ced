import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import News from "@/collections/News";

export const dynamic = 'force-dynamic';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    const { slug } = await params;
    try {
        await dbConnect();

        // Find by slug and ensure it is published
        const newsItem = await News.findOne({ slug, status: "published" });

        if (!newsItem) {
            return NextResponse.json({ error: "News item not found" }, { status: 404 });
        }

        return NextResponse.json(newsItem);
    } catch (error) {
        console.error("Error fetching public news item:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
