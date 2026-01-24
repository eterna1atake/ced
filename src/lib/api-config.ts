export const getApiBaseUrl = () => {
    if (process.env.NODE_ENV === "development") {
        return "http://localhost:3000";
    }

    if (process.env.NEXT_PUBLIC_APP_URL) {
        return process.env.NEXT_PUBLIC_APP_URL;
    }
    // Fallback for local development if env var is not set
    // In production (Vercel), usually NEXT_PUBLIC_AG_BASE_URL or similar is set, or we can use VERCEL_URL
    if (process.env.VERCEL_URL) {
        return `https://${process.env.VERCEL_URL}`;
    }
    return "http://localhost:3000";
};
