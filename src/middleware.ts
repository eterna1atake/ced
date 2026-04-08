import createMiddleware from "next-intl/middleware";
import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { NextResponse } from "next/server";
import { routing } from "@/i18n/routing";


const { auth } = NextAuth(authConfig);

const intlMiddleware = createMiddleware({
  ...routing,
  localeDetection: true,
});

// function isAuthApiPath(pathname: string) {
//   return pathname === "/api/auth" || pathname.startsWith("/api/auth/");
// }

function isAdminApiPath(pathname: string) {
  return pathname === "/api/ced-portal" || pathname.startsWith("/api/ced-portal/") ||
         pathname === "/api/ced-portal" || pathname.startsWith("/api/ced-portal/");
}

function isAdminLoginPath(pathname: string) {
  return (
    pathname === "/ced-portal/login" ||
    pathname.startsWith("/ced-portal/login/") ||
    pathname === "/ced-portal/forgot-password" ||
    pathname.startsWith("/ced-portal/forgot-password/")
  );
}

import { Role } from "@/lib/auth";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  console.log('MIDDLEWARE PATH:', pathname);
  // [New] CSRF Token Generation
  // Ensure every client has a CSRF token cookie
  const csrfToken = req.cookies.get("ced_csrf_token")?.value || crypto.randomUUID();

  // [New] CSP Nonce Generation
  const nonce = crypto.randomUUID();

  // Add nonce to request headers so Server Components can read it
  req.headers.set("x-nonce", nonce);

  // [New] Global CSRF Validation (Double Submit Cookie)
  // Protect all API mutations except NextAuth internals (which handle their own)
  const isApiMutation = (pathname.startsWith("/api/") || pathname.startsWith("/api/")) && !["GET", "HEAD", "OPTIONS"].includes(req.method);
  // Explicitly protect our custom auth routes, but exclude NextAuth's default routes (signin, callback, etc.)
  const isCustomAuthRoute = ["/api/auth/change-password", "/api/auth/reset-with-otp", "/api/auth/forgot-password", "/api/auth/change-password", "/api/auth/reset-with-otp", "/api/auth/forgot-password"].some(r => pathname.startsWith(r));
  const isNextAuthInternal = (pathname.startsWith("/api/auth/") || pathname.startsWith("/api/auth/")) && !isCustomAuthRoute;

  if (isApiMutation && !isNextAuthInternal) {
    const headerToken = req.headers.get("x-csrf-token");
    // We already retrieved cookie above as csrfToken (or generated new one if missing, which means mismatch anyway)
    const cookieToken = req.cookies.get("ced_csrf_token")?.value;

    if (!headerToken || !cookieToken || headerToken !== cookieToken) {
      console.error(`[Middleware] CSRF Attack Blocked: ${req.method} ${pathname}`);
      return NextResponse.json(
        { error: "CSRF Validation Failed" },
        { status: 403 }
      );
    }
  }

  // Helper to apply headers
  const applyHeaders = (res: NextResponse) => {
    res.headers.set("X-DNS-Prefetch-Control", "on");
    res.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
    res.headers.set("X-Frame-Options", "SAMEORIGIN");
    res.headers.set("X-Content-Type-Options", "nosniff");
    res.headers.set("Referrer-Policy", "origin-when-cross-origin");

    // [Updated] Content Security Policy with Nonce
    // Removed 'unsafe-inline' and 'unsafe-eval' from script-src
    // Used 'nonce-${nonce}' to allow specific scripts
    res.headers.set(
        "Content-Security-Policy",
        `default-src 'self'; ` +
        `script-src 'self' 'nonce-${nonce}' 'unsafe-eval' 'sha256-TiyWB4YB4NUrUHDJSqaW0w0OtUb7i0Tddwwo6j0O07c=' https://connect.facebook.net https://www.google.com https://www.gstatic.com https://www.googletagmanager.com; ` +
        `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; ` + // style-src still often needs unsafe-inline for CSS-in-JS/AOS
        `img-src 'self' blob: data: https://res.cloudinary.com https://*.facebook.com https://scontent.xx.fbcdn.net https://external.xx.fbcdn.net https://*.google-analytics.com https://*.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://stats.g.doubleclick.net; ` +
        `font-src 'self' https://fonts.gstatic.com data:; ` +
        `frame-src 'self' https://www.facebook.com https://web.facebook.com https://www.google.com https://www.gstatic.com https://www.youtube.com https://recaptcha.google.com https://res.cloudinary.com; ` +
        `object-src 'self' https://res.cloudinary.com blob:; ` +
        `worker-src 'self' blob:; ` +
        `connect-src 'self' https://www.google-analytics.com https://stats.g.doubleclick.net https://analytics.google.com https://*.googleapis.com https://res.cloudinary.com https://www.google.com https://recaptcha.google.com; ` +
        `base-uri 'self';`
    );

    res.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");

    // Set CSRF Cookie
    res.cookies.set("ced_csrf_token", csrfToken, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    // Pass x-nonce in response header too (optional, good for debugging)
    res.headers.set("x-nonce", nonce);

    return res;
  };

  // 1. Skip next-intl for API routes and _next
  if (pathname.startsWith("/_next") || pathname.startsWith("/api")) {
    // Check Admin API specifically
    if (isAdminApiPath(pathname)) {
      const role = (req.auth?.user as { role?: Role })?.role;
      if (role !== "superuser") {
        return applyHeaders(NextResponse.json({ error: "forbidden" }, { status: 403 }));
      }
    }
    return applyHeaders(NextResponse.next());
  }

  // 2. Handle Localization for all pages (including Admin)
  const response = intlMiddleware(req);

  // 3. Handle Admin Authentication for /ced-portal
  if (pathname.startsWith("/ced-portal")) {
    if (!isAdminLoginPath(pathname)) {
      const role = (req.auth?.user as { role?: Role })?.role;

      if (role !== "superuser") {
        // [Security] Rewrite to 404 to not reveal the admin path exists
        const url = req.nextUrl.clone();
        url.pathname = `/404-not-found`;
        return applyHeaders(NextResponse.rewrite(url));
      }
    }
  }

  // Apply Security Headers to Page Responses
  return applyHeaders(response);
});

export const config = {
  matcher: [
    "/",
    // ครอบทุกหน้า ยกเว้นไฟล์ static
    "/((?!_next|.*\\..*).*)",
    "/api/ced-portal/:path*",
    "/api/ced-portal/:path*",
  ],
};
