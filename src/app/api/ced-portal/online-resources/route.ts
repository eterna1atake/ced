import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import OnlineResource from "@/collections/OnlineResource";
import { getAdminSession } from "@/lib/auth";
import { logSystemEvent } from "@/lib/audit";
import { z } from "zod";

const resourceSchema = z.object({
    key: z.string().min(1, "Key is required"),
    link: z.string().url("Valid URL is required"),
    iconName: z.string().min(1, "Icon name is required"),
    imagePath: z.string().optional(),
    colorClass: z.string().default("bg-white"),
    categoryKey: z.enum(["learning_resources", "systems_tools"]),
    th: z.object({
        title: z.string().min(1, "Thai title is required"),
        description: z.string().min(1, "Thai description is required"),
    }),
    en: z.object({
        title: z.string().min(1, "English title is required"),
        description: z.string().min(1, "English description is required"),
    }),
});

export async function GET() {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        await dbConnect();
        const resources = await OnlineResource.find({}).sort({ categoryKey: 1, createdAt: -1 });
        return NextResponse.json(resources);
    } catch (error) {
        console.error("Error fetching online resources:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const body = await req.json();
        const validatedData = resourceSchema.parse(body);

        await dbConnect();

        // Check for duplicate key
        const existing = await OnlineResource.findOne({ key: validatedData.key });
        if (existing) {
            return NextResponse.json({ error: "Resource with this key already exists" }, { status: 400 });
        }

        const resource = await OnlineResource.create(validatedData);

        await logSystemEvent({
            action: "CREATE_CONTENT",
            actorEmail: session.user?.email || "unknown",
            details: `Created Online Resource: ${validatedData.en.title} (Key: ${validatedData.key})`,
            ip: req.headers.get("x-forwarded-for")?.split(",")[0] || "unknown",
            targetId: String(resource._id)
        });

        return NextResponse.json(resource, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.issues }, { status: 400 });
        }
        console.error("Error creating online resource:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
