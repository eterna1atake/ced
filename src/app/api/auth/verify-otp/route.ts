import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import crypto from "crypto";

import { checkRateLimit, incrementRateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
    try {
        const { email, otp } = await req.json();

        if (!email || !otp) {
            return NextResponse.json({ error: "Email and OTP are required" }, { status: 400 });
        }

        // 0. Rate Limit (Brute Force Protection)
        const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
        const { success, msBeforeNext } = await checkRateLimit(ip, email);

        if (!success) {
            const blockedSeconds = Math.ceil(msBeforeNext / 1000);
            return NextResponse.json({ error: `พยายามผิดเกินกำหนด กรุณารอ ${blockedSeconds} วินาที` }, { status: 429 });
        }

        const client = await clientPromise;
        const db = client.db(process.env.MONGODB_DB_NAME);

        const user = await db.collection("users").findOne({ email: email.toLowerCase() });

        if (!user || !user.resetOtpHash || !user.resetOtpExpires) {
            // Even if invalid user, we should cost a point to prevent enumeration? 
            // Actually, keep it simple. If we return 400 here, attacker knows user doesn't exist/didn't ask OTP.
            // But we already have strict allowlist, so enumeration is less of a concern than brute force.
            // Let's increment limit here too just in case.
            await incrementRateLimit(ip, email);
            return NextResponse.json({ error: "Invalid Request" }, { status: 400 });
        }

        // 1. Check Expiry
        if (new Date() > new Date(user.resetOtpExpires)) {
            return NextResponse.json({ error: "OTP หมดอายุและใช้งานไม่ได้แล้ว" }, { status: 400 });
        }

        // 2. Check OTP
        const inputOtpHash = crypto.createHash("sha256").update(otp).digest("hex");
        if (inputOtpHash !== user.resetOtpHash) {
            // [Security] Increment fail count
            await incrementRateLimit(ip, email);

            // [Audit] Failed OTP
            try {
                const { logSystemEvent } = await import("@/lib/audit");
                await logSystemEvent({
                    action: "CHANGE_PASSWORD_FAILED",
                    actorEmail: email,
                    ip,
                    details: "Incorrect OTP Attempt",
                    targetId: String(user._id)
                });
            } catch { }

            return NextResponse.json({ error: "รหัส OTP ไม่ถูกต้อง" }, { status: 400 });
        }

        return NextResponse.json({ message: "OTP ถูกต้อง", valid: true });

    } catch (error) {
        console.error("Verify OTP Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
