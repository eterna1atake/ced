import { compactDecrypt, CompactEncrypt, importPKCS8, importSPKI } from "jose";

const getPrivateKey = () => {
    const privateKey = process.env.AUTH_PRIVATE_KEY;
    if (!privateKey) {
        throw new Error("AUTH_PRIVATE_KEY environment variable is not set");
    }
    return privateKey;
};

const getPublicKey = () => {
    const publicKey = process.env.AUTH_PUBLIC_KEY;
    if (!publicKey) {
        throw new Error("AUTH_PUBLIC_KEY environment variable is not set");
    }
    return publicKey;
};

export async function encrypt(text: string): Promise<string> {
    const publicKeyPem = getPublicKey();
    const publicKey = await importSPKI(publicKeyPem, "RSA-OAEP-256");

    const jwe = await new CompactEncrypt(new TextEncoder().encode(text))
        .setProtectedHeader({ alg: "RSA-OAEP-256", enc: "A256GCM" })
        .encrypt(publicKey);

    return jwe;
}

export async function decrypt(jwe: string): Promise<string> {
    const privateKeyPem = getPrivateKey();
    const privateKey = await importPKCS8(privateKeyPem, "RSA-OAEP-256");

    const { plaintext } = await compactDecrypt(jwe, privateKey);
    return new TextDecoder().decode(plaintext);
}

export function getPublicPem(): string {
    return getPublicKey();
}
