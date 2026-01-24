import { z } from "zod";

const STRONG_PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
// At least one lowercase, one uppercase, one number, one special character, min 8 chars.

export function isStrongPassword(password: string): boolean {
    return STRONG_PASSWORD_REGEX.test(password);
}

export function validatePassword(password: string): { success: boolean; error?: string } {
    if (password.length < 8) return { success: false, error: "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร" };
    if (!/[A-Z]/.test(password)) return { success: false, error: "รหัสผ่านต้องมีตัวพิมพ์ใหญ่อย่างน้อย 1 ตัว" };
    if (!/[a-z]/.test(password)) return { success: false, error: "รหัสผ่านต้องมีตัวพิมพ์เล็กอย่างน้อย 1 ตัว" };
    if (!/[0-9]/.test(password)) return { success: false, error: "รหัสผ่านต้องมีตัวเลขอย่างน้อย 1 ตัว" };
    if (!/[\W_]/.test(password)) return { success: false, error: "รหัสผ่านต้องมีอักขระพิเศษอย่างน้อย 1 ตัว" };
    return { success: true };
}

// Zod Schema for password validation
export const zPassword = z.string()
    .min(8, "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร")
    .refine((val) => /[A-Z]/.test(val), "รหัสผ่านต้องมีตัวพิมพ์ใหญ่อย่างน้อย 1 ตัว")
    .refine((val) => /[a-z]/.test(val), "รหัสผ่านต้องมีตัวพิมพ์เล็กอย่างน้อย 1 ตัว")
    .refine((val) => /[0-9]/.test(val), "รหัสผ่านต้องมีตัวเลขอย่างน้อย 1 ตัว")
    .refine((val) => /[\W_]/.test(val), "รหัสผ่านต้องมีอักขระพิเศษอย่างน้อย 1 ตัว");

// [Security] HIBP Breach Check
// [Security] HIBP Breach Check (Fail-Closed)
// [New] Simple In-Memory Cache (Global scope to persist across requests in standard Node env)
// Note: In serverless, this might reset often, but still helps with bursts
const hibpCache = new Map<string, { suffixes: string[], timestamp: number }>();
const CACHE_TTL = 3600 * 1000; // 1 Hour

async function isBreached(password: string): Promise<boolean> {
    try {
        const crypto = await import("crypto");
        const shasum = crypto.createHash("sha1").update(password).digest("hex").toUpperCase();
        const prefix = shasum.substring(0, 5);
        const suffix = shasum.substring(5);

        // 1. Check Cache
        const cached = hibpCache.get(prefix);
        if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
            return cached.suffixes.includes(suffix);
        }

        // 2. Fetch from API
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000); // 5s Timeout

        const res = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, { signal: controller.signal });
        clearTimeout(timeout);

        if (!res.ok) throw new Error("HIBP API Non-OK");

        const text = await res.text();
        const lines = text.split("\n");

        // Parse all suffixes
        const suffixes = lines.map(line => line.split(":")[0].trim());

        // 3. Update Cache
        hibpCache.set(prefix, { suffixes, timestamp: Date.now() });

        return suffixes.includes(suffix);
    } catch (error) {
        console.error("HIBP Breach Check Failed:", error);
        // Fail-Open Policy: If API fails, assume safe but log warning
        // This prevents DoS if HIBP is down
        return false;
    }
}

export const zStrongPassword = zPassword.refine(async (pwd) => {
    // isBreached now handles errors safely (returns false on error)
    const breached = await isBreached(pwd);
    return !breached;
}, {
    message: "รหัสผ่านนี้เคยรั่วไหลในฐานข้อมูลสาธารณะ กรุณาใช้รหัสผ่านอื่น"
});
