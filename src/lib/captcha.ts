export async function verifyCaptcha(token: string | undefined): Promise<boolean> {
    if (!token) return false;

    const secretKey = process.env.RECAPTCHA_SECRET_KEY;
    if (!secretKey) {
        // Warning: If secret key is not set, we might want to fail open or closed.
        // For security, usually fail closed, but for dev convenience, maybe log warning.
        console.error("RECAPTCHA_SECRET_KEY is not set!");
        return false;
    }

    try {
        const url = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${token}`;
        const res = await fetch(url, { method: "POST" });
        const data = await res.json();

        if (data.success) {
            return true;
        } else {
            console.warn("Captcha verification failed:", data["error-codes"]);
            return false;
        }
    } catch (error) {
        console.error("Captcha verification error:", error);
        return false;
    }
}
