import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import StudentService from "@/collections/StudentService";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { logSystemEvent } from "@/lib/audit";
import { headers } from "next/headers";

export const dynamic = 'force-dynamic';

const ServiceSchema = z.object({
    title: z.object({
        th: z.string().min(1, "Thai title is required"),
        en: z.string().min(1, "English title is required"),
    }),
    icon: z.string().optional().default(""),
    link: z.string().optional().default(""),
    category: z.enum(["software", "account", "network", "information-system", "service-area", "other"]).optional().default("other"),
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

export async function GET() {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        await dbConnect();
        const services = await StudentService.find({}).sort({ category: 1, createdAt: -1 });
        return NextResponse.json(services);
    } catch (error) {
        console.error("Error fetching services:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        await dbConnect();
        const body = await request.json();
        const parsed = ServiceSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
        }

        const data = parsed.data;

        // XSS Protection & Default Icon logic
        const sanitizedData = {
            ...data,
            title: {
                th: sanitize(data.title.th),
                en: sanitize(data.title.en),
            },
            link: data.link ? sanitize(data.link) : "",
            icon: data.icon && data.icon.trim() !== ""
                ? data.icon
                : "/images/service/default-service-icon.png"
        };

        const newService = await StudentService.create(sanitizedData);

        // Audit Log
        const headersList = await headers();
        const ip = headersList.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
        await logSystemEvent({
            action: "CREATE_CONTENT",
            actorEmail: session.user?.email || "unknown",
            details: `Created Student Service: ${newService.title.en} (Category: ${newService.category})`,
            ip,
            targetId: String(newService._id)
        });

        return NextResponse.json(newService, { status: 201 });
    } catch (error: unknown) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const err = error as any;
        console.error("Error creating student service:", err);
        return NextResponse.json({ error: `Internal Server Error: ${err.message || "Unknown error"}` }, { status: 500 });
    }
}
