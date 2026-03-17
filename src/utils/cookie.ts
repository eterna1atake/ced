/**
 * Utility to get CSRF token from document cookies.
 * Should only be used in client components.
 */
export function getCsrfToken(): string | null {
    if (typeof document === 'undefined') return null;
    
    return document.cookie
        .split("; ")
        .find((row) => row.startsWith("ced_csrf_token="))
        ?.split("=")[1] || null;
}
