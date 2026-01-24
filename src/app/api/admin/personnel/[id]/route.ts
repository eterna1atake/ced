import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import Personnel from "@/collections/Personnel";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { logSystemEvent } from "@/lib/audit";
import { headers } from "next/headers";

export const dynamic = 'force-dynamic';

const EducationSchema = z.object({
    level: z.object({ th: z.string(), en: z.string() }),
    major: z.object({ th: z.string(), en: z.string() }),
    university: z.object({ th: z.string(), en: z.string() }),
});

const CourseSchema = z.object({
    courseId: z.string().optional().default(""),
    th: z.string(),
    en: z.string(),
});

const CustomLinkSchema = z.object({
    title: z.string().trim().min(1, "Title is required"),
    url: z.string().trim().url("Invalid URL"),
});

const PersonnelSchema = z.object({
    name: z.object({
        th: z.string().trim().min(1, "Thai name is required"),
        en: z.string().trim().min(1, "English name is required"),
    }),
    position: z.object({
        th: z.string().trim().min(1, "Thai position is required"),
        en: z.string().trim().min(1, "English position is required"),
    }),
    email: z.string().trim().email("Invalid email address"),
    imageSrc: z.string().trim().optional().default(""),
    education: z.array(EducationSchema).optional().default([]),
    courses: z.array(CourseSchema).optional().default([]),
    room: z.string().trim().optional().default(""),
    phone: z.string().trim().optional().default(""),
    scopusLink: z.string().trim().url("Invalid Scopus URL").optional().or(z.literal("")).default(""),
    researchProfileLink: z.string().trim().url("Invalid Research Profile URL").optional().or(z.literal("")).default(""),
    googleScholarLink: z.string().trim().url("Invalid Google Scholar URL").optional().or(z.literal("")).default(""),
    slug: z.string().trim().optional(),
    customLinks: z.array(CustomLinkSchema).optional().default([]),
});

function generateSlug(name: string) {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
        .trim()
        .replace(/\s+/g, '-') // Replace spaces with -
        .replace(/-+/g, '-'); // Replace multiple - with single -
}

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

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        await dbConnect();
        const person = await Personnel.findById(id);
        if (!person) {
            return NextResponse.json({ error: "Personnel not found" }, { status: 404 });
        }
        return NextResponse.json(person);
    } catch (error) {
        console.error("Error fetching personnel:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        await dbConnect();
        const body = await request.json();

        // Remove _id from body if present to avoid immutable field error
        delete body._id;

        const parsed = PersonnelSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
        }

        const data = parsed.data;

        // XSS Protection
        const sanitizedData = {
            ...data,
            name: {
                th: sanitize(data.name.th),
                en: sanitize(data.name.en),
            },
            position: {
                th: sanitize(data.position.th),
                en: sanitize(data.position.en),
            },
            email: sanitize(data.email),
            room: sanitize(data.room),
            phone: sanitize(data.phone),
            customLinks: data.customLinks.map(link => ({
                title: sanitize(link.title),
                url: link.url
            })),
        };

        // Generate slug if not present in payload AND not present in DB (implied, we are updating)
        // Actually, let's just check if we want to add it.
        // If the user didn't send a slug, we might want to generate one if the *existing* doc doesn't have one,
        // OR if we want to update it based on name change?
        // Plan said: "generate if missing on Update".

        // We need to fetch current doc to see if it has a slug?
        // Or just rely on: if (!sanitizedData.slug && sanitizedData.name.en) -> try to generate.
        // But PUT replaces/merges.

        // Let's check if the doc exists first anyway to be safe (though findByIdAndUpdate does it)
        // But for unique slug check we need to be careful.

        if (!sanitizedData.slug && sanitizedData.name.en) {
            // Check if current doc has slug.
            const current = await Personnel.findById(id);
            if (current && !current.slug) {
                const baseSlug = generateSlug(sanitizedData.name.en);
                let slug = baseSlug;
                let counter = 1;
                while (await Personnel.findOne({ slug, _id: { $ne: id } })) {
                    slug = `${baseSlug}-${counter}`;
                    counter++;
                }
                sanitizedData.slug = slug;
            }
        }

        const updatedPerson = await Personnel.findByIdAndUpdate(id, sanitizedData, { new: true, runValidators: true });

        if (!updatedPerson) {
            return NextResponse.json({ error: "Personnel not found" }, { status: 404 });
        }

        // Audit Log
        const headersList = await headers();
        const ip = headersList.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
        await logSystemEvent({
            action: "UPDATE_CONTENT",
            actorEmail: session.user?.email || "unknown",
            details: `Updated Personnel: ${updatedPerson.name.en}`,
            ip,
            targetId: String(updatedPerson._id)
        });

        return NextResponse.json(updatedPerson);
    } catch (error: unknown) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const err = error as any;
        console.error("Error updating personnel:", err);
        if (err.code === 11000) {
            return NextResponse.json({ error: "Email already exists" }, { status: 409 });
        }
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        await dbConnect();
        const deletedPerson = await Personnel.findByIdAndDelete(id);

        if (!deletedPerson) {
            return NextResponse.json({ error: "Personnel not found" }, { status: 404 });
        }

        // Audit Log
        const headersList = await headers();
        const ip = headersList.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
        await logSystemEvent({
            action: "DELETE_CONTENT",
            actorEmail: session.user?.email || "unknown",
            details: `Deleted Personnel: ${deletedPerson.name.en}`,
            ip,
            targetId: String(deletedPerson._id)
        });

        return NextResponse.json({ message: "Personnel deleted successfully" });
    } catch (error) {
        console.error("Error deleting personnel:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
