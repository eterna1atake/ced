import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import FormRequest from "@/collections/FormRequest";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        await dbConnect();
        const items = await FormRequest.find({}).sort({ categoryId: 1, createdAt: -1 }).lean();
        return NextResponse.json(items);
    } catch (error) {
        console.error("Error fetching form requests:", error);
        return NextResponse.json({ error: "Failed to fetch form requests" }, { status: 500 });
    }
}
