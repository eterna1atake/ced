import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import argon2 from "argon2";
import { z } from "zod";

import { zStrongPassword } from "@/lib/password";

const ResetSchema = z.object({
    email: z.string().email(),
    otp: z.string().length(6, "OTP ต้องมี 6 หลัก"),
    newPassword: zStrongPassword,
    captchaToken: z.string().min(1, "Captcha Required"),
});

export async function POST(req: NextRequest) {
    try {
        // 0. CSRF Protection (Double Submit Cookie)
        const csrfCookie = req.cookies.get("ced_csrf_token")?.value;
        const csrfHeader = req.headers.get("x-csrf-token");

        if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) {
            return NextResponse.json({ error: "CSRF Error: Invalid Token" }, { status: 403 });
        }

        const body = await req.json();
        const validation = await ResetSchema.safeParseAsync(body);

        if (!validation.success) {
            return NextResponse.json({ error: "ข้อมูลไม่ถูกต้อง" }, { status: 400 });
        }

        const { email, otp, newPassword, captchaToken } = validation.data;
        const normalizedEmail = email.toLowerCase();
        const userAgent = req.headers.get("user-agent") ?? "unknown-ua";

        // --- 1. Security & Rate Limiting ---
        const { getClientIp } = await import("@/lib/ip");
        const ip = await getClientIp(req);
        const { checkOtpVerifyLimit, incrementOtpVerifyLimit, resetOtpVerifyLimit } = await import("@/lib/rate-limit");

        // Check Rate Limit (3 attempts / 10 mins)
        const limitRes = await checkOtpVerifyLimit(ip, normalizedEmail);
        if (!limitRes.success) {
            const blockedSeconds = Math.ceil(limitRes.msBeforeNext / 1000);
            return NextResponse.json({ error: `พยายามผิดเกินกำหนด กรุณารอ ${blockedSeconds} วินาที` }, { status: 429 });
        }

        // Verify Captcha
        const { verifyCaptcha } = await import("@/lib/captcha");
        const isCaptchaValid = await verifyCaptcha(captchaToken);
        if (!isCaptchaValid) {
            return NextResponse.json({ error: "Captcha Validation Failed" }, { status: 400 });
        }

        // 2. Restricted Check again (Double safety)
        const allowedEmail = process.env.ALLOW_RESET_EMAIL;
        if (!allowedEmail || normalizedEmail !== allowedEmail.toLowerCase()) {
            return NextResponse.json({ error: "Unauthorized Email" }, { status: 403 });
        }

        const client = await clientPromise;
        const db = client.db(process.env.MONGODB_DB_NAME);

        // Find user by email
        const user = await db.collection("users").findOne({ email: normalizedEmail });

        if (!user) {
            await incrementOtpVerifyLimit(ip, normalizedEmail);
            return NextResponse.json({ error: "Invalid Request" }, { status: 400 });
        }

        // [New] Check TOTP (Google Authenticator) instead of Email OTP
        if (!user.totpEnabled || !user.totpSecret) {
            return NextResponse.json({ error: "บัญชีนี้ยังไม่ได้เปิดใช้งาน 2FA (TOTP)" }, { status: 400 });
        }

        const { verifyTotp } = await import("@/lib/totp");
        const isValidTotp = verifyTotp(otp, user.totpSecret);

        if (!isValidTotp) {
            await incrementOtpVerifyLimit(ip, normalizedEmail);
            return NextResponse.json({ error: "รหัส Google Authenticator ไม่ถูกต้อง" }, { status: 400 });
        }

        // Success: Reset limit
        await resetOtpVerifyLimit(ip, normalizedEmail);

        // 5. Update Password & Invalidate Sessions
        const passwordHash = await argon2.hash(newPassword);

        await db.collection("users").updateOne(
            { _id: user._id },
            {
                $set: {
                    passwordHash,
                    lastPasswordReset: new Date(), // [New] Invalidate Sessions
                    trustedDevices: [] // [Security] Revoke all trusted devices
                },
                // $unset: { resetOtpHash: "", resetOtpExpires: "" } // No longer dealing with Email OTP fields here
            }
        );

        // 6. Audit Log
        try {
            const { logSystemEvent } = await import("@/lib/audit");

            await logSystemEvent({
                action: "CHANGE_PASSWORD",
                actorEmail: email,
                ip,
                userAgent,
                details: "Reset password via TOTP (Google Authenticator)",
                targetId: String(user._id)
            });

            // [New] Notification Email
            const { sendLoginNotification } = await import("@/lib/mail");
            sendLoginNotification(email, "SUCCESS", ip, userAgent, "Your password has been reset using Google Authenticator.");
        } catch (e) {
            console.error("Audit log error", e);
        }

        return NextResponse.json({ message: "เปลี่ยนรหัสผ่านสำเร็จ" });

    } catch (error) {
        console.error("Reset Password Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
