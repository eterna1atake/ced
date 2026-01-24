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

const ClassroomSchema = z.object({
    id: z.string().trim().min(1, "ID is required").regex(/^(44|52)-/, "ID must start with 44- or 52-"),
    name: LocalizedStringSchema,
    image: z.string().trim().min(1, "Cover image is required"),
    description: DescriptionSchema,
    gallery: z.array(z.string()).optional().default([]),
    capacity: z.string().trim().optional().default(""),
    equipment: z.array(z.string()).optional().default([]),
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

export async function GET() {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        await dbConnect();
        // Sort by ID is usually reasonable for rooms
        const classrooms = await Classroom.find({}).sort({ id: 1 });
        return NextResponse.json(classrooms);
    } catch (error) {
        console.error("Error fetching classrooms:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        await dbConnect();
        const body = await request.json();
        const parsed = ClassroomSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
        }

        const data = parsed.data;

        // Check for duplicate ID
        const existing = await Classroom.findOne({ id: data.id });
        if (existing) {
            return NextResponse.json({ error: "Classroom ID already exists" }, { status: 409 });
        }

        // XSS Protection
        const sanitizedData = {
            ...data,
            id: sanitize(data.id),
            name: {
                th: sanitize(data.name.th),
                en: sanitize(data.name.en),
            },
            description: {
                th: sanitize(data.description.th),
                en: sanitize(data.description.en),
            },
            capacity: sanitize(data.capacity),
            equipment: data.equipment.map(e => sanitize(e)),
            // Images are URLs, less risk but can still be sanitized lightly or validated as URL
            // Assuming trusted internal upload, but simple sanitize is fine
        };

        const newClassroom = await Classroom.create(sanitizedData);

        // Audit Log
        const headersList = await headers();
        const ip = headersList.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
        await logSystemEvent({
            action: "CREATE_CONTENT",
            actorEmail: session.user?.email || "unknown",
            details: `Created Classroom: ${newClassroom.id} (${newClassroom.name.en})`,
            ip,
            targetId: String(newClassroom._id)
        });

        revalidatePath('/[locale]/classroom');
        return NextResponse.json(newClassroom, { status: 201 });
    } catch (error: unknown) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const err = error as any;
        console.error("Error creating classroom:", err);
        return NextResponse.json({ error: `Internal Server Error: ${err.message || "Unknown error"}` }, { status: 500 });
    }
}
