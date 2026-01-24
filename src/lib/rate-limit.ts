import { RateLimiterMongo } from "rate-limiter-flexible";
import clientPromise from "@/lib/mongodb";

// Configuration for "Brutal" Rate Limiting
// Shared collection 'login_fail_limits'
const BRUTAL_TIERS = [
    {
        points: 5,
        duration: 15 * 60, // 15 Minutes
        blockDuration: 15 * 60,
        keyPrefix: "login_fail_short",
    },
    {
        points: 10,
        duration: 6 * 60 * 60, // 6 Hours
        blockDuration: 60 * 60, // 1 Hour Block
        keyPrefix: "login_fail_medium",
    },
    {
        points: 20,
        duration: 24 * 60 * 60, // 24 Hours
        blockDuration: 24 * 60 * 60, // 24 Hour Block
        keyPrefix: "login_fail_long",
    },
];

type RateLimiterTier = {
    limiter: RateLimiterMongo;
    blockDuration: number;
};

let limiters: RateLimiterTier[] = [];

async function getLimiters() {
    if (limiters.length > 0) return limiters;

    const client = await clientPromise;

    limiters = BRUTAL_TIERS.map(opts => ({
        limiter: new RateLimiterMongo({
            storeClient: client,
            dbName: process.env.MONGODB_DB_NAME,
            keyPrefix: opts.keyPrefix,
            points: opts.points,
            duration: opts.duration,
            blockDuration: opts.blockDuration, // Native blocking support
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any),
        blockDuration: opts.blockDuration,
    }));

    return limiters;
}

/**
 * Checks if the identifier (IP or Email) is blocked.
 * DOES NOT consume points.
 */
export async function checkRateLimit(ip: string, email?: string) {
    const limits = await getLimiters();
    let maxMsBeforeNext = 0;
    let isBlocked = false;
    let minRemaining = Infinity;

    // Helper to check a single key against all tiers
    const checkKey = async (key: string) => {
        const results = await Promise.all(
            limits.map(({ limiter }) => limiter.get(key))
        );

        results.forEach((res, index) => {
            const tierPoints = BRUTAL_TIERS[index].points;
            if (res) {
                // Calculate remaining for this tier
                const remaining = Math.max(0, tierPoints - res.consumedPoints);
                if (remaining < minRemaining) minRemaining = remaining;

                if (res.remainingPoints <= 0) {
                    if (res.msBeforeNext > maxMsBeforeNext) {
                        maxMsBeforeNext = res.msBeforeNext;
                        isBlocked = true;
                    }
                }
            } else {
                // No record yet, full points available
                if (tierPoints < minRemaining) minRemaining = tierPoints;
            }
        });
    };

    // 1. Check IP
    await checkKey(`login:ip:${ip}`);

    // 2. Check Email (if provided)
    if (email) {
        await checkKey(`login:email:${email}`);
    }

    if (isBlocked) {
        return {
            success: false,
            remaining: 0,
            msBeforeNext: maxMsBeforeNext,
        };
    }

    return {
        success: true,
        remaining: minRemaining === Infinity ? 5 : minRemaining, // Default to lowest tier if calc fails
        msBeforeNext: 0,
    };
}

/**
 * Consumes a point for BOTH IP and Email.
 * This should be called on a FAILED login attempt.
 */
export async function incrementRateLimit(ip: string, email?: string) {
    const limits = await getLimiters();
    let maxMsBeforeNext = 0;
    let isBlocked = false;
    let maxConsumedPoints = 0;
    let minRemaining = Infinity;

    const consumeKey = async (key: string) => {
        const results = await Promise.allSettled(
            limits.map(({ limiter }) => limiter.consume(key))
        );

        results.forEach((result, index) => {
            const tierPoints = BRUTAL_TIERS[index].points;

            if (result.status === "rejected") {
                isBlocked = true;
                const ms = result.reason?.msBeforeNext || 1000;
                if (ms > maxMsBeforeNext) {
                    maxMsBeforeNext = ms;
                }
                const consumed = result.reason?.consumedPoints || tierPoints;
                if (consumed > maxConsumedPoints) maxConsumedPoints = consumed;

                // Blocked means 0 remaining
                minRemaining = 0;

            } else if (result.status === "fulfilled") {
                const consumed = result.value.consumedPoints;
                const remaining = Math.max(0, tierPoints - consumed);

                if (consumed > maxConsumedPoints) maxConsumedPoints = consumed;
                if (remaining < minRemaining) minRemaining = remaining;
            }
        });
    };

    // 1. Penalize IP
    await consumeKey(`login:ip:${ip}`);

    // 2. Penalize Email (if provided)
    if (email) {
        await consumeKey(`login:email:${email}`);
    }

    if (isBlocked) {
        return {
            success: false,
            remaining: 0,
            msBeforeNext: maxMsBeforeNext,
            consumedPoints: maxConsumedPoints
        };
    }

    return {
        success: true,
        remaining: minRemaining === Infinity ? 0 : minRemaining,
        msBeforeNext: 0,
        consumedPoints: maxConsumedPoints
    };
}

/**
 * Resets the rate limit for BOTH IP and Email.
 * This should be called on a SUCCESSFUL login attempt.
 */
export async function resetRateLimit(ip: string, email?: string) {
    const limits = await getLimiters();

    const deleteKey = async (key: string) => {
        await Promise.all(
            limits.map(({ limiter }) => limiter.delete(key))
        );
    };

    // 1. Reset IP
    await deleteKey(`login:ip:${ip}`);

    // 2. Reset Email (if provided)
    if (email) {
        await deleteKey(`login:email:${email}`);
    }
}

/**
 * Gets the STATUS of the rate limit (for displaying to user).
 * Prioritizes showing the IP block if both exist.
 */
export async function getRateLimit(ip: string, email?: string) {
    return checkRateLimit(ip, email);
}

// --- OTP Rate Limiting ---

const OTP_VERIFY_TIERS = [
    {
        points: 3,
        duration: 10 * 60, // 10 Minutes
        blockDuration: 10 * 60,
        keyPrefix: "otp_verify",
    },
];

const OTP_REQUEST_TIERS = [
    {
        points: 5,
        duration: 10 * 60, // 5 requests in 10 mins
        blockDuration: 10 * 60,
        keyPrefix: "otp_request",
    },
];

const otpVerifyLimiters: RateLimiterTier[] = [];
const otpRequestLimiters: RateLimiterTier[] = [];

async function getTierLimiters(tiers: typeof OTP_VERIFY_TIERS) {
    const client = await clientPromise;
    return tiers.map(opts => ({
        limiter: new RateLimiterMongo({
            storeClient: client,
            dbName: process.env.MONGODB_DB_NAME,
            keyPrefix: opts.keyPrefix,
            points: opts.points,
            duration: opts.duration,
            blockDuration: opts.blockDuration,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any),
        blockDuration: opts.blockDuration,
    }));
}

async function handleLimit(
    tiers: typeof OTP_VERIFY_TIERS,
    limitersCache: RateLimiterTier[],
    ip: string,
    email: string | undefined,
    action: "check" | "consume" | "reset"
) {
    if (limitersCache.length === 0) {
        const newLimiters = await getTierLimiters(tiers);
        limitersCache.push(...newLimiters);
    }

    const keys = [`${tiers[0].keyPrefix}:ip:${ip}`];
    if (email) keys.push(`${tiers[0].keyPrefix}:email:${email}`);

    // Simple single-tier logic for OTP (unlike multi-tier login)
    const limiter = limitersCache[0].limiter;

    const result = { success: true, msBeforeNext: 0, remaining: tiers[0].points };

    for (const key of keys) {
        try {
            if (action === "check") {
                const res = await limiter.get(key);
                if (res && res.remainingPoints <= 0) {
                    return { success: false, msBeforeNext: res.msBeforeNext, remaining: 0 };
                }
            } else if (action === "consume") {
                await limiter.consume(key);
            } else if (action === "reset") {
                await limiter.delete(key);
            }
        } catch (res: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
            if (action === "consume" && res instanceof Error === false) {
                // RateLimiterRes object
                return { success: false, msBeforeNext: res.msBeforeNext, remaining: 0 };
            }
        }
    }
    return result;
}

export async function checkOtpVerifyLimit(ip: string, email?: string) {
    return handleLimit(OTP_VERIFY_TIERS, otpVerifyLimiters, ip, email, "check");
}

export async function incrementOtpVerifyLimit(ip: string, email?: string) {
    return handleLimit(OTP_VERIFY_TIERS, otpVerifyLimiters, ip, email, "consume");
}

export async function resetOtpVerifyLimit(ip: string, email?: string) {
    return handleLimit(OTP_VERIFY_TIERS, otpVerifyLimiters, ip, email, "reset");
}

export async function checkOtpRequestLimit(ip: string, email?: string) {
    return handleLimit(OTP_REQUEST_TIERS, otpRequestLimiters, ip, email, "check");
}

export async function incrementOtpRequestLimit(ip: string, email?: string) {
    return handleLimit(OTP_REQUEST_TIERS, otpRequestLimiters, ip, email, "consume");
}


// --- Change Password Rate Limiting ---

const CHANGE_PASSWORD_TIERS = [
    {
        points: 5,
        duration: 15 * 60, // 5 attempts per 15 minutes
        blockDuration: 30 * 60, // Block for 30 mins
        keyPrefix: "change_pwd",
    },
];

const changePasswordLimiters: RateLimiterTier[] = [];

export async function checkChangePasswordLimit(ip: string, email?: string) {
    return handleLimit(CHANGE_PASSWORD_TIERS, changePasswordLimiters, ip, email, "check");
}

export async function incrementChangePasswordLimit(ip: string, email?: string) {
    return handleLimit(CHANGE_PASSWORD_TIERS, changePasswordLimiters, ip, email, "consume");
}

export async function resetChangePasswordLimit(ip: string, email?: string) {
    return handleLimit(CHANGE_PASSWORD_TIERS, changePasswordLimiters, ip, email, "reset");
}
