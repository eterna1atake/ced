import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import Award from "@/collections/Award";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { logSystemEvent } from "@/lib/audit";
import { headers } from "next/headers";

export const dynamic = 'force-dynamic';

const LocalizedStringSchema = z.object({
    th: z.string().trim().min(1, "Thai text is required"),
    en: z.string().trim().min(1, "English text is required"),
});

const AwardSchema = z.object({
    title: LocalizedStringSchema,
    project: LocalizedStringSchema,
    team: z.array(LocalizedStringSchema).min(1, "At least one team member is required"),
    advisors: z.array(LocalizedStringSchema).min(1, "At least one advisor is required"),
    image: z.string().min(1, "Main image is required"),
    gallery: z.array(z.string()).optional().default([]),
    year: z.string().min(1, "Year is required"),
    date: z.string().optional().default(""),
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
        const awards = await Award.find({}).sort({ year: -1, createdAt: -1 });
        return NextResponse.json(awards);
    } catch (error) {
        console.error("Error fetching awards:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        await dbConnect();
        const body = await request.json();
        const parsed = AwardSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
        }

        const newAward = await Award.create(parsed.data);

        // Audit Log
        const headersList = await headers();
        const ip = headersList.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
        await logSystemEvent({
            action: "CREATE_CONTENT",
            actorEmail: session.user?.email || "unknown",
            details: `Created Award: ${newAward.title.en}`,
            ip,
            targetId: String(newAward._id)
        });

        return NextResponse.json(newAward, { status: 201 });

    } catch (error: unknown) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const err = error as any;
        console.error("Error creating award:", err);
        return NextResponse.json({ error: `Internal Server Error: ${err.message || "Unknown error"}` }, { status: 500 });
    }
}
