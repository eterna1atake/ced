import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import FormRequest from "@/collections/FormRequest";
import { getAdminSession } from "@/lib/auth";
import { logSystemEvent } from "@/lib/audit";
import { z } from "zod";

const formSchema = z.object({
    categoryId: z.string().min(1, "Category is required"),
    sectionId: z.string().min(1, "Section is required"),
    url: z.string().url("Valid URL is required"),
    th: z.object({
        name: z.string().min(1, "Thai name is required"),
    }),
    en: z.object({
        name: z.string().min(1, "English name is required"),
    }),
});

type Params = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Params) {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    try {
        await dbConnect();
        const form = await FormRequest.findById(id);
        if (!form) return NextResponse.json({ error: "Form not found" }, { status: 404 });
        return NextResponse.json(form);
    } catch (error) {
        console.error("Error fetching form request:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PUT(req: NextRequest, { params }: Params) {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    try {
        const body = await req.json();
        const validatedData = formSchema.parse(body);

        await dbConnect();
        const oldForm = await FormRequest.findById(id);
        if (!oldForm) return NextResponse.json({ error: "Form not found" }, { status: 404 });

        const updatedForm = await FormRequest.findByIdAndUpdate(id, validatedData, { new: true });

        await logSystemEvent({
            action: "UPDATE_CONTENT",
            actorEmail: session.user?.email || "unknown",
            details: `Updated Form Request: ${validatedData.en.name} (${id})`,
            ip: req.headers.get("x-forwarded-for")?.split(",")[0] || "unknown",
            targetId: String(id)
        });

        return NextResponse.json(updatedForm);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.issues }, { status: 400 });
        }
        console.error("Error updating form request:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: Params) {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    try {
        await dbConnect();
        const form = await FormRequest.findById(id);
        if (!form) return NextResponse.json({ error: "Form not found" }, { status: 404 });

        await FormRequest.findByIdAndDelete(id);

        await logSystemEvent({
            action: "DELETE_CONTENT",
            actorEmail: session.user?.email || "unknown",
            details: `Deleted Form Request: ${form.en.name} (${id})`,
            ip: req.headers.get("x-forwarded-for")?.split(",")[0] || "unknown",
            targetId: String(id)
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting form request:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

