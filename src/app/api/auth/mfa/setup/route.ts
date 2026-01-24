import { auth } from "@/lib/auth";
import { generateTotpSecret, generateTotpUri, generateQrCode } from "@/lib/totp";
import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function POST() {
    const session = await auth();

    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Generate Secret
    const secret = generateTotpSecret();

    const userEmail = session.user.email!; // Email should exist

    // 2. Generate URI & QR
    const otpauth = generateTotpUri(userEmail, secret, "CED Admin");
    const qrCode = await generateQrCode(otpauth);

    // 3. Store "Pending" Secret in DB? 
    // Usually we don't save it until verified. But to be stateless, we could send it to client (encrypted) 
    // or store in a temp field "totpSecretPending".
    // For this implementation, let's store it in `totpSecretPending` in User to avoid handling encryption on client.

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME);

    await db.collection("users").updateOne(
        { email: userEmail },
        { $set: { totpSecretPending: secret } }
    );

    return NextResponse.json({
        secret,
        qrCode
    });
}
