import { headers } from "next/headers";
import { NextRequest } from "next/server";

/**
 * Retrieves the Client IP address, prioritizing X-Forwarded-For (First entry).
 * Suitable for Vercel and Trust Proxy environments.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getClientIp(req?: NextRequest | Request | any): Promise<string> {
    let ip: string | null = null;
    let headerList: Headers | null = null;

    // 1. Extract Headers from Request object
    if (req) {
        if (req.headers instanceof Headers) {
            headerList = req.headers;
        } else if (typeof req.headers?.get === "function") {
            headerList = req; // It behaves like headers
        } else if (req.headers && typeof req.headers === 'object') {
            // Node IncomingMessage
            // Adapt to Headers interface for consistency
            headerList = new Headers(req.headers);
        }
    }

    // 2. Try to get IP from headers
    if (headerList) {
        // Priority 1: Cloudflare (always trusted if present in a CF env)
        const cfIp = headerList.get("cf-connecting-ip");
        if (cfIp) return cfIp.trim();

        // Priority 2: Vercel
        const vercelIp = headerList.get("x-vercel-forwarded-for");
        if (vercelIp) return vercelIp.split(",")[0].trim();

        // Priority 3: Google App Engine / GCP LB
        const appEngineIp = headerList.get("x-appengine-user-ip");
        if (appEngineIp) return appEngineIp.trim();

        // Priority 4: Standard X-Forwarded-For
        // [Security] Disabled manual parsing to prevent spoofing.
        // We rely on platform headers (CF/Vercel) or Next.js internal `req.ip` which handles trusted proxies correctly.
        /*
        const forwarded = headerList.get("x-forwarded-for");
        if (forwarded) {
            ip = forwarded.split(",")[0].trim();
        }
        */

        if (!ip) {
            // x-real-ip is also spoofable but sometimes injected by cloud LBs. 
            // We'll keep it as a fallback but prioritize req.ip in practice.
            ip = headerList.get("x-real-ip");
        }
    }

    // 3. Fallback to Global Headers (Server Components / Next.js Internal)
    if (!ip) {
        try {
            const globalHeaders = await headers();
            const forwarded = globalHeaders.get("x-forwarded-for");
            if (forwarded) ip = forwarded.split(",")[0].trim();
            if (!ip) ip = globalHeaders.get("x-real-ip");
        } catch {
            // Ignore context errors
        }
    }

    // 4. Fallback to Request IP (Next.js specific)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!ip && req && (req as any).ip) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ip = (req as any).ip;
    }

    return ip || "127.0.0.1";
}
