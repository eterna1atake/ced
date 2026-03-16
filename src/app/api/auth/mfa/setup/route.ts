import { auth } from "@/lib/auth";
import { generateTotpSecret, generateTotpUri, generateQrCode } from "@/lib/totp";
import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function POST() {
    const session = await auth();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sessionUsername = (session?.user as any)?.username;

    if (!session || !sessionUsername) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Generate Secret
    const secret = generateTotpSecret();

    // Use username (alias) as the TOTP account label — email is optional
    const otpauth = generateTotpUri(sessionUsername, secret, "CED Admin");
    const qrCode = await generateQrCode(otpauth);

    // 2. Store "Pending" Secret in DB (will be confirmed on enable)
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME);

    await db.collection("users").updateOne(
        { username: sessionUsername },
        { $set: { totpSecretPending: secret } }
    );

    return NextResponse.json({
        secret,
        qrCode
    });
}
