import type { NextAuthConfig } from "next-auth";


// แยก Config ที่ปลอดภัยสำหรับ Edge Runtime (Middleware) ออกมา
export const authConfig = {
    session: {
        strategy: "jwt",
        maxAge: 15 * 60, // 15 Minutes
        updateAge: 60,   // Update every 1 minute
    },
    pages: {
        //signIn: "/admin/login",
    },
    callbacks: {
        async redirect({ url, baseUrl }) {
            // Allows relative callback URLs
            if (url.startsWith("/")) return `${baseUrl}${url}`;
            // Allows callback URLs on the same origin
            if (new URL(url).origin === baseUrl) return url;
            return baseUrl;
        },
        async jwt({ token, user }) {
            if (user) {
                token.role = (user as any).role; // eslint-disable-line @typescript-eslint/no-explicit-any
                token.personnelId = (user as any).personnelId ?? null; // eslint-disable-line @typescript-eslint/no-explicit-any
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                (session.user as any).role = (token as any).role ?? null; // eslint-disable-line @typescript-eslint/no-explicit-any
                (session.user as any).personnelId = (token as any).personnelId ?? null; // eslint-disable-line @typescript-eslint/no-explicit-any
            }
            return session;
        },
    },
    providers: [], // Providers จะถูกเติมเต็มใน auth.ts สำหรับฝั่ง Server
} satisfies NextAuthConfig;
