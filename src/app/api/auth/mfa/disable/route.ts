import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";

export async function POST() {
    try {
        const session = await auth();
        const userEmail = session?.user?.email;

        if (!userEmail) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const client = await clientPromise;
        const db = client.db(process.env.MONGODB_DB_NAME);

        // Disable TOTP and remove secrets/backup codes
        const result = await db.collection("users").updateOne(
            { email: userEmail },
            {
                $set: { totpEnabled: false },
                $unset: {
                    totpSecret: "",
                    backupCodes: ""
                }
            }
        );

        if (result.modifiedCount === 0) {
            // It's possible it was already disabled, which is fine, but checking just in case user doesn't exist which shouldn't happen
        }

        return NextResponse.json({ success: true, message: "Two-Factor Authentication disabled" });

    } catch (err) {
        console.error("Disable TOTP Error:", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
