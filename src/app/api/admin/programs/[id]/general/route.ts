import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import Program from "@/collections/Program";
import { auth } from "@/lib/auth";
import { logSystemEvent } from "@/lib/audit";
import { headers } from "next/headers";

export const dynamic = 'force-dynamic';

async function getAdminSession() {
    const session = await auth();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const user = session?.user as any;
    if (!session || user?.role !== "superuser") {
        return null;
    }
    return session;
}

export async function GET() {
    try {
        await dbConnect();
        const programs = await Program.find({}).sort({ level: 1 });
        return NextResponse.json(programs);
    } catch (error) {
        console.error("Error fetching programs:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    try {
        await dbConnect();
        const body = await request.json();

        // Simple update for general info
        const updatedProgram = await Program.findOneAndUpdate(
            { id },
            {
                $set: {
                    level: body.level,
                    imageSrc: body.imageSrc,
                    imageAlt: body.imageAlt,
                    link: body.link,
                    th: body.th,
                    en: body.en
                }
            },
            { new: true, upsert: true }
        );

        // Audit Log
        const headersList = await headers();
        const ip = headersList.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
        await logSystemEvent({
            action: "UPDATE_CONTENT",
            actorEmail: session.user?.email || "unknown",
            details: `Updated Program General Info: ${id}`,
            ip,
            targetId: String(updatedProgram._id)
        });

        return NextResponse.json(updatedProgram);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        console.error("Error updating program:", error);
        return NextResponse.json({
            error: "Failed to update program",
            message: error.message || "Unknown error"
        }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    try {
        await dbConnect();

        // Delete the program
        const deletedProgram = await Program.findOneAndDelete({ id });

        if (!deletedProgram) {
            return NextResponse.json({ error: "Program not found" }, { status: 404 });
        }

        // Audit Log
        const headersList = await headers();
        const ip = headersList.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
        await logSystemEvent({
            action: "DELETE_CONTENT",
            actorEmail: session.user?.email || "unknown",
            details: `Deleted Program: ${id}`,
            ip,
            targetId: String(deletedProgram._id)
        });

        return NextResponse.json({ message: "Program deleted successfully" });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        console.error("Error deleting program:", error);
        return NextResponse.json({
            error: "Failed to delete program",
            message: error.message || "Unknown error"
        }, { status: 500 });
    }
}
