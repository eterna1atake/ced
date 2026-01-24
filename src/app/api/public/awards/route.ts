import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import Award from "@/collections/Award";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        await dbConnect();
        const awards = await Award.find({}).sort({ year: -1, createdAt: -1 });
        return NextResponse.json(awards);
    } catch (error) {
        console.error("Error fetching public awards:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
