import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function POST(req: NextRequest) {
    try {
        // 0. CSRF Protection (Origin Check)
        const origin = req.headers.get("origin");
        const host = req.headers.get("host");

        if (origin && host) {
            const originHost = origin.replace(/^https?:\/\//, "");
            if (originHost !== host) {
                return NextResponse.json({ error: "CSRF Error: Origin mismatch" }, { status: 403 });
            }
        }

        const { username, captchaToken } = await req.json();

        if (!username) {
            return NextResponse.json({ error: "Username/Email is required" }, { status: 400 });
        }

        // 0. Captcha Verification (Anti-Automation)
        if (process.env.NODE_ENV === "production" || process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY) {
            const { verifyCaptcha } = await import("@/lib/captcha");
            const isCaptchaValid = await verifyCaptcha(captchaToken);
            if (!isCaptchaValid) {
                return NextResponse.json({ error: "โปรดยืนยันตัวตนผ่าน ReCAPTCHA" }, { status: 400 });
            }
        }

        const normalizedUsername = username.toLowerCase();

        // Generic Success Message to prevent enumeration
        const GENERIC_SUCCESS = { message: "หากบัญชีถูกต้องและได้รับอนุญาต โปรดระบุรหัสจาก Google Authenticator App" };

        // 2. Persistent Rate Limit (OTP Request Tier)
        const { getClientIp } = await import("@/lib/ip");
        const ip = await getClientIp(req);
        const { incrementOtpRequestLimit } = await import("@/lib/rate-limit");

        const limitRes = await incrementOtpRequestLimit(ip, normalizedUsername);

        if (!limitRes.success) {
            const blockedSeconds = Math.ceil(limitRes.msBeforeNext / 1000);
            return NextResponse.json({ error: `กรุณารอ ${blockedSeconds} วินาทีก่อนลองใหม่` }, { status: 429 });
        }

        const client = await clientPromise;
        const db = client.db(process.env.MONGODB_DB_NAME);

        // Find by either username/alias or legacy email (fallback)
        // We prioritize the new Admin Alias policy
        const user = await db.collection("users").findOne({
            $or: [
                { username: normalizedUsername },
                { email: normalizedUsername }
            ]
        });

        if (!user) {
            console.warn(`[Auth] Password reset requested for non-existent account: ${normalizedUsername}`);
            return NextResponse.json(GENERIC_SUCCESS);
        }

        // 3. Log if they used email instead of alias (encouraging transition)
        if (user.email === normalizedUsername && user.username !== normalizedUsername) {
            console.info(`[Auth] User ${user.email} still using email for password reset. Recommend using Alias: ${user.username}`);
        }

        // 3. Authenticate User Existence for TOTP Reset flow
        // Instead of sending email OTP, we just verify user exists and has TOTP enabled

        // Check if TOTP is enabled
        if (!user.totpEnabled || !user.totpSecret) {
            return NextResponse.json({ error: "บัญชีนี้ไม่ได้เปิดใช้งาน Google Authenticator ไม่สามารถกู้รหัสผ่านได้" }, { status: 400 });
        }

        // 7. Audit Log
        try {
            const { logSystemEvent } = await import("@/lib/audit");
            await logSystemEvent({
                action: "REQUEST_RESET",
                actorEmail: username,
                ip,
                details: "Requested Password Reset (TOTP Flow)",
                targetId: String(user._id)
            });
        } catch (e) {
            console.error("Audit log error", e);
        }

        return NextResponse.json({ message: "โปรดระบุรหัสจาก Google Authenticator App" });

    } catch (error) {
        console.error("Forgot Password Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
