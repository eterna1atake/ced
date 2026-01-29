import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth"; // Ensure this path is correct for your NextAuth config
import argon2 from "argon2";
import clientPromise from "@/lib/mongodb";
import { z } from "zod";

import { zStrongPassword } from "@/lib/password";

const ChangePasswordSchema = z.object({
    currentPassword: z.string().min(1, "กรุณาระบุรหัสผ่านปัจจุบัน"),
    newPassword: zStrongPassword,
});

export async function POST(req: NextRequest) {
    try {
        // 0. CSRF Protection (Double Submit Cookie)
        const csrfCookie = req.cookies.get("ced_csrf_token")?.value;
        const csrfHeader = req.headers.get("x-csrf-token");

        if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) {
            return NextResponse.json({ error: "CSRF Error: Invalid Token" }, { status: 403 });
        }

        // 0.1 Rate Limiting Imports
        const { checkChangePasswordLimit, incrementChangePasswordLimit, resetChangePasswordLimit } = await import("@/lib/rate-limit");
        const { getClientIp } = await import("@/lib/ip");
        const ip = await getClientIp(req);
        const userAgent = req.headers.get("user-agent") ?? "unknown-ua";

        // 1. Check Authentication
        const session = await auth();
        if (!session || !session.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const email = session.user.email;

        // 2. Check Rate Limit (IP + Email)
        // Checked AFTER auth so we can scope to the user, preventing NAT blocking.
        const limitRes = await checkChangePasswordLimit(ip, email);
        if (!limitRes.success) {
            const blockedSeconds = Math.ceil(limitRes.msBeforeNext / 1000);
            return NextResponse.json({ error: `Too many attempts. Try again in ${blockedSeconds}s` }, { status: 429 });
        }

        const body = await req.json();
        const validation = await ChangePasswordSchema.safeParseAsync(body);

        if (!validation.success) {
            return NextResponse.json({ error: "ข้อมูลไม่ถูกต้อง" }, { status: 400 });
        }

        const { currentPassword, newPassword } = validation.data;

        if (currentPassword === newPassword) {
            return NextResponse.json({ error: "รหัสผ่านใหม่ต้องไม่ซ้ำกับรหัสผ่านเดิม" }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db(process.env.MONGODB_DB_NAME);

        // 3. Find User
        const user = await db.collection("users").findOne({ email });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // 4. Verify Current Password
        const isValid = await argon2.verify(user.passwordHash, currentPassword);
        if (!isValid) {
            // Increment rate limit on failure
            await incrementChangePasswordLimit(ip, email);
            return NextResponse.json({ error: "รหัสผ่านปัจจุบันไม่ถูกต้อง" }, { status: 400 });
        }

        // 5. Hash New Password
        const newPasswordHash = await argon2.hash(newPassword);

        // 6. Update Password & Invalidate Sessions
        await db.collection("users").updateOne(
            { _id: user._id },
            {
                $set: {
                    passwordHash: newPasswordHash,
                    lastPasswordReset: new Date(), // Trigger session invalidation
                    trustedDevices: [] // [Security] Revoke all trusted devices
                }
            }
        );

        // [New] Reset Rate Limit on Success
        await resetChangePasswordLimit(ip, email);

        // 7. Audit Log
        // 7. Audit Log
        try {
            const { logSystemEvent } = await import("@/lib/audit");

            await logSystemEvent({
                action: "CHANGE_PASSWORD",
                actorEmail: email,
                ip,
                userAgent,
                targetId: String(user._id),
                details: "User changed their own password"
            });

            // [New] Notification Email
            const { sendLoginNotification } = await import("@/lib/mail");
            sendLoginNotification(email, "SUCCESS", ip, userAgent, "Your password has been changed successfully.");
        } catch (auditErr) {
            console.error("Audit/Notification log failed:", auditErr);
        }

        return NextResponse.json({ message: "เปลี่ยนรหัสผ่านสำเร็จ" });

    } catch (error) {
        console.error("Change Password Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
