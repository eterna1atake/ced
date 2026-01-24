import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import Classroom from "@/collections/Classroom";

export const dynamic = 'force-dynamic';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        const { id } = await params;
        const targetId = decodeURIComponent(id);

        const classroom = await Classroom.findOne({ id: targetId });

        if (!classroom) {
            return NextResponse.json({ error: "Classroom not found" }, { status: 404 });
        }

        return NextResponse.json(classroom);
    } catch (error) {
        console.error("Error fetching classroom:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
