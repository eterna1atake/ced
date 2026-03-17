import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";


import { checkRateLimit, incrementRateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
    try {
        const { username, otp } = await req.json();

        if (!username || !otp) {
            return NextResponse.json({ error: "Username and OTP are required" }, { status: 400 });
        }

        // 0. Rate Limit (Brute Force Protection)
        const { getClientIp } = await import("@/lib/ip");
        const ip = await getClientIp(req);
        
        const normalizedUsername = username.toLowerCase();
        const { success, msBeforeNext } = await checkRateLimit(ip, normalizedUsername);

        if (!success) {
            const blockedSeconds = Math.ceil(msBeforeNext / 1000);
            return NextResponse.json({ error: `พยายามผิดเกินกำหนด กรุณารอ ${blockedSeconds} วินาที` }, { status: 429 });
        }

        const client = await clientPromise;
        const db = client.db(process.env.MONGODB_DB_NAME);

        // Find by either username/alias or legacy email
        const user = await db.collection("users").findOne({
            $or: [
                { username: normalizedUsername },
                { email: normalizedUsername }
            ]
        });

        if (!user || !user.totpEnabled || !user.totpSecret) {
            await incrementRateLimit(ip, normalizedUsername);
            await incrementRateLimit(ip, normalizedUsername);
            return NextResponse.json({ error: "ข้อมูลไม่ถูกต้อง" }, { status: 400 });
        }

        // 1. Verify TOTP
        const { verifyTotp } = await import("@/lib/totp");
        const isValid = verifyTotp(otp, user.totpSecret);

        if (!isValid) {
            // [Security] Increment fail count
            await incrementRateLimit(ip, normalizedUsername);

            // [Audit] Failed OTP
            try {
                const { logSystemEvent } = await import("@/lib/audit");
                await logSystemEvent({
                    action: "CHANGE_PASSWORD_FAILED",
                    actor: username,
                    ip,
                    details: "Incorrect TOTP Attempt",
                    targetId: String(user._id)
                });
            } catch { }

            return NextResponse.json({ error: "รหัส Google Authenticator ไม่ถูกต้อง" }, { status: 400 });
        }

        return NextResponse.json({ message: "รหัสถูกต้อง", valid: true });

    } catch (error) {
        console.error("Verify OTP Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
