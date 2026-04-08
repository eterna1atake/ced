import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import argon2 from "argon2";
import { z } from "zod";

import { zStrongPassword } from "@/lib/password";

const ResetSchema = z.object({
    username: z.string().min(1, "Username/Email Required"),
    otp: z.string().length(6, "OTP ต้องมี 6 หลัก"),
    newPassword: zStrongPassword,
    captchaToken: z.string().min(1, "Captcha Required"),
});

export async function POST(req: NextRequest) {
    try {

        const body = await req.json();
        const validation = await ResetSchema.safeParseAsync(body);

        if (!validation.success) {
            const firstError = validation.error.issues[0]?.message || "ข้อมูลไม่ถูกต้อง";
            return NextResponse.json({ error: firstError }, { status: 400 });
        }

        const { username, otp, newPassword, captchaToken } = validation.data;
        const normalizedUsername = username.toLowerCase();
        const userAgent = req.headers.get("user-agent") ?? "unknown-ua";

        // --- 1. Security & Rate Limiting ---
        const { getClientIp } = await import("@/lib/ip");
        const ip = await getClientIp(req);
        const { checkOtpVerifyLimit, incrementOtpVerifyLimit, resetOtpVerifyLimit } = await import("@/lib/rate-limit");

        // Check Rate Limit (3 attempts / 10 mins)
        const limitRes = await checkOtpVerifyLimit(ip, normalizedUsername);
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

        const client = await clientPromise;
        const db = client.db(process.env.MONGODB_DB_NAME);

        // Find user by either username/alias or legacy email
        const user = await db.collection("users").findOne({
            $or: [
                { username: normalizedUsername },
                { email: normalizedUsername }
            ]
        });

        if (!user) {
            await incrementOtpVerifyLimit(ip, normalizedUsername);
            return NextResponse.json({ error: "Invalid Request" }, { status: 400 });
        }

        // [New] Check TOTP (Google Authenticator) instead of Email OTP
        if (!user.totpEnabled || !user.totpSecret) {
            return NextResponse.json({ error: "บัญชีนี้ยังไม่ได้เปิดใช้งาน 2FA (TOTP)" }, { status: 400 });
        }

        const { verifyTotp } = await import("@/lib/totp");
        const isValidTotp = verifyTotp(otp, user.totpSecret);

        if (!isValidTotp) {
            await incrementOtpVerifyLimit(ip, normalizedUsername);
            return NextResponse.json({ error: "รหัส Google Authenticator ไม่ถูกต้อง" }, { status: 400 });
        }

        // Success: Reset limit
        await resetOtpVerifyLimit(ip, normalizedUsername);

        // 5. Update Password & Invalidate Sessions
        const passwordHash = await argon2.hash(newPassword);

        await db.collection("users").updateOne(
            { _id: user._id },
            {
                $set: {
                    passwordHash,
                    lastPasswordReset: new Date(), // [New] Invalidate Sessions
                    trustedDevices: [] // [Security] Revoke all trusted devices
                }
            }
        );

        // 6. Audit Log
        try {
            const { logSystemEvent } = await import("@/lib/audit");

            await logSystemEvent({
                action: "CHANGE_PASSWORD",
                actor: username,
                ip,
                userAgent,
                details: "Reset password via TOTP (Google Authenticator)",
                targetId: String(user._id)
            });

            // [New] Notification Email - Send to the configured admin notification email strictly
            const notificationSetting = await db.collection("settings").findOne({ key: "adminNotificationEmail" });
            const notificationEmail = notificationSetting?.value;
            
            if (notificationEmail) {
                const { sendLoginNotification } = await import("@/lib/mail");
                sendLoginNotification(notificationEmail, "SUCCESS", ip, userAgent, `Password has been reset for account: ${username}`);
            }
        } catch (e) {
            console.error("Audit log error", e);
        }

        return NextResponse.json({ message: "เปลี่ยนรหัสผ่านสำเร็จ" });

    } catch (error) {
        console.error("Reset Password Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
