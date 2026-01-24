import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import StudentService from "@/collections/StudentService";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        await dbConnect();
        const items = await StudentService.find({}).sort({ category: 1, createdAt: -1 }).lean();
        return NextResponse.json(items);
    } catch (error) {
        console.error("Error fetching student services:", error);
        return NextResponse.json({ error: "Failed to fetch student services" }, { status: 500 });
    }
}
