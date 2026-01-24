import { CompactEncrypt, importSPKI } from "jose";

export async function encryptPassword(password: string, publicKeyPem: string): Promise<string> {
    try {
        const publicKey = await importSPKI(publicKeyPem, "RSA-OAEP-256");

        const jwe = await new CompactEncrypt(new TextEncoder().encode(password))
            .setProtectedHeader({ alg: "RSA-OAEP-256", enc: "A256GCM" })
            .encrypt(publicKey);

        return jwe;
    } catch (error) {
        console.error("Encryption failed:", error);
        throw new Error("Failed to encrypt password");
    }
}
