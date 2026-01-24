
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import Program from "@/collections/Program";
import { auth } from "@/lib/auth";

export const dynamic = 'force-dynamic';

async function getAdminSession() {
    const session = await auth();
    const user = session?.user as any;
    if (!session || user?.role !== "superuser") {
        return null;
    }
    return session;
}

export async function GET() {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        await dbConnect();
        const programs = await Program.find({}).sort({ level: 1 }).lean();
        return NextResponse.json(programs);
    } catch (error) {
        console.error("Error fetching programs:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        await dbConnect();
        const body = await request.json();

        // Validate basic requirement
        if (!body.id) {
            return NextResponse.json({ error: "Program ID is required" }, { status: 400 });
        }

        // Check if ID already exists
        const existing = await Program.findOne({ id: body.id });
        if (existing) {
            return NextResponse.json({ error: "Program ID already exists" }, { status: 400 });
        }

        // Create new program
        const newProgram = await Program.create({
            ...body,
            // Ensure detail object exists if not provided
            detail: body.detail || {
                degree: { full: { th: "", en: "" }, short: { th: "", en: "" } },
                curriculum: [],
                documents: []
            }
        });

        return NextResponse.json(newProgram, { status: 201 });
    } catch (error: any) {
        console.error("Error creating program:", error);
        return NextResponse.json({
            error: "Failed to create program",
            message: error.message || "Unknown error"
        }, { status: 500 });
    }
}
