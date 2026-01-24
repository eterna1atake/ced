import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import Personnel from "@/collections/Personnel";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        await dbConnect();
        const personnelDocs = await Personnel.find({}).sort({ createdAt: 1 }).lean();
        return NextResponse.json(personnelDocs);
    } catch (error) {
        console.error("Error fetching personnel:", error);
        return NextResponse.json({ error: "Failed to fetch personnel" }, { status: 500 });
    }
}
