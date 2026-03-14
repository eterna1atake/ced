import { NextRequest, NextResponse } from "next/server";
import { getRateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
    try {
        const { username } = await req.json();

        // Get IP from headers
        const { getClientIp } = await import("@/lib/ip");
        const ip = await getClientIp(req);

        // Use new dual-key check
        const { success, msBeforeNext } = await getRateLimit(ip, username);

        if (!success) {
            return NextResponse.json({
                blocked: true,
                msBeforeNext: msBeforeNext,
                seconds: Math.ceil(msBeforeNext / 1000),
                reason: "RateLimit"
            }, { status: 429 });
        }

        if (username) {
            // [Security] Check DB for lockout status
            // Note: Role/permission verification is done by the auth system (auth.ts)
            const { default: clientPromise } = await import("@/lib/mongodb");
            const client = await clientPromise;
            const db = client.db(process.env.MONGODB_DB_NAME);
            const user = await db.collection("users").findOne(
                { username: username.toLowerCase() },
                { projection: { lockoutUntil: 1 } }
            );

            if (user?.lockoutUntil && new Date() < new Date(user.lockoutUntil)) {
                const diffMs = new Date(user.lockoutUntil).getTime() - Date.now();
                return NextResponse.json({
                    blocked: true,
                    msBeforeNext: diffMs,
                    seconds: Math.ceil(diffMs / 1000),
                    reason: "AccountLocked"
                }, { status: 423 });
            }
        }

        return NextResponse.json({ blocked: false });

    } catch {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
