// src/lib/auth.ts
import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import clientPromise from "@/lib/mongodb";
import { authConfig } from "@/lib/auth.config";
import { checkRateLimit } from "@/lib/rate-limit"; // [New] Rate Limit
import { headers } from "next/headers"; // [New] for IP
import { logLoginAttempt } from "@/lib/audit";

// [Senior Optimization] In-memory cache for session invalidation check to reduce DB load
const SESSION_VERIFICATION_CACHE = new Map<string, { lastReset: number; timestamp: number }>();
const CACHE_TTL = 60 * 1000; // 1 minute cache duration

export type Role = "superuser" | "personnel";

class RateLimitError extends CredentialsSignin {
    code = "RateLimit";
    constructor(message: string) {
        super(message);
        this.code = message;
    }
}

class InvalidCredentialsError extends CredentialsSignin {
    constructor(code?: string) {
        super();
        this.code = code || "InvalidCredentials";
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
    _id: import("mongodb").ObjectId;
    email?: string;    // optional - ใช้สำหรับแจ้งเตือน Login เท่านั้น ตั้งค่าได้ภายหลัง
    username?: string; // Primary identifier - Admin Alias ที่ใช้ Login
    passwordHash: string;
    role: Role;
    isActive?: boolean;
    name?: string;
    personnelId?: import("mongodb").ObjectId;
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
    constructor(type: "TOTP" | "EMAIL" = "EMAIL") {
        super();
        this.code = `2fa-required:${type}`;
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
    // [Senior Optimization] Use projection to only fetch necessary fields
    return db.collection<DbUser>("users").findOne(
        {
            $or: [
                { username: username.toLowerCase() },
                { email: username.toLowerCase() }
            ]
        },
        {
            projection: {
                _id: 1,
                username: 1,
                email: 1,
                passwordHash: 1,
                role: 1,
                isActive: 1,
                name: 1,
                personnelId: 1,
                failedLoginAttempts: 1,
                lockoutUntil: 1,
                notificationEmail: 1,
                notificationEnabled: 1,
                trustedDevices: 1,
                totpEnabled: 1,
                totpSecret: 1,
                backupCodes: 1,
                lastPasswordReset: 1
            }
        }
    );
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

            // 2. [Senior Optimization] Session Invalidation Logic with Caching
            if (token?.sub) {
                const now = Date.now();
                const cached = SESSION_VERIFICATION_CACHE.get(token.sub);

                let lastReset: number | null = null;
                if (cached && (now - cached.timestamp < CACHE_TTL)) {
                    lastReset = cached.lastReset;
                } else {
                    try {
                        const client = await clientPromise;
                        const db = client.db(process.env.MONGODB_DB_NAME);
                        const { ObjectId } = await import("mongodb");

                        const dbUser = await db.collection<DbUser>("users").findOne(
                            { _id: new ObjectId(token.sub) },
                            { projection: { lastPasswordReset: 1 } }
                        );

                        if (dbUser) {
                            lastReset = dbUser.lastPasswordReset ? new Date(dbUser.lastPasswordReset).getTime() : 0;
                            SESSION_VERIFICATION_CACHE.set(token.sub, { lastReset, timestamp: now });
                        }
                    } catch (e) {
                        console.error("Session verification failed", e);
                    }
                }

                if (lastReset !== null && lastReset > 0) {
                    const tokenIssued = (token.iat as number) * 1000;
                    if (tokenIssued < lastReset - 1000) {
                        return null; // Invalidates token
                    }
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
                const { decrypt } = await import("@/lib/crypto");

                // --- 1. Password Decryption ---
                let rawPassword = (raw as Record<string, unknown>).password;
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

                // --- 2. [Senior Optimization] Parallel Auth Checks (Captcha, Rate Limit, User Lookup) ---
                const isProd = process.env.NODE_ENV === "production";
                
                // [Fix] Bypass captcha if an OTP code is provided (second step of login)
                // This prevents "Captcha verification failed" when submitting the 2FA code.
                const otpCodeFromRaw = (raw as Record<string, unknown>).code as string | undefined;
                const isOtpStep = !!(otpCodeFromRaw && otpCodeFromRaw !== "undefined" && otpCodeFromRaw !== "" && otpCodeFromRaw !== "null");

                const shouldVerifyCaptcha = (isProd || !!process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY) && !isOtpStep;
                const captchaToken = (raw as Record<string, unknown>).captchaToken as string | undefined;

                const { getClientIp } = await import("@/lib/ip");
                const ip = await getClientIp();

                const [captchaValid, rateLimitRes, user] = await Promise.all([
                    shouldVerifyCaptcha ? (import("@/lib/captcha").then(m => m.verifyCaptcha(captchaToken))) : Promise.resolve(true),
                    checkRateLimit(ip, username),
                    findUserByUsername(username)
                ]);

                if (!captchaValid) throw new InvalidCredentialsError("Captcha verification failed");

                if (!rateLimitRes.success) {
                    const blockedSeconds = Math.ceil(rateLimitRes.msBeforeNext / 1000);
                    throw new RateLimitError(`RateLimit:Block:${blockedSeconds}`);
                }

                const client = await clientPromise;
                const db = client.db(process.env.MONGODB_DB_NAME);
                const notificationEmail = user?.notificationEmail as string | undefined;
                const isNotificationEnabled = user?.notificationEnabled === true;

                let userAgent: string | undefined;
                try {
                    const headersList = await (headers() as unknown as Headers);
                    userAgent = headersList.get("user-agent") || undefined;
                } catch { /* ignore */ }

                // --- 5. Account Lockout Check ---
                if (user?.lockoutUntil && new Date() < new Date(user.lockoutUntil)) {
                    const diff = Math.ceil((new Date(user.lockoutUntil).getTime() - Date.now()) / 1000);
                    if (notificationEmail && isNotificationEnabled) {
                        import("@/lib/mail").then(({ sendLoginNotification }) => {
                            sendLoginNotification(notificationEmail, "BLOCKED", ip, userAgent, `Account Locked for ${username} (${diff}s remaining)`);
                        });
                    }
                    await logLoginAttempt({
                        username,
                        ip,
                        userAgent,
                        status: "BLOCKED",
                        reason: `Account Locked (${diff}s remaining)`
                    });
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
                        const updateFields: Record<string, unknown> = { failedLoginAttempts: currentAttempts };
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
                    await logLoginAttempt({
                        username,
                        ip,
                        userAgent,
                        status: "FAILED",
                        reason: user ? "Invalid password" : "User not found"
                    });
                    const { incrementRateLimit } = await import("@/lib/rate-limit");
                    const rateLimitResult = await incrementRateLimit(ip, username);
                    throw new InvalidCredentialsError(`InvalidCredentials:${rateLimitResult.remaining}`);
                }

                // --- 7. Authorization & Role ---
                if (user.isActive === false) {
                    await logLoginAttempt({ username, ip, userAgent, status: "FAILED", reason: "Inactive Account" });
                    throw new InactiveAccountError();
                }
                if (user.role !== "superuser") {
                    await logLoginAttempt({ username, ip, userAgent, status: "FAILED", reason: "Forbidden Role" });
                    throw new ForbiddenError();
                }
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
                let otpCode = (raw as Record<string, unknown>).code as string | undefined;
                if (otpCode === "undefined" || otpCode === "null" || otpCode === "") otpCode = undefined;

                if (!isTrustedDevice && user.totpEnabled) {
                    if (!otpCode) throw new TwoFactorRequiredError("TOTP");
                    const isBackupCode = user.backupCodes?.includes(otpCode);
                    if (isBackupCode) {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        await db.collection("users").updateOne({ _id: user._id }, { $pull: { backupCodes: otpCode } as any });
                    } else {
                        const { verifyTotp } = await import("@/lib/totp");
                        if (!verifyTotp(otpCode, user.totpSecret!)) {
                            await logLoginAttempt({ username, ip, userAgent, status: "FAILED", reason: "Invalid OTP" });
                            const { incrementOtpVerifyLimit } = await import("@/lib/rate-limit");
                            await incrementOtpVerifyLimit(ip, username);
                            throw new InvalidCredentialsError("Invalid OTP");
                        }
                    }
                }

                // --- 10. Device Trusting ---
                const shouldTrust = (raw as Record<string, unknown>).trustDevice === "true";
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

                await logLoginAttempt({
                    username: user.username || username,
                    ip,
                    userAgent,
                    status: "SUCCESS"
                });

                return {
                    id: String(user._id),
                    email: user.email || "",
                    username: user.username || username, // Ensure it's a string
                    name: user.name ?? "Superuser",
                    role: user.role,
                    personnelId: user.personnelId ? String(user.personnelId) : null,
                };
            },
        }),
    ],
});

declare module "next-auth" {
    interface Session {
        user: {
            id?: string;
            email?: string | null;
            name?: string | null;
            role?: Role | null;
            personnelId?: string | null;
            username?: string | null;
        }
    }
}

import { Session } from "next-auth";

export async function getAdminSession(): Promise<Session | null> {
    const session = await auth();
    const user = session?.user as { role?: Role } | undefined;
    if (!session || user?.role !== "superuser") {
        return null;
    }
    return session;
}
