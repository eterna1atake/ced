import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import Classroom from "@/collections/Classroom";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { logSystemEvent } from "@/lib/audit";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { sanitizeStrict, sanitizeContent } from "@/lib/sanitize";

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

import { incrementAdminWriteLimit } from "@/lib/rate-limit"; // Rate limit

export async function POST(request: NextRequest) {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Rate Limit Check
    const headersList = await headers();
    const ip = headersList.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
    const email = session.user?.email || undefined;

    const limitResult = await incrementAdminWriteLimit(ip, email);
    if (!limitResult.success) {
        return NextResponse.json(
            { error: 'Too many requests', retryAfter: Math.ceil(limitResult.msBeforeNext / 1000) },
            { status: 429 }
        );
    }

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
            id: sanitizeStrict(data.id),
            name: {
                th: sanitizeStrict(data.name.th),
                en: sanitizeStrict(data.name.en),
            },
            description: {
                th: sanitizeContent(data.description.th),
                en: sanitizeContent(data.description.en),
            },
            capacity: sanitizeStrict(data.capacity),
            equipment: data.equipment.map(e => sanitizeStrict(e)),
            // Images are URLs
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
