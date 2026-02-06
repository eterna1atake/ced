import { NextRequest, NextResponse } from "next/server";
import { getRateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
    try {
        const { email } = await req.json();

        // Get IP from headers
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

        if (email) {
            // [Security] Strict Admin Email Check
            const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
            if (adminEmail && email.toLowerCase() !== adminEmail) {
                // Return generic 403 or specific blocked reason
                // We return 'blocked: true' effectively but with specific reason for frontend
                return NextResponse.json({
                    blocked: true,
                    seconds: 0, // No countdown needed
                    reason: "UnauthorizedEmail"
                });
            }

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
