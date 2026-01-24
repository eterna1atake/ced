import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import News from "@/collections/News";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        await dbConnect();
        // Public API only returns published news
        const news = await News.find({ status: "published" }).sort({ createdAt: -1 });
        return NextResponse.json(news);
    } catch (error) {
        console.error("Error fetching public news:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
