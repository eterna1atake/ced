export const getApiBaseUrl = () => {
    const basePath = '/cedweb';

    if (process.env.NODE_ENV === "development") {
        return `http://localhost:3000${basePath}`;
    }

    if (process.env.NEXT_PUBLIC_APP_URL) {
        const appUrl = process.env.NEXT_PUBLIC_APP_URL;
        // avoid appending twice if NEXT_PUBLIC_APP_URL already has it
        return appUrl.endsWith(basePath) ? appUrl : `${appUrl}${basePath}`;
    }
    // Fallback for local development if env var is not set
    if (process.env.VERCEL_URL) {
        return `https://${process.env.VERCEL_URL}${basePath}`;
    }
    return `http://localhost:3000${basePath}`;
};
