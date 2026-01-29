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

        const { email, captchaToken } = await req.json();

        if (!email) {
            return NextResponse.json({ error: "Email is required" }, { status: 400 });
        }

        // 0. Captcha Verification (Anti-Automation)
        if (process.env.NODE_ENV === "production" || process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY) {
            const { verifyCaptcha } = await import("@/lib/captcha");
            const isCaptchaValid = await verifyCaptcha(captchaToken);
            if (!isCaptchaValid) {
                return NextResponse.json({ error: "โปรดยืนยันตัวตนผ่าน ReCAPTCHA" }, { status: 400 });
            }
        }

        // 1. Restricted Email Check (Silent Fail)
        const allowedEmail = process.env.ALLOW_RESET_EMAIL;
        const normalizedEmail = email.toLowerCase();

        // Generic Success Message to prevent enumeration
        const GENERIC_SUCCESS = { message: "หากอีเมลถูกต้องและได้รับอนุญาต ระบบจะส่งรหัส OTP ไปยังอีเมลของท่าน" };

        if (!allowedEmail || normalizedEmail !== allowedEmail.toLowerCase()) {
            // Log for admin but return success to user
            console.warn(`[Auth] Blocked password reset request for unauthorized email: ${normalizedEmail}`);
            // Fake delay to mimic processing? (Optional)
            return NextResponse.json(GENERIC_SUCCESS);
        }

        // 2. Persistent Rate Limit (OTP Request Tier)
        const { getClientIp } = await import("@/lib/ip");
        const ip = await getClientIp(req);
        const { incrementOtpRequestLimit } = await import("@/lib/rate-limit");

        const limitRes = await incrementOtpRequestLimit(ip, normalizedEmail);

        if (!limitRes.success) {
            const blockedSeconds = Math.ceil(limitRes.msBeforeNext / 1000);
            return NextResponse.json({ error: `กรุณารอ ${blockedSeconds} วินาทีก่อนขอ OTP ใหม่` }, { status: 429 });
        }

        const client = await clientPromise;
        const db = client.db(process.env.MONGODB_DB_NAME);

        const user = await db.collection("users").findOne({ email: normalizedEmail });
        if (!user) {
            console.warn(`[Auth] Password reset requested for non-existent user: ${normalizedEmail}`);
            return NextResponse.json(GENERIC_SUCCESS);
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
                actorEmail: email,
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
