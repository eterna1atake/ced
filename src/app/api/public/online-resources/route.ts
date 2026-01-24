import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import OnlineResource from "@/collections/OnlineResource";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        await dbConnect();
        const items = await OnlineResource.find({}).sort({ categoryKey: 1, createdAt: -1 }).lean();
        return NextResponse.json(items);
    } catch (error) {
        console.error("Error fetching online resources:", error);
        return NextResponse.json({ error: "Failed to fetch online resources" }, { status: 500 });
    }
}
