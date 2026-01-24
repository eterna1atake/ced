import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import HeroCarousel from "@/collections/HeroCarousel";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { logSystemEvent } from "@/lib/audit";
import { headers } from "next/headers";
import { revalidateTag } from "next/cache";

export const dynamic = 'force-dynamic';

const HeroSchema = z.object({
    src: z.string().min(1, "Image source is required"),
    alt: z.union([
        z.string().max(200, "Alt text is too long"),
        z.object({
            th: z.string().optional(),
            en: z.string().optional()
        })
    ]).optional().default(""),
    order: z.number().int().optional().default(0),
    isActive: z.boolean().optional().default(true),
}).passthrough(); // Allow extra fields like 'id' from frontend but ignore them

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
        const heroes = await HeroCarousel.find({}).sort({ order: 1, createdAt: -1 });
        return NextResponse.json(heroes);
    } catch (error) {
        console.error("Error fetching heroes:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        await dbConnect();
        const body = await request.json();

        // Debug logging to catch validation errors
        console.log("POST /api/admin/hero - Request Body:", JSON.stringify(body, null, 2));

        const parsed = HeroSchema.safeParse(body);
        if (!parsed.success) {
            console.error("Validation failed for Hero:", JSON.stringify(parsed.error.format(), null, 2));
            return NextResponse.json({
                error: "Validation failed",
                details: parsed.error.flatten()
            }, { status: 400 });
        }

        const newHero = await HeroCarousel.create(parsed.data);

        // Audit Log
        const headersList = await headers();
        const ip = headersList.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
        await logSystemEvent({
            action: "CREATE_CONTENT",
            actorEmail: session.user?.email || "unknown",
            details: `Created Hero Image: ${newHero.alt || "No Alt"}`,
            ip,
            targetId: String(newHero._id)
        });

        revalidateTag('hero-carousel');
        return NextResponse.json(newHero, { status: 201 });
    } catch (error: unknown) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const err = error as any;
        console.error("Error creating hero:", err);
        return NextResponse.json({ error: `Internal Server Error: ${err.message || "Unknown error"}` }, { status: 500 });
    }
}
