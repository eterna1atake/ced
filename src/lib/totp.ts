import { authenticator } from "otplib";
import QRCode from "qrcode";
import crypto from "crypto";

// Ensure secrets are strong
authenticator.options = { crypto, window: 1 }; // window 1 allows +/- 30sec variance

export function generateTotpSecret(): string {
    return authenticator.generateSecret();
}

export function generateTotpUri(email: string, secret: string, issuer: string = "CED_Admin_Panel"): string {
    return authenticator.keyuri(email, issuer, secret);
}

export async function generateQrCode(otpauth: string): Promise<string> {
    return QRCode.toDataURL(otpauth);
}

export function verifyTotp(token: string, secret: string): boolean {
    try {
        return authenticator.check(token, secret);
    } catch {
        return false;
    }
}

export function generateBackupCodes(count: number = 10): string[] {
    const codes: string[] = [];
    for (let i = 0; i < count; i++) {
        // Generate a random 8-character hex string
        codes.push(crypto.randomBytes(4).toString("hex").toUpperCase());
    }
    return codes;
}
