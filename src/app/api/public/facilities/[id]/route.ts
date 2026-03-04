import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import Facility from "@/collections/Facility";

export const dynamic = 'force-dynamic';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        const { id } = await params;
        const targetId = decodeURIComponent(id);

        const facility = await Facility.findOne({ id: targetId });

        if (!facility) {
            return NextResponse.json({ error: "Facility not found" }, { status: 404 });
        }

        return NextResponse.json(facility);
    } catch (error) {
        console.error("Error fetching facility:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
