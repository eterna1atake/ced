import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import StudentService from "@/collections/StudentService";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { logSystemEvent } from "@/lib/audit";
import { headers } from "next/headers";
import { sanitizeStrict } from "@/lib/sanitize";

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

async function getAdminSession() {
    const session = await auth();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const user = session?.user as any;
    if (!session || user?.role !== "superuser") {
        return null;
    }
    return session;
}

export async function GET(request: NextRequest) {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        await dbConnect();

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");
        const skip = (page - 1) * limit;

        const totalServices = await StudentService.countDocuments({});
        const services = await StudentService.find({})
            .sort({ category: 1, createdAt: -1 })
            .skip(skip)
            .limit(limit);

        return NextResponse.json({
            services,
            total: totalServices,
            page,
            totalPages: Math.ceil(totalServices / limit)
        });
    } catch (error) {
        console.error("Error fetching services:", error);
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
        const parsed = ServiceSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
        }

        const data = parsed.data;

        // XSS Protection & Default Icon logic
        const sanitizedData = {
            ...data,
            title: {
                th: sanitizeStrict(data.title.th),
                en: sanitizeStrict(data.title.en),
            },
            link: data.link ? sanitizeStrict(data.link) : "",
            icon: data.icon && data.icon.trim() !== ""
                ? data.icon
                : "/images/service/default-service-icon.png"
            // category is enum, checked by Zod
        };

        const newService = await StudentService.create(sanitizedData);

        // Audit Log
        const headersList = await headers();
        const ip = headersList.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
        await logSystemEvent({
            action: "CREATE_CONTENT",
            actor: session.user?.username || "unknown",
            details: `Created Student Service: ${newService.title.en} (Category: ${newService.category})`,
            ip,
            targetId: String(newService._id)
        });

        return NextResponse.json(newService, { status: 201 });
    } catch (error: unknown) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const err = error as any;
        console.error("Error creating student service:", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
