import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import Classroom from "@/collections/Classroom";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { logSystemEvent } from "@/lib/audit";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

export const dynamic = 'force-dynamic';

const LocalizedStringSchema = z.object({
    th: z.string().trim().min(1, "Thai text is required"),
    en: z.string().trim().min(1, "English text is required"),
});

const DescriptionSchema = z.object({
    th: z.string().default(""),
    en: z.string().default(""),
});

// For update, fields can be partial, but ID usually shouldn't change easily or needs care
const ClassroomUpdateSchema = z.object({
    // ID is allowed in body but check if it matches param or handles rename logic (usually we don't rename IDs easily)
    name: LocalizedStringSchema.optional(),
    image: z.string().trim().min(1).optional(),
    description: DescriptionSchema.optional(),
    gallery: z.array(z.string()).optional(),
    capacity: z.string().trim().optional(),
    equipment: z.array(z.string()).optional(),
});

// Simple sanitization for XSS
function sanitize(str: string) {
    if (!str) return "";
    return str.replace(/[<>]/g, "");
}

async function getAdminSession() {
    const session = await auth();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const user = session?.user as any;
    if (!session || user?.role !== "superuser") {
        return null;
    }
    return session;
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> } // Fix for Next.js 15
) {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        await dbConnect();
        const { id } = await params;

        // Find by custom ID (e.g. 52-205)
        const classroom = await Classroom.findOne({ id: decodeURIComponent(id) });

        if (!classroom) {
            return NextResponse.json({ error: "Classroom not found" }, { status: 404 });
        }

        return NextResponse.json(classroom);
    } catch (error) {
        console.error("Error fetching classroom:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        await dbConnect();
        const { id } = await params;
        const body = await request.json();

        const parsed = ClassroomUpdateSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
        }

        const data = parsed.data;
        const targetId = decodeURIComponent(id);

        const existing = await Classroom.findOne({ id: targetId });
        if (!existing) {
            return NextResponse.json({ error: "Classroom not found" }, { status: 404 });
        }

        // Sanitization and Update Object construction
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const updateData: any = {};
        if (data.name) {
            updateData.name = {
                th: sanitize(data.name.th),
                en: sanitize(data.name.en),
            };
        }
        if (data.description) {
            updateData.description = {
                th: sanitize(data.description.th),
                en: sanitize(data.description.en),
            };
        }
        if (data.image !== undefined) updateData.image = data.image; // URL
        if (data.gallery !== undefined) updateData.gallery = data.gallery; // URLs
        if (data.capacity !== undefined) updateData.capacity = sanitize(data.capacity);
        if (data.equipment !== undefined) updateData.equipment = data.equipment.map(e => sanitize(e));

        const updatedClassroom = await Classroom.findOneAndUpdate(
            { id: targetId },
            { $set: updateData },
            { new: true, runValidators: true }
        );

        // Audit Log
        const headersList = await headers();
        const ip = headersList.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
        await logSystemEvent({
            action: "UPDATE_CONTENT",
            actorEmail: session.user?.email || "unknown",
            details: `Updated Classroom: ${targetId} (${updatedClassroom.name.en})`,
            ip,
            targetId: String(updatedClassroom._id)
        });

        revalidatePath('/[locale]/classroom');
        return NextResponse.json(updatedClassroom);
    } catch (error: unknown) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const err = error as any;
        console.error("Error updating classroom:", err);
        return NextResponse.json({ error: `Internal Server Error: ${err.message || "Unknown error"}` }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        await dbConnect();
        const { id } = await params;
        const targetId = decodeURIComponent(id);

        const deleted = await Classroom.findOneAndDelete({ id: targetId });

        if (!deleted) {
            return NextResponse.json({ error: "Classroom not found" }, { status: 404 });
        }

        // Audit Log
        const headersList = await headers();
        const ip = headersList.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
        await logSystemEvent({
            action: "DELETE_CONTENT",
            actorEmail: session.user?.email || "unknown",
            details: `Deleted Classroom: ${targetId} (${deleted.name.en})`,
            ip,
            targetId: String(deleted._id)
        });

        revalidatePath('/[locale]/classroom');
        return NextResponse.json({ success: true, message: "Classroom deleted" });
    } catch (error) {
        console.error("Error deleting classroom:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
