import { getPublicPem } from "@/lib/crypto";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const publicKey = getPublicPem();
        return NextResponse.json({ publicKey });
    } catch {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
