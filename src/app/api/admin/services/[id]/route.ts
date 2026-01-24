import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import StudentService from "@/collections/StudentService";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { logSystemEvent } from "@/lib/audit";
import { headers } from "next/headers";

const ServiceUpdateSchema = z.object({
    title: z.object({
        th: z.string().min(1).optional(),
        en: z.string().min(1).optional(),
    }).optional(),
    icon: z.string().optional(),
    link: z.string().optional(),
    category: z.enum(["software", "account", "network", "information-system", "service-area", "other"]).optional(),
});

// Simple sanitization for XSS
function sanitize(str: string) {
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

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const { id } = await params;
        await dbConnect();
        const service = await StudentService.findById(id);
        if (!service) return NextResponse.json({ error: "Not found" }, { status: 404 });
        return NextResponse.json(service);
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
        const parsed = ServiceUpdateSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json({ error: "Validation failed" }, { status: 400 });
        }

        const data = parsed.data;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const updateData: Record<string, any> = { ...data };

        // XSS Protection & Default Icon logic
        if (data.title) {
            updateData.title = {
                th: data.title.th ? sanitize(data.title.th) : undefined,
                en: data.title.en ? sanitize(data.title.en) : undefined,
            };
            // Clean up undefineds to avoid overwriting with null if that's not intended 
            // (though Mongoose might handle it, better be explicit)
            if (!updateData.title.th) delete updateData.title.th;
            if (!updateData.title.en) delete updateData.title.en;
        }

        if (data.link) updateData.link = sanitize(data.link);

        // If icon is being updated to an empty string, set it back to default
        if (updateData.icon === "") {
            updateData.icon = "/images/service/default-service-icon.png";
        }

        const updatedService = await StudentService.findByIdAndUpdate(id, updateData, { new: true });
        if (!updatedService) return NextResponse.json({ error: "Not found" }, { status: 404 });

        // Audit Log
        const headersList = await headers();
        const ip = headersList.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
        await logSystemEvent({
            action: "UPDATE_CONTENT",
            actorEmail: session.user?.email || "unknown",
            details: `Updated Student Service: ${updatedService.title.en} (ID: ${id})`,
            ip,
            targetId: id
        });

        return NextResponse.json(updatedService);
    } catch (error: unknown) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const err = error as any;
        console.error("Error updating service:", err);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const { id } = await params;
        await dbConnect();
        const deletedService = await StudentService.findByIdAndDelete(id);
        if (!deletedService) return NextResponse.json({ error: "Not found" }, { status: 404 });

        // Audit Log
        const headersList = await headers();
        const ip = headersList.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
        await logSystemEvent({
            action: "DELETE_CONTENT",
            actorEmail: session.user?.email || "unknown",
            details: `Deleted Student Service: ${deletedService.title.en} (ID: ${id})`,
            ip,
            targetId: id
        });

        return NextResponse.json({ message: "Deleted" });
    } catch {
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
