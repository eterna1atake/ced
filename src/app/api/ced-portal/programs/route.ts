import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import Program from "@/collections/Program";
import { auth } from "@/lib/auth";
import { sanitizeRecursively, sanitizeStrict } from "@/lib/sanitize";

export const dynamic = 'force-dynamic';

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
        const programs = await Program.find({}).sort({ level: 1 }).lean();
        return NextResponse.json(programs);
    } catch (error) {
        console.error("Error fetching programs:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

import { incrementAdminWriteLimit } from "@/lib/rate-limit"; // Rate limit
import { headers } from "next/headers";

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

        // Validate basic requirement
        if (!body.id) {
            return NextResponse.json({ error: "Program ID is required" }, { status: 400 });
        }

        // Check if ID already exists
        const existing = await Program.findOne({ id: body.id });
        if (existing) {
            return NextResponse.json({ error: "Program ID already exists" }, { status: 400 });
        }

        // Sanitize
        // ID should be strict
        const id = sanitizeStrict(body.id);

        // The rest can be rich text (sanitizeRecursively uses sanitizeContent)
        const sanitizedBody = sanitizeRecursively(body);

        // Override id with strict version
        sanitizedBody.id = id;

        // Create new program
        const newProgram = await Program.create({
            ...sanitizedBody,
            // Ensure detail object exists if not provided (though sanitizeRecursively would process it if it exists)
            detail: sanitizedBody.detail || {
                degree: { full: { th: "", en: "" }, short: { th: "", en: "" } },
                curriculum: [],
                documents: []
            }
        });

        return NextResponse.json(newProgram, { status: 201 });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        console.error("Error creating program:", error);
        return NextResponse.json({
            error: "Failed to create program",
            message: error.message || "Unknown error"
        }, { status: 500 });
    }
}
