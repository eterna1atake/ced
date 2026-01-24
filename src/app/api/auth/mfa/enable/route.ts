import { auth } from "@/lib/auth";
import { verifyTotp, generateBackupCodes } from "@/lib/totp";
import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const session = await auth();

    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { code } = await req.json();

    if (!code) {
        return NextResponse.json({ error: "Code required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME);

    // 1. Get Pending Secret
    const user = await db.collection("users").findOne({ email: session.user.email });

    if (!user || !user.totpSecretPending) {
        return NextResponse.json({ error: "Setup not initiated" }, { status: 400 });
    }

    // 2. Verify Code against Pending Secret
    const isValid = verifyTotp(code, user.totpSecretPending);

    if (!isValid) {
        return NextResponse.json({ error: "Invalid TOTP Code" }, { status: 400 });
    }

    // 3. Enable TOTP & Generate Backup Codes
    const backupCodes = generateBackupCodes();

    await db.collection("users").updateOne(
        { email: session.user.email },
        {
            $set: {
                totpEnabled: true,
                totpSecret: user.totpSecretPending,
                backupCodes: backupCodes
            },
            $unset: { totpSecretPending: "" }
        }
    );

    return NextResponse.json({
        success: true,
        backupCodes
    });
}
