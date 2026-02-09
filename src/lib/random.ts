/**
 * Generates a cryptographically secure random number between 0 (inclusive) and 1 (exclusive).
 * This is a drop-in replacement for Math.random() for security-sensitive contexts,
 * or when static analysis tools (like SonarQube) flag Math.random() usage.
 */
export function secureRandom(): number {
    const cryptoObj = typeof crypto !== 'undefined' ? crypto : (typeof window !== 'undefined' ? window.crypto : undefined);

    if (cryptoObj && typeof cryptoObj.getRandomValues === 'function') {
        const array = new Uint32Array(1);
        cryptoObj.getRandomValues(array);
        // Divide by 2^32 to get a number between 0 and 1
        return array[0] / (0xFFFFFFFF + 1);
    }

    // Fallback: This path should ideally not be reached in modern environments.
    // However, for pure visual effects, we might want to allow semblance of functionality 
    // even if crypto is missing, though we log a warning.
    // If we cannot generate a secure random number, it's better to fail 
    // than to degrade to an insecure one in a security library.
    throw new Error("Secure random number generator not available.");
}
