import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import translate from "google-translate-api-next";

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    try {
        // 1. Auth Check
        const session = await auth();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const user = session?.user as any;

        // Allow admin/superuser access
        if (!session || user?.role !== "superuser") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { text, target = 'en' } = body;

        if (!text) {
            return NextResponse.json({ error: "Text is required" }, { status: 400 });
        }

        // 2. Perform Translation
        // Defaulting to English target, Auto-detect source
        const res = await translate(text, { to: target });

        return NextResponse.json({ translatedText: res.text });

    } catch (error) {
        console.error("Translation API Error:", error);
        return NextResponse.json({ error: "Translation failed" }, { status: 500 });
    }
}
