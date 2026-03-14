// src/lib/auth.ts
import NextAuth, { CredentialsSignin } from "next-auth"; // [Updated]
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import clientPromise from "@/lib/mongodb";
import { authConfig } from "@/lib/auth.config";
import { checkRateLimit } from "@/lib/rate-limit"; // [New] Rate Limit
import { headers } from "next/headers"; // [New] for IP

export type Role = "superuser" | "personnel";

class RateLimitError extends CredentialsSignin {
    code = "RateLimit";
    constructor(message: string) {
        super(message);
        this.code = message;
    }
}

class InvalidCredentialsError extends CredentialsSignin {
    constructor(message?: string) {
        super(message);
        this.code = message || "InvalidCredentials";
    }
}

class InactiveAccountError extends CredentialsSignin {
    code = "InactiveAccount";
}

class ForbiddenError extends CredentialsSignin {
    code = "Forbidden";
    constructor(message?: string) {
        super(message || "Forbidden");
        this.code = message || "Forbidden";
    }
}

// กำหนดโครงสร้างข้อมูลผู้ใช้ที่คาดว่าจะได้จาก MongoDB
type DbUser = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    _id: any;
    email?: string;    // optional - ใช้สำหรับแจ้งเตือน Login เท่านั้น ตั้งค่าได้ภายหลัง
    username?: string; // Primary identifier - Admin Alias ที่ใช้ Login
    passwordHash: string;
    role: Role;
    isActive?: boolean;
    name?: string;
    personnelId?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
    resetOtpHash?: string;
    resetOtpExpires?: Date;
    loginOtpHash?: string;
    loginOtpExpires?: Date;
    lastPasswordReset?: Date; // [New] Session Invalidation
    // Account Lockout Fields
    failedLoginAttempts?: number;
    lockoutUntil?: Date;
    // [New] Per-user notification settings (moved from global settings)
    notificationEmail?: string;
    notificationEnabled?: boolean;
    // [New] Server-Side Trusted Devices
    trustedDevices?: {
        id: string;
        uaHash: string;
        expires: Date;
        lastUsed: Date;
    }[];
    // [New] TOTP Support
    totpEnabled?: boolean;
    totpSecret?: string;
    backupCodes?: string[];
    totpSecretPending?: string;
};

class AccountLockedError extends CredentialsSignin {
    code = "AccountLocked";
    constructor(seconds: number) {
        super(`AccountLocked:${seconds}`);
        this.code = `AccountLocked:${seconds}`;
    }
}

class TwoFactorRequiredError extends CredentialsSignin {
    code = "2FA_REQUIRED";
    constructor(type: "TOTP" | "EMAIL" = "EMAIL") {
        super(`2FA_REQUIRED:${type}`);
        this.code = `2FA_REQUIRED:${type}`;
    }
}

//ตรวจสอบข้อมูล (Validation Schema)
const LoginSchema = z.object({
    username: z.string().min(3, "ชื่อผู้ใช้สั้นเกินไป").toLowerCase(), // [Updated] email -> username
    password: z.string().min(8, "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร"),
});

//ค้นหาข้อมูลผู้ใช้ในฐานข้อมูล MongoDB
async function findUserByUsername(username: string): Promise<DbUser | null> {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME);
    // Find by either username or legacy email (for transition)
    return db.collection<DbUser>("users").findOne({
        $or: [
            { username: username.toLowerCase() },
            { email: username.toLowerCase() }
        ]
    });
}

export const { handlers, auth, signIn, signOut } = NextAuth({
    ...authConfig,
    secret: process.env.AUTH_SECRET,
    trustHost: true, // [New] Fix for "Configuration" error behind proxies/localhost
    callbacks: {
        ...authConfig.callbacks,
        async jwt({ token, user, trigger, session }) {
            // 1. Run default logic (from authConfig)
            if (authConfig.callbacks?.jwt) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const res = await authConfig.callbacks.jwt({ token, user, trigger, session } as any);
                if (res) Object.assign(token, res);
            }

            // 2. Session Invalidation Logic
            if (token?.sub) {
                try {
                    const client = await clientPromise;
                    const db = client.db(process.env.MONGODB_DB_NAME);
                    const { ObjectId } = await import("mongodb");

                    const dbUser = await db.collection<DbUser>("users").findOne(
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        { _id: new ObjectId(token.sub) as any },
                        { projection: { lastPasswordReset: 1 } }
                    );

                    if (dbUser?.lastPasswordReset) {
                        const lastReset = new Date(dbUser.lastPasswordReset).getTime();
                        const tokenIssued = (token.iat as number) * 1000;
                        // If token issued BEFORE last reset (with 1s buffer) -> Invalid
                        if (tokenIssued < lastReset - 1000) {
                            return null; // Invalidates token
                        }
                    }
                } catch (e) {
                    console.error("Session verification failed", e);
                }
            }
            return token;
        },
    },
    // ✅ ตัวจริงของ providers อยู่ที่นี่
    providers: [
        Credentials({
            name: "credentials",
            credentials: {
                username: { label: "Username", type: "text" },
                password: { label: "Password", type: "password" },
            },
            async authorize(raw) {
                const isDev = process.env.NODE_ENV === "development";
                const { decrypt } = await import("@/lib/crypto");

                // --- 1. Password Decryption ---
                let rawPassword = (raw as any).password;
                try {
                    if (typeof rawPassword === "string" && rawPassword.split(".").length === 5) {
                        rawPassword = await decrypt(rawPassword);
                    }
                } catch (e) {
                    console.error("[Auth] Password decryption failed:", e);
                }

                const rawWithDecrypted = { ...raw, password: rawPassword };
                const parsed = LoginSchema.safeParse(rawWithDecrypted);
                if (!parsed.success) return null;

                const { username, password } = parsed.data;

                // --- 2. Captcha Verification ---
                const codeProvided = (raw as any).code as string | undefined;
                const isTwoFactorStep = codeProvided && codeProvided !== "undefined" && codeProvided !== "";
                const captchaToken = (raw as any).captchaToken as string | undefined;

                if (!isTwoFactorStep && (process.env.NODE_ENV === "production" || process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY)) {
                    const { verifyCaptcha } = await import("@/lib/captcha");
                    const isCaptchaValid = await verifyCaptcha(captchaToken);
                    if (!isCaptchaValid) throw new InvalidCredentialsError("Captcha verification failed");
                }

                // --- 3. Rate Limiting ---
                const { getClientIp } = await import("@/lib/ip");
                const ip = await getClientIp();
                let userAgent: string | undefined;
                try {
                    const headersList = await (headers() as any);
                    userAgent = headersList.get("user-agent") || undefined;
                } catch { /* ignore */ }

                try {
                    const { success, msBeforeNext } = await checkRateLimit(ip, username);
                    if (!success) {
                        const blockedSeconds = Math.ceil(msBeforeNext / 1000);
                        throw new RateLimitError(`RateLimit:Block:${blockedSeconds}`);
                    }
                } catch (err: any) {
                    if (err instanceof RateLimitError) throw err;
                }

                // --- 4. Database Lookup & Notifications ---
                const user = await findUserByUsername(username);
                const client = await clientPromise;
                const db = client.db(process.env.MONGODB_DB_NAME);
                // Notification settings are stored per-user (not in global settings)
                const notificationEmail = user?.notificationEmail as string | undefined;
                const isNotificationEnabled = user?.notificationEnabled === true;

                // --- 5. Account Lockout Check ---
                if (user?.lockoutUntil && new Date() < new Date(user.lockoutUntil)) {
                    const diff = Math.ceil((new Date(user.lockoutUntil).getTime() - Date.now()) / 1000);
                    if (notificationEmail && isNotificationEnabled) {
                        import("@/lib/mail").then(({ sendLoginNotification }) => {
                            sendLoginNotification(notificationEmail, "BLOCKED", ip, userAgent, `Account Locked for ${username} (${diff}s remaining)`);
                        });
                    }
                    throw new AccountLockedError(diff);
                }

                // --- 6. Password Check ---
                let isValidPassword = false;
                if (user) {
                    try {
                        const argon2 = await import("argon2");
                        isValidPassword = await argon2.verify(user.passwordHash, password);
                    } catch (e) {
                        console.error("Argon2 verify error", e);
                    }
                }

                if (!user || !isValidPassword) {
                    if (user) {
                        const currentAttempts = (user.failedLoginAttempts || 0) + 1;
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        let updateFields: any = { failedLoginAttempts: currentAttempts };
                        if (currentAttempts >= 5) {
                            updateFields.lockoutUntil = new Date(Date.now() + 30 * 60 * 1000);
                            updateFields.failedLoginAttempts = 0;
                            if (notificationEmail && isNotificationEnabled) {
                                import("@/lib/mail").then(({ sendLoginNotification }) => {
                                    sendLoginNotification(notificationEmail, "BLOCKED", ip, userAgent, `User ${username} locked out after 5 attempts`);
                                });
                            }
                        }
                        await db.collection("users").updateOne({ _id: user._id }, { $set: updateFields });
                    }
                    const { incrementRateLimit } = await import("@/lib/rate-limit");
                    const rateLimitResult = await incrementRateLimit(ip, username);
                    throw new InvalidCredentialsError(`InvalidCredentials:${rateLimitResult.remaining}`);
                }

                // --- 7. Authorization & Role ---
                if (user.isActive === false) throw new InactiveAccountError();
                if (user.role !== "superuser") throw new ForbiddenError();
                const allowedMasterUsername = process.env.ADMIN_USERNAME?.trim().toLowerCase() || "ced_master_admin";
                
                // [Logic] Only allow the hardcoded master username OR any user with superuser role 
                // (Note: role check already passed above, but we keep this for consistency with project policy)
                if (user.username?.toLowerCase() !== allowedMasterUsername) {
                    // console.log("Standard admin access granted via DB role");
                }

                // --- 8. Trusted Device ---
                const { cookies } = await import("next/headers");
                const { verifyTrustedDeviceToken } = await import("@/lib/trusted-device");
                const cookieStore = await cookies();
                const trustedToken = cookieStore.get("ced_trusted_device")?.value;
                let isTrustedDevice = false;

                if (trustedToken) {
                    try {
                        const payload = await verifyTrustedDeviceToken(trustedToken);
                        if (payload && payload.username === user.username && user.trustedDevices) {
                            const device = user.trustedDevices.find(d => d.id === payload.tokenId);
                            if (device && new Date(device.expires) > new Date()) {
                                const crypto = await import("crypto");
                                const uaHash = crypto.createHash("sha256").update(userAgent || "unknown").digest("hex");
                                if (device.uaHash === uaHash) {
                                    isTrustedDevice = true;
                                    await db.collection("users").updateOne(
                                        { _id: user._id, "trustedDevices.id": payload.tokenId },
                                        { $set: { "trustedDevices.$.lastUsed": new Date() } }
                                    );
                                }
                            }
                        }
                    } catch (e) { console.warn("[Auth] Trusted device error", e); }
                }

                // --- 9. 2FA ---
                let otpCode = (raw as any).code as string | undefined;
                if (otpCode === "undefined" || otpCode === "null" || otpCode === "") otpCode = undefined;

                if (!isTrustedDevice && user.totpEnabled) {
                    if (!otpCode) throw new TwoFactorRequiredError("TOTP");
                    const isBackupCode = user.backupCodes?.includes(otpCode);
                    if (isBackupCode) {
                        await db.collection("users").updateOne({ _id: user._id }, { $pull: { backupCodes: otpCode } as any });
                    } else {
                        const { verifyTotp } = await import("@/lib/totp");
                        if (!verifyTotp(otpCode, user.totpSecret!)) {
                            const { incrementOtpVerifyLimit } = await import("@/lib/rate-limit");
                            await incrementOtpVerifyLimit(ip, username);
                            throw new InvalidCredentialsError("Invalid OTP");
                        }
                    }
                }

                // --- 10. Device Trusting ---
                const shouldTrust = (raw as any).trustDevice === "true";
                if (shouldTrust) {
                    const crypto = await import("crypto");
                    const tokenId = crypto.randomUUID();
                    const expires = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
                    const uaHash = crypto.createHash("sha256").update(userAgent || "unknown").digest("hex");
                    let currentDevices = user.trustedDevices || [];
                    if (currentDevices.length >= 5) {
                        currentDevices.sort((a, b) => new Date(a.lastUsed).getTime() - new Date(b.lastUsed).getTime());
                        currentDevices = currentDevices.slice(currentDevices.length - 4);
                    }
                    await db.collection("users").updateOne({ _id: user._id }, {
                        $set: { trustedDevices: [...currentDevices, { id: tokenId, uaHash, expires, lastUsed: new Date() }] }
                    });
                    const { signTrustedDeviceToken } = await import("@/lib/trusted-device");
                    const cookieVal = await signTrustedDeviceToken({ username: user.username ?? username, tokenId });
                    cookieStore.set("ced_trusted_device", cookieVal, {
                        httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 3 * 24 * 60 * 60
                    });
                }

                // --- 11. Finalize ---
                import("@/lib/rate-limit").then(m => m.resetRateLimit(ip, username));
                await db.collection("users").updateOne({ _id: user._id }, { $set: { failedLoginAttempts: 0 }, $unset: { lockoutUntil: "" } });

                if (notificationEmail && isNotificationEnabled) {
                    import("@/lib/mail").then(({ sendLoginNotification }) => {
                        sendLoginNotification(notificationEmail, "SUCCESS", ip, userAgent, `Success for alias: ${username}`);
                    });
                }

                return {
                    id: String(user._id),
                    email: user.email,
                    username: user.username,
                    name: user.name ?? "Superuser",
                    role: user.role,
                    personnelId: user.personnelId ? String(user.personnelId) : null,
                } as any;
            },
        }),
    ],
});

export async function getAdminSession() {
    const session = await auth();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const user = session?.user as any;
    if (!session || user?.role !== "superuser") {
        return null;
    }
    return session;
}
