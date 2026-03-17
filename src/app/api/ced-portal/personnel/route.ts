import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import Personnel from "@/collections/Personnel";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { logSystemEvent } from "@/lib/audit";
import { headers } from "next/headers";
import { sanitizeStrict } from "@/lib/sanitize";

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
    academicTitle: z.object({
        th: z.string().trim().optional().default(""),
        en: z.string().trim().optional().default(""),
    }).optional(),
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
        const parsed = PersonnelSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
        }

        const data = parsed.data;

        // XSS Protection
        const sanitizedData = {
            ...data,
            name: {
                th: sanitizeStrict(data.name.th),
                en: sanitizeStrict(data.name.en),
            },
            academicTitle: {
                th: sanitizeStrict(data.academicTitle?.th || ""),
                en: sanitizeStrict(data.academicTitle?.en || ""),
            },
            position: {
                th: sanitizeStrict(data.position.th),
                en: sanitizeStrict(data.position.en),
            },
            email: sanitizeStrict(data.email),
            room: sanitizeStrict(data.room),
            phone: sanitizeStrict(data.phone),
            customLinks: data.customLinks.map(link => ({
                title: sanitizeStrict(link.title),
                url: sanitizeStrict(link.url)
            })),
            scopusLink: sanitizeStrict(data.scopusLink),
            researchProfileLink: sanitizeStrict(data.researchProfileLink),
            googleScholarLink: sanitizeStrict(data.googleScholarLink),
            // education & courses are objects/arrays of strings, if they accept free text they should be sanitized too
            // assuming they are safe or strict validation handles it, but let's be safe for string fields
            education: data.education.map(edu => ({
                level: { th: sanitizeStrict(edu.level.th), en: sanitizeStrict(edu.level.en) },
                major: { th: sanitizeStrict(edu.major.th), en: sanitizeStrict(edu.major.en) },
                university: { th: sanitizeStrict(edu.university.th), en: sanitizeStrict(edu.university.en) }
            })),
            courses: data.courses.map(c => ({
                ...c,
                th: sanitizeStrict(c.th),
                en: sanitizeStrict(c.en)
            }))
        };

        // Generate slug if not present
        if (!sanitizedData.slug && sanitizedData.name.en) {
            const baseSlug = generateSlug(sanitizedData.name.en);
            let slug = baseSlug;
            let counter = 1;

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
            actor: session.user?.username || "unknown",
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
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
