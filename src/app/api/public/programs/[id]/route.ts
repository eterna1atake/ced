import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import Program from "@/collections/Program";

export const dynamic = 'force-dynamic';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        await dbConnect();
        const program = await Program.findOne({ id });
        if (!program) {
            return NextResponse.json({ error: "Program not found" }, { status: 404 });
        }
        return NextResponse.json(program);
    } catch (error) {
        console.error("Error fetching program detail:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
