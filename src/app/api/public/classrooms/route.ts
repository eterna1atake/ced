import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import Classroom from "@/collections/Classroom";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        await dbConnect();

        const searchParams = request.nextUrl.searchParams;
        const building = searchParams.get('building');

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const query: any = {};

        if (building && building !== 'all') {
            // Regex to match ID starting with "building-"
            // e.g. "44" matches "44-xxx"
            query.id = { $regex: `^${building}-` };
        }

        const classrooms = await Classroom.find(query).sort({ id: 1 });

        return NextResponse.json(classrooms);
    } catch (error) {
        console.error("Error fetching classrooms:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
