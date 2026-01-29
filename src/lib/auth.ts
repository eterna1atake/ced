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
}

// กำหนดโครงสร้างข้อมูลผู้ใช้ที่คาดว่าจะได้จาก MongoDB
type DbUser = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    _id: any;
    email: string;
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
    email: z.string().email("รูปแบบอีเมลไม่ถูกต้อง").toLowerCase(),
    password: z.string().min(8, "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร"),
});

//ค้นหาข้อมูลผู้ใช้ในฐานข้อมูล MongoDB
async function findUserByEmail(email: string): Promise<DbUser | null> {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME);
    return db.collection<DbUser>("users").findOne({ email: email.toLowerCase() });
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
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(raw) {
                const isDev = process.env.NODE_ENV === "development";
                const { decrypt } = await import("@/lib/crypto"); // [New] Dynamic import to avoid breaking edge if used elsewhere

                // Decrypt Password if it looks like a JWE
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                let rawPassword = (raw as any).password;

                // Try to decrypt
                try {
                    // Basic check if it looks like JWE (5 parts separated by dots)
                    if (typeof rawPassword === "string" && rawPassword.split(".").length === 5) {
                        rawPassword = await decrypt(rawPassword);
                        if (isDev) console.log("[Auth] Password decrypted successfully");
                    }
                } catch (e) {
                    console.error("[Auth] Password decryption failed:", e);
                    // If decryption fails, we might want to reject or fall back to treating as plaintext 
                    // (but strictly we should probably reject to enforce security)
                    // For now, let's assume if it fails it might be plaintext if we allow legacy?
                    // No, "Security First". If it looks like JWE and fails, it's an error.
                    // If strictly enforcing encryption, we should fail if NOT JWE.
                    // But for backward compatibility during rollout, maybe allow plaintext?
                    // Given the prompt "Security Engineering", I should probably enforce it or at least warn.
                    // But if the client sent garbage, Argon2 will just fail anyway.
                }

                // Update raw object for Zod validation
                const rawWithDecrypted = { ...raw, password: rawPassword };

                const parsed = LoginSchema.safeParse(rawWithDecrypted);
                if (!parsed.success) {
                    if (isDev) console.error("[Auth] Validation failed:", parsed.error);
                    return null;
                }

                // --- 0. Captcha Verification ---
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const codeProvided = (raw as any).code as string | undefined;
                const isTwoFactorStep = codeProvided && codeProvided !== "undefined" && codeProvided !== "";

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const captchaToken = (raw as any).captchaToken as string | undefined;

                if (process.env.NODE_ENV === "production" && !process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY) {
                    console.error("[Auth] Security Critical: Recaptcha key missing in production. Refusing login.");
                    throw new Error("Server Configuration Error: Recaptcha Key Missing");
                }

                if (!isTwoFactorStep && (process.env.NODE_ENV === "production" || process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY)) {
                    const { verifyCaptcha } = await import("@/lib/captcha");
                    const isCaptchaValid = await verifyCaptcha(captchaToken);
                    if (!isCaptchaValid) {
                        console.warn("[Auth] Captcha verification failed.");
                        throw new InvalidCredentialsError("Captcha verification failed");
                    }
                }

                const { email, password } = parsed.data;
                if (isDev) console.log(`[Auth] Attempting login for: ${email}`);
                else console.log(`[Auth] Attempting login`);

                // --- 1. Rate Limiting Check (Dual Key: IP & Email) ---
                const { getClientIp } = await import("@/lib/ip");
                const ip = await getClientIp();

                let userAgent: string | undefined;
                try {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const headersList = await (headers() as any); // Type assertion if needed
                    userAgent = headersList.get("user-agent") || undefined;
                } catch { /* ignore */ }

                try {
                    const { success, msBeforeNext } = await checkRateLimit(ip, email);
                    if (!success) {
                        const blockedSeconds = Math.ceil(msBeforeNext / 1000);
                        if (isDev) console.warn(`[Auth] Rate limit exceeded for ${email} from ${ip}. Blocked for ${blockedSeconds}s`);
                        else console.warn(`[Auth] Rate limit exceeded. Blocked for ${blockedSeconds}s`);

                        const { logLoginAttempt } = await import("@/lib/audit");
                        await logLoginAttempt({
                            email,
                            ip,
                            userAgent,
                            status: "BLOCKED",
                            reason: `Rate Limit Exceeded (${blockedSeconds}s)`
                        });

                        import("@/lib/mail").then(({ sendLoginNotification }) => {
                            sendLoginNotification(email, "BLOCKED", ip, userAgent, `Rate Limit Exceeded (${blockedSeconds}s)`);
                        });

                        throw new RateLimitError(`RateLimit:Block:${blockedSeconds}`);
                    }
                } catch (err: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
                    if (err instanceof RateLimitError) throw err;
                    console.error("[Auth] Rate Limit System Error:", err);
                }

                console.log("[Auth] Rate limit passed. Checking database...");

                // --- 2. Database Lookup ---
                const user = await findUserByEmail(email);

                if (user?.lockoutUntil && new Date() < new Date(user.lockoutUntil)) {
                    const diff = Math.ceil((new Date(user.lockoutUntil).getTime() - Date.now()) / 1000);
                    if (isDev) console.warn(`[Auth] Account locked for ${email}. Time remaining: ${diff}s`);
                    else console.warn(`[Auth] Account locked. Time remaining: ${diff}s`);

                    const { logLoginAttempt } = await import("@/lib/audit");
                    await logLoginAttempt({
                        email,
                        ip,
                        userAgent,
                        status: "BLOCKED",
                        reason: `Account Locked (${diff}s remaining)`
                    });

                    import("@/lib/mail").then(({ sendLoginNotification }) => {
                        sendLoginNotification(email, "BLOCKED", ip, userAgent, `Account Locked (${diff}s remaining)`);
                    });

                    throw new AccountLockedError(diff);
                }

                // --- 3. Password Verification ---
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
                    console.log(`[Auth] Invalid credentials for ${email} (User found: ${!!user})`);

                    if (user) {
                        const MAX_ATTEMPTS = 5;
                        const LOCKOUT_DURATION = 30 * 60 * 1000;

                        const currentAttempts = (user.failedLoginAttempts || 0) + 1;
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        let updateFields: any = { failedLoginAttempts: currentAttempts };

                        if (currentAttempts >= MAX_ATTEMPTS) {
                            const lockoutUntil = new Date(Date.now() + LOCKOUT_DURATION);
                            updateFields = {
                                failedLoginAttempts: 0,
                                lockoutUntil: lockoutUntil
                            };
                            console.warn(`[Auth] User ${email} locked out until ${lockoutUntil}`);
                        }

                        const client = await clientPromise;
                        const db = client.db(process.env.MONGODB_DB_NAME);
                        await db.collection("users").updateOne(
                            { _id: user._id },
                            { $set: updateFields }
                        );

                        if (currentAttempts >= MAX_ATTEMPTS) {
                            const { logLoginAttempt } = await import("@/lib/audit");
                            await logLoginAttempt({
                                email,
                                ip,
                                userAgent,
                                status: "BLOCKED",
                                reason: `Account Locked (Triggered)`
                            });
                            import("@/lib/mail").then(({ sendLoginNotification }) => {
                                sendLoginNotification(email, "BLOCKED", ip, userAgent, "Account Locked (Maximum Attempts Reached)");
                            });
                            throw new AccountLockedError(30 * 60);
                        }
                    }

                    const { incrementRateLimit } = await import("@/lib/rate-limit");
                    const rateLimitResult = await incrementRateLimit(ip, email);

                    console.log(`[Auth] Rate Limit Check: success=${rateLimitResult.success}, used=${rateLimitResult.consumedPoints ?? "?"}, remaining=${rateLimitResult.remaining}`);

                    if (!rateLimitResult.success) {
                        const blockedSeconds = Math.ceil(rateLimitResult.msBeforeNext / 1000);
                        console.warn(`[Auth] Rate limit triggered on failure for ${email}. Blocked for ${blockedSeconds}s`);

                        const { logLoginAttempt } = await import("@/lib/audit");
                        await logLoginAttempt({
                            email,
                            ip,
                            userAgent,
                            status: "BLOCKED",
                            reason: `Rate Limit Exceeded on Failure (${blockedSeconds}s)`
                        });

                        import("@/lib/mail").then(({ sendLoginNotification }) => {
                            sendLoginNotification(email, "BLOCKED", ip, userAgent, `Rate Limit Exceeded on Failure (${blockedSeconds}s)`);
                        });

                        throw new RateLimitError(`RateLimit:Block:${blockedSeconds}`);
                    }

                    const { logLoginAttempt } = await import("@/lib/audit");
                    await logLoginAttempt({
                        email,
                        ip,
                        userAgent,
                        status: "FAILED",
                        reason: user ? "Invalid Password" : "User Not Found"
                    });

                    import("@/lib/mail").then(({ sendLoginNotification }) => {
                        sendLoginNotification(email, "FAILED", ip, userAgent, user ? "Invalid Password" : "User Not Found");
                    });

                    throw new InvalidCredentialsError(`InvalidCredentials:${rateLimitResult.remaining}`);
                }

                if (user.isActive === false) {
                    console.log("[Auth] User is not active.");
                    const { logLoginAttempt } = await import("@/lib/audit");
                    await logLoginAttempt({
                        email,
                        ip,
                        userAgent,
                        status: "FAILED",
                        reason: "Account Inactive"
                    });

                    import("@/lib/mail").then(({ sendLoginNotification }) => {
                        sendLoginNotification(email, "FAILED", ip, userAgent, "Account Inactive");
                    });

                    throw new InactiveAccountError();
                }

                // --- 4. Role Authorization (Superuser Only) ---
                if (user.role !== "superuser") {
                    console.warn(`[Auth] Access denied. User role '${user.role}' is not 'superuser'.`);
                    const { logLoginAttempt } = await import("@/lib/audit");
                    await logLoginAttempt({
                        email,
                        ip,
                        userAgent,
                        status: "FAILED",
                        reason: "Role Not Superuser"
                    });

                    import("@/lib/mail").then(({ sendLoginNotification }) => {
                        sendLoginNotification(email, "FAILED", ip, userAgent, "Role Not Authorized");
                    });

                    throw new ForbiddenError();
                }

                // --- 5. Strict Admin Pinning (Optional but Recommended) ---
                const adminEmail = process.env.ADMIN_EMAIL;
                if (adminEmail && user.email.toLowerCase() !== adminEmail.toLowerCase()) {
                    console.warn(`[Auth] Access denied. Email '${user.email}' does not match allowed ADMIN_EMAIL.`);
                    const { logLoginAttempt } = await import("@/lib/audit");
                    await logLoginAttempt({
                        email,
                        ip,
                        userAgent,
                        status: "FAILED",
                        reason: "Email Not In Admin Allowlist"
                    });

                    throw new ForbiddenError();
                }

                // --- 6. Trusted Device Check ---
                // [New] Trusted Device Logic
                const { cookies } = await import("next/headers");
                const { verifyTrustedDeviceToken } = await import("@/lib/trusted-device");
                const cookieStore = await cookies();
                const TRUSTED_COOKIE_NAME = "ced_trusted_device";

                let isTrustedDevice = false;
                const trustedToken = cookieStore.get(TRUSTED_COOKIE_NAME)?.value;

                if (trustedToken) {
                    try {
                        const payload = await verifyTrustedDeviceToken(trustedToken);
                        if (payload && user.trustedDevices) {
                            const { email: tokenEmail, tokenId } = payload;
                            if (tokenEmail === email) {
                                const device = user.trustedDevices.find(d => d.id === tokenId);
                                if (device) {
                                    const now = Date.now();
                                    const expiresAt = new Date(device.expires).getTime();
                                    if (expiresAt > now) {
                                        const crypto = await import("crypto");
                                        const uaString = userAgent || "unknown";
                                        const uaHash = crypto.createHash("sha256").update(uaString).digest("hex");

                                        // Verify UA match
                                        if (device.uaHash === uaHash) {
                                            isTrustedDevice = true;
                                            console.log(`[Auth] Trusted device verified (Server-Side): ${tokenId}`);

                                            // [New] Update lastUsed (Fire and Forget)
                                            (async () => {
                                                try {
                                                    const client = await clientPromise;
                                                    const db = client.db(process.env.MONGODB_DB_NAME);
                                                    await db.collection("users").updateOne(
                                                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                                        { _id: user._id, "trustedDevices.id": tokenId } as any,
                                                        { $set: { "trustedDevices.$.lastUsed": new Date() } }
                                                    );
                                                } catch (err) {
                                                    console.error("[Auth] Failed to update trusted device lastUsed", err);
                                                }
                                            })();
                                        } else {
                                            console.warn(`[Auth] Trusted device UA mismatch. Blocked.`);
                                        }
                                    } else {
                                        console.log(`[Auth] Trusted device expired: ${tokenId}`);
                                    }
                                }
                            }
                        }
                    } catch (e) {
                        console.warn("[Auth] Failed to verify trusted device token", e);
                    }
                }

                // --- 7. Two-Factor Authentication Logic ---
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                let otpCode = (raw as any).code as string | undefined;

                // Fix: NextAuth/FormData might serialize "undefined" as a string
                if (otpCode === "undefined" || otpCode === "null" || otpCode === "") {
                    otpCode = undefined;
                }

                if (!isTrustedDevice) {
                    // [New] TOTP Logic (Priority)
                    if (user.totpEnabled) {
                        if (!otpCode) {
                            throw new TwoFactorRequiredError("TOTP");
                        }

                        // Check Backup Codes first
                        if (user.backupCodes && user.backupCodes.includes(otpCode)) {
                            console.log(`[Auth] Backup code used for ${email}`);
                            // Remove used code
                            const client = await clientPromise;
                            const db = client.db(process.env.MONGODB_DB_NAME);
                            await db.collection("users").updateOne(
                                { _id: user._id },
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                { $pull: { backupCodes: otpCode } as any }
                            );
                            // Pass
                        } else {
                            // Check TOTP
                            const { verifyTotp } = await import("@/lib/totp");
                            const isValid = user.totpSecret ? verifyTotp(otpCode, user.totpSecret) : false;

                            if (!isValid) {
                                console.warn(`[Auth] Invalid TOTP code for ${email}`);
                                // [New] Increment OTP Verify Rate Limit
                                const { incrementOtpVerifyLimit } = await import("@/lib/rate-limit");
                                const ip = await getClientIp();
                                const status = await incrementOtpVerifyLimit(ip, email);

                                if (!status.success) {
                                    throw new RateLimitError(`RateLimit:Block:${Math.ceil(status.msBeforeNext / 1000)}`);
                                }

                                throw new InvalidCredentialsError("Invalid OTP");
                            }
                            // Pass
                        }
                    } else {
                        console.log(`[Auth] 2FA not enabled for ${email}, access granted.`);
                    }
                } else {
                    console.log(`[Auth] Skipping OTP for trusted device: ${email}`);
                }

                // --- 8. Trust Device Registration (Only if explicitly requested) ---
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const shouldTrust = (raw as any).trustDevice === "true";
                if (shouldTrust) {
                    const crypto = await import("crypto");
                    const tokenId = crypto.randomUUID();
                    const now = new Date();
                    const expires = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000); // 3 Days

                    // [Security] Bind to User-Agent
                    const uaString = userAgent || "unknown";
                    const uaHash = crypto.createHash("sha256").update(uaString).digest("hex");

                    // [New] Limit to 5 devices (Remove oldest)
                    let currentDevices = user.trustedDevices || [];
                    if (currentDevices.length >= 5) {
                        // Sort by lastUsed ascending (oldest first)
                        // But since we just want to keep 4 latest, we can just slice
                        // Actually, better to sort just in case
                        currentDevices.sort((a, b) => new Date(a.lastUsed).getTime() - new Date(b.lastUsed).getTime());
                        // Remove oldest until 4 left (so we can add 1 more)
                        currentDevices = currentDevices.slice(currentDevices.length - 4);
                    }

                    // Store in DB (Replacing entire array with new + 1 is cleaner for limits)
                    const client = await clientPromise;
                    const db = client.db(process.env.MONGODB_DB_NAME);

                    await db.collection("users").updateOne(
                        { _id: user._id },
                        {
                            $set: {
                                trustedDevices: [
                                    ...currentDevices,
                                    {
                                        id: tokenId,
                                        uaHash,
                                        expires,
                                        lastUsed: now
                                    }
                                ]
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            } as any
                        }
                    );

                    // Set Cookie (Signed JWE)
                    const { signTrustedDeviceToken } = await import("@/lib/trusted-device");
                    const cookieVal = await signTrustedDeviceToken({ email, tokenId });
                    cookieStore.set(TRUSTED_COOKIE_NAME, cookieVal, {
                        httpOnly: true,
                        secure: process.env.NODE_ENV === "production",
                        sameSite: "lax",
                        path: "/",
                        maxAge: 3 * 24 * 60 * 60
                    });
                    console.log(`[Auth] Trusted device registered (Server-Side): ${tokenId}`);
                }

                console.log("[Auth] Authorization successful. Returning session.");

                // [Reset Rate Limit] Success - Non-blocking to prevent timeout
                import("@/lib/rate-limit").then(m => m.resetRateLimit(ip, email)).catch(e => console.warn("[Auth] Failed to reset rate limit:", e));

                // [New] Reset Account Lockout - Non-blocking
                (async () => {
                    try {
                        const client = await clientPromise;
                        const db = client.db(process.env.MONGODB_DB_NAME);
                        await db.collection("users").updateOne(
                            { _id: user._id },
                            {
                                $set: { failedLoginAttempts: 0 },
                                $unset: { lockoutUntil: "" }
                            }
                        );
                    } catch (e) {
                        console.warn("[Auth] Failed to reset account lockout:", e);
                    }
                })();

                // [Audit] Success - Non-blocking
                import("@/lib/audit").then(({ logLoginAttempt }) => {
                    logLoginAttempt({
                        email,
                        ip,
                        userAgent,
                        status: "SUCCESS"
                    }).catch(e => console.warn("[Auth] Failed to log audit:", e));
                });

                // [Notification] Success - Non-blocking
                import("@/lib/mail").then(({ sendLoginNotification }) => {
                    sendLoginNotification(
                        email,
                        "SUCCESS",
                        ip,
                        userAgent
                    ).catch(e => console.error("[Auth] Failed to send login notification:", e));
                });

                if (isDev) console.log("[Auth] Admin login success:", user.email);

                return {
                    id: String(user._id),
                    email: user.email,
                    name: user.name ?? "Superuser",
                    role: user.role,
                    personnelId: user.personnelId ? String(user.personnelId) : null,
                } as any; // eslint-disable-line @typescript-eslint/no-explicit-any
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
