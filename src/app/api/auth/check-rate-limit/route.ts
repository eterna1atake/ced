import { NextRequest, NextResponse } from "next/server";
import { getRateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
    try {
        const { email } = await req.json();

        // Get IP from headers (same logic as auth.ts)
        // Get IP from headers (consistent with auth.ts)
        const { getClientIp } = await import("@/lib/ip");
        const ip = await getClientIp(req);

        // Use new dual-key check
        const { success, msBeforeNext } = await getRateLimit(ip, email);

        if (!success) {
            return NextResponse.json({
                blocked: true,
                msBeforeNext: msBeforeNext,
                seconds: Math.ceil(msBeforeNext / 1000),
                reason: "RateLimit"
            }, { status: 429 });
        }

        // [New] Check Account Lockout (DB)
        if (email) {
            const { default: clientPromise } = await import("@/lib/mongodb");
            const client = await clientPromise;
            const db = client.db(process.env.MONGODB_DB_NAME);
            const user = await db.collection("users").findOne({ email: email.toLowerCase() }, { projection: { lockoutUntil: 1 } });

            if (user?.lockoutUntil && new Date() < new Date(user.lockoutUntil)) {
                const diffMs = new Date(user.lockoutUntil).getTime() - Date.now();
                return NextResponse.json({
                    blocked: true,
                    msBeforeNext: diffMs,
                    seconds: Math.ceil(diffMs / 1000),
                    reason: "AccountLocked"
                }, { status: 423 }); // 423 Locked
            }
        }

        return NextResponse.json({ blocked: false });

    } catch {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
