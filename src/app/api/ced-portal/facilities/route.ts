import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import Facility from "@/collections/Facility";
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

const FacilitySchema = z.object({
    id: z.string().trim().min(1, "ID is required").regex(/^(44|52)-/, "ID must start with 44- or 52-"),
    name: LocalizedStringSchema,
    image: z.string().trim().min(1, "Cover image is required"),
    description: DescriptionSchema.optional(),
    gallery: z.array(z.string()).optional().default([]),
    capacity: DescriptionSchema.optional(),
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
        const facilities = await Facility.find({}).sort({ id: 1 });
        return NextResponse.json(facilities);
    } catch (error) {
        console.error("Error fetching facilities:", error);
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
    const email = session.user?.username || undefined;

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
        const parsed = FacilitySchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
        }

        const data = parsed.data;

        // Check for duplicate ID
        const existing = await Facility.findOne({ id: data.id });
        if (existing) {
            return NextResponse.json({ error: "Facility ID already exists" }, { status: 409 });
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
                th: sanitizeContent(data.description?.th || ""),
                en: sanitizeContent(data.description?.en || ""),
            },
            capacity: {
                th: sanitizeStrict(data.capacity?.th || ""),
                en: sanitizeStrict(data.capacity?.en || ""),
            },
            equipment: data.equipment.map(e => sanitizeStrict(e)),
            // Images are URLs
        };

        const newFacility = await Facility.create(sanitizedData);

        // Audit Log
        const headersList = await headers();
        const ip = headersList.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
        await logSystemEvent({
            action: "CREATE_CONTENT",
            actor: session.user?.username || "unknown",
            details: `Created Facility: ${newFacility.id} (${newFacility.name.en})`,
            ip,
            targetId: String(newFacility._id)
        });

        revalidatePath('/[locale]/facilities');
        return NextResponse.json(newFacility, { status: 201 });
    } catch (error: unknown) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const err = error as any;
        console.error("Error creating facility:", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
