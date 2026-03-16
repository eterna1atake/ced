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

type Params = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Params) {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    try {
        await dbConnect();
        const resource = await OnlineResource.findById(id);
        if (!resource) return NextResponse.json({ error: "Resource not found" }, { status: 404 });
        return NextResponse.json(resource);
    } catch (error) {
        console.error("Error fetching online resource:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PUT(req: NextRequest, { params }: Params) {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    try {
        const body = await req.json();
        const validatedData = resourceSchema.parse(body);

        await dbConnect();

        // Check for duplicate key (excluding current resource)
        const existing = await OnlineResource.findOne({
            key: validatedData.key,
            _id: { $ne: id }
        });
        if (existing) {
            return NextResponse.json({ error: "Resource with this key already exists" }, { status: 400 });
        }

        const updatedResource = await OnlineResource.findByIdAndUpdate(id, validatedData, { new: true });
        if (!updatedResource) return NextResponse.json({ error: "Resource not found" }, { status: 404 });

        await logSystemEvent({
            action: "UPDATE_CONTENT",
            actorEmail: session.user?.email || "unknown",
            details: `Updated Online Resource: ${validatedData.en.title} (Key: ${validatedData.key})`,
            ip: req.headers.get("x-forwarded-for")?.split(",")[0] || "unknown",
            targetId: String(id)
        });

        return NextResponse.json(updatedResource);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.issues }, { status: 400 });
        }
        console.error("Error updating online resource:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: Params) {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    try {
        await dbConnect();
        const resource = await OnlineResource.findById(id);
        if (!resource) return NextResponse.json({ error: "Resource not found" }, { status: 404 });

        await OnlineResource.findByIdAndDelete(id);

        await logSystemEvent({
            action: "DELETE_CONTENT",
            actorEmail: session.user?.email || "unknown",
            details: `Deleted Online Resource: ${resource.en.title} (Key: ${resource.key})`,
            ip: req.headers.get("x-forwarded-for")?.split(",")[0] || "unknown",
            targetId: String(id)
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting online resource:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
