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

export async function GET() {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        await dbConnect();
        const forms = await FormRequest.find({}).sort({ categoryId: 1, createdAt: -1 });
        return NextResponse.json(forms);
    } catch (error) {
        console.error("Error fetching form requests:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const body = await req.json();
        const validatedData = formSchema.parse(body);

        await dbConnect();
        const newForm = await FormRequest.create(validatedData);

        await logSystemEvent({
            action: "CREATE_CONTENT",
            actorEmail: session.user?.email || "unknown",
            details: `Created Form Request: ${validatedData.en.name} (${validatedData.categoryId})`,
            ip: req.headers.get("x-forwarded-for")?.split(",")[0] || "unknown",
            targetId: String(newForm._id)
        });

        return NextResponse.json(newForm, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.issues }, { status: 400 });
        }
        console.error("Error creating form request:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
