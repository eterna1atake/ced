import { SignJWT, jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(process.env.AUTH_SECRET || "default_dev_secret");
const ALG = "HS256"; // Using HMAC-SHA-256 for simplicity and speed

export interface TrustedDevicePayload {
    username: string; // Admin Alias (primary identifier - email is optional)
    tokenId: string;
}

export async function signTrustedDeviceToken(payload: TrustedDevicePayload): Promise<string> {
    return new SignJWT({
        username: payload.username,
        tokenId: payload.tokenId
    })
        .setProtectedHeader({ alg: ALG })
        .setIssuedAt()
        .setExpirationTime("30d") // Allow long-lived, we check DB expires anyway
        .sign(SECRET);
}

export async function verifyTrustedDeviceToken(token: string): Promise<TrustedDevicePayload | null> {
    try {
        const { payload } = await jwtVerify(token, SECRET);
        if (typeof payload.username === "string" && typeof payload.tokenId === "string") {
            return {
                username: payload.username,
                tokenId: payload.tokenId
            };
        }
        return null;
    } catch {
        // Silent fail is fine, treat as untrusted
        return null;
    }
}
