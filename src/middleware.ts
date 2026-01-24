import createMiddleware from "next-intl/middleware";
import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { NextResponse } from "next/server";


const { auth } = NextAuth(authConfig);

const locales = ["en", "th"] as const;

const intlMiddleware = createMiddleware({
  locales: [...locales],
  defaultLocale: "th",
  localePrefix: "always", // ใช้เฉพาะ public
});

// function isAuthApiPath(pathname: string) {
//   return pathname === "/api/auth" || pathname.startsWith("/api/auth/");
// }

function isAdminApiPath(pathname: string) {
  return pathname === "/api/admin" || pathname.startsWith("/api/admin/");
}

// function isAdminPath(pathname: string) {
//   return pathname === "/admin" || pathname.startsWith("/admin/");
// }

function isAdminLoginPath(pathname: string) {
  return (
    pathname === "/admin/login" ||
    pathname.startsWith("/admin/login/") ||
    pathname === "/admin/forgot-password" ||
    pathname.startsWith("/admin/forgot-password/")
  );
}

export default auth((req: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
  const { pathname } = req.nextUrl;
  // [New] CSRF Token Generation
  // Ensure every client has a CSRF token cookie
  const csrfToken = req.cookies.get("ced_csrf_token")?.value || crypto.randomUUID();

  // [New] CSP Nonce Generation
  const nonce = crypto.randomUUID();

  // Add nonce to request headers so Server Components can read it
  req.headers.set("x-nonce", nonce);

  // [New] Global CSRF Validation (Double Submit Cookie)
  // Protect all API mutations except NextAuth internals (which handle their own)
  const isApiMutation = pathname.startsWith("/api/") && !["GET", "HEAD", "OPTIONS"].includes(req.method);
  // Explicitly protect our custom auth routes, but exclude NextAuth's default routes (signin, callback, etc.)
  const isCustomAuthRoute = ["/api/auth/change-password", "/api/auth/reset-with-otp", "/api/auth/forgot-password"].some(r => pathname.startsWith(r));
  const isNextAuthInternal = pathname.startsWith("/api/auth/") && !isCustomAuthRoute;

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
    // We removed 'unsafe-inline' and 'unsafe-eval' from script-src
    // 'strict-dynamic' allows scripts loaded by trusted scripts to run (e.g. GTM/Analytics)
    res.headers.set(
      "Content-Security-Policy",
      `default-src 'self'; ` +
      `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' ${process.env.NODE_ENV === "development" ? "'unsafe-eval'" : ""} https: http:; ` +
      `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; ` +
      `img-src 'self' blob: data: https://*.google.com https://res.cloudinary.com; ` +
      `font-src 'self' data: https://fonts.gstatic.com; ` +
      `frame-src 'self' https://*.google.com https://*.youtube.com https://www.facebook.com https://web.facebook.com; ` +
      `connect-src 'self' https://www.google.com; ` +
      `object-src 'none'; ` +
      `base-uri 'self';`
    );

    res.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), browsing-topics=()");

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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const role = (req.auth?.user as any)?.role as string | undefined;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const email = (req.auth?.user as any)?.email as string | undefined;
      const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase().trim();
      const allowed = role === "superuser" && (!!adminEmail ? email?.toLowerCase() === adminEmail : true);

      if (!allowed) {
        return applyHeaders(NextResponse.json({ error: "forbidden" }, { status: 403 }));
      }
    }
    return applyHeaders(NextResponse.next());
  }

  // 2. Handle Localization for all pages (including Admin)
  const response = intlMiddleware(req);

  // 3. Handle Admin Authentication for both /admin and /:locale/admin
  const isLocalizedAdmin = locales.some(l => pathname.startsWith(`/${l}/admin`));
  const isPlainAdmin = pathname.startsWith("/admin");

  if (isLocalizedAdmin || isPlainAdmin) {
    // Extract actual subpath within admin
    let adminSubpath = pathname;
    if (isLocalizedAdmin) {
      // Remove /:locale/admin
      const parts = pathname.split('/').filter(Boolean);
      adminSubpath = "/" + parts.slice(1).join("/");
    }

    if (!isAdminLoginPath(adminSubpath)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const role = (req.auth?.user as any)?.role as string | undefined;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const email = (req.auth?.user as any)?.email as string | undefined;
      const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase().trim();
      const allowed = role === "superuser" && (!!adminEmail ? email?.toLowerCase() === adminEmail : true);

      if (!allowed) {
        // Redirect to login
        const locale = locales.find(l => pathname.startsWith(`/${l}`)) || "th";
        const url = req.nextUrl.clone();
        url.pathname = `/${locale}/admin/login`;
        url.searchParams.set("callbackUrl", req.nextUrl.pathname + req.nextUrl.search);
        return applyHeaders(NextResponse.redirect(url));
      }
    }
  }

  // Apply Security Headers to Page Responses
  return applyHeaders(response);
});

export const config = {
  matcher: [
    // ครอบทุกหน้า ยกเว้นไฟล์ static
    "/((?!_next|.*\\..*).*)",
    "/api/admin/:path*",
  ],
};
