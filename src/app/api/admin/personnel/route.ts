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

export async function GET() {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        await dbConnect();
        // Sort by created date for now, can be improved later
        const personnel = await Personnel.find({}).sort({ createdAt: -1 });
        return NextResponse.json(personnel);
    } catch (error) {
        console.error("Error fetching personnel:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        await dbConnect();
        const body = await request.json();
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
                url: link.url // URLs are trusted mostly, but Zod checks format
            })),
            // URLs typically don't need strict <> sanitization in the same way, but good practice to be safe or use a URL validator
            // We'll trust the input is a link, but could add specific URL validation in Zod
        };

        // Generate slug if not present
        if (!sanitizedData.slug && sanitizedData.name.en) {
            const baseSlug = generateSlug(sanitizedData.name.en);
            let slug = baseSlug;
            let counter = 1;

            // Allow duplicates for now or handle collision?
            // Proper way: check DB.
            while (await Personnel.findOne({ slug })) {
                slug = `${baseSlug}-${counter}`;
                counter++;
            }
            sanitizedData.slug = slug;
        }

        const newPersonnel = await Personnel.create(sanitizedData);

        // Audit Log
        const headersList = await headers();
        const ip = headersList.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
        await logSystemEvent({
            action: "CREATE_CONTENT",
            actorEmail: session.user?.email || "unknown",
            details: `Created Personnel: ${newPersonnel.name.en} (${newPersonnel.position.en})`,
            ip,
            targetId: String(newPersonnel._id)
        });

        return NextResponse.json(newPersonnel, { status: 201 });
    } catch (error: unknown) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const err = error as any;
        console.error("Error creating personnel:", err);
        // Handle duplicate email error from Mongoose
        if (err.code === 11000) {
            return NextResponse.json({ error: "Email already exists" }, { status: 409 });
        }
        return NextResponse.json({ error: `Internal Server Error: ${err.message || "Unknown error"}` }, { status: 500 });
    }
}
