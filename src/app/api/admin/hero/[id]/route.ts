import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import HeroCarousel from "@/collections/HeroCarousel";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { logSystemEvent } from "@/lib/audit";
import { headers } from "next/headers";
import { revalidateTag } from "next/cache";

const HeroUpdateSchema = z.object({
    src: z.string().min(1).optional(),
    alt: z.union([
        z.string().max(200, "Alt text is too long"),
        z.object({
            th: z.string().optional(),
            en: z.string().optional()
        })
    ]).optional(),
    order: z.number().int().optional(),
    isActive: z.boolean().optional(),
}).passthrough();

async function getAdminSession() {
    const session = await auth();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const user = session?.user as any;
    if (!session || user?.role !== "superuser") {
        return null;
    }
    return session;
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const { id } = await params;
        await dbConnect();
        const hero = await HeroCarousel.findById(id);
        if (!hero) return NextResponse.json({ error: "Not found" }, { status: 404 });
        return NextResponse.json(hero);
    } catch {
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const { id } = await params;
        await dbConnect();
        const body = await request.json();
        const parsed = HeroUpdateSchema.safeParse(body);
        if (!parsed.success) return NextResponse.json({ error: "Validation failed" }, { status: 400 });

        const updatedHero = await HeroCarousel.findByIdAndUpdate(id, parsed.data, { new: true });
        if (!updatedHero) return NextResponse.json({ error: "Not found" }, { status: 404 });

        // Audit Log
        const headersList = await headers();
        const ip = headersList.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
        const altText = typeof updatedHero.alt === 'object' ? updatedHero.alt.en : updatedHero.alt;

        await logSystemEvent({
            action: "UPDATE_CONTENT",
            actorEmail: session.user?.email || "unknown",
            details: `Updated Hero Image: ${altText || "No Alt"} (ID: ${id})`,
            ip,
            targetId: id
        });

        revalidateTag('hero-carousel');
        return NextResponse.json(updatedHero);
    } catch {
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const { id } = await params;
        await dbConnect();
        const deletedHero = await HeroCarousel.findByIdAndDelete(id);
        if (!deletedHero) return NextResponse.json({ error: "Not found" }, { status: 404 });

        // Audit Log
        const headersList = await headers();
        const ip = headersList.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
        await logSystemEvent({
            action: "DELETE_CONTENT",
            actorEmail: session.user?.email || "unknown",
            details: `Deleted Hero Image: ${deletedHero.alt || "No Alt"} (ID: ${id})`,
            ip,
            targetId: id
        });

        revalidateTag('hero-carousel');
        return NextResponse.json({ message: "Deleted" });
    } catch {
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
