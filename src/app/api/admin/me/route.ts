import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

// Force this route to be dynamic (no static optimization) to avoid build errors with auth()
export const dynamic = "force-dynamic";

export async function GET() {
    const session = await auth();
    if (!session) return NextResponse.json({ ok: false }, { status: 401 });

    return NextResponse.json({
        ok: true,
        user: session.user,
    });
}
