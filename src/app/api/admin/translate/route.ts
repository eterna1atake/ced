import { NextResponse } from "next/server";
import translate from "google-translate-api-next";

export async function POST(req: Request) {
    try {
        const { text, from = "th", to = "en" } = await req.json();

        if (!text) {
            return NextResponse.json({ error: "Text is required" }, { status: 400 });
        }

        const res = await translate(text, { from, to });

        return NextResponse.json({
            translatedText: res.text
        });
    } catch (error) {
        console.error("Translation error:", error);
        return NextResponse.json({ error: "Failed to translate text" }, { status: 500 });
    }
}
