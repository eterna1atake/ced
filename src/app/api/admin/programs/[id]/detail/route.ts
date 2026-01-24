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

        // Update detail field
        const updatedProgram = await Program.findOneAndUpdate(
            { id },
            {
                $set: {
                    detail: body
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
            details: `Updated Program Detailed Content: ${id}`,
            ip,
            targetId: String(updatedProgram._id)
        });

        return NextResponse.json(updatedProgram);
    } catch (error: any) {
        console.error("Error updating program details:", error);

        let message = error.message || "Unknown error";
        if (error.name === 'ValidationError') {
            message = Object.values(error.errors).map((err: any) => err.message).join(', ');
        }

        return NextResponse.json({
            error: "Failed to update details",
            message: message
        }, { status: 500 });
    }
}
