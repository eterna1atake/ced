import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import Program from "@/collections/Program";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        await dbConnect();
        const programs = await Program.find({}).sort({ level: 1 }).select('-detail');
        return NextResponse.json(programs);
    } catch (error) {
        console.error("Error fetching programs:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
