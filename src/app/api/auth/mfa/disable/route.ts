import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";

export async function POST() {
    try {
        const session = await auth();
        // Use username (alias) as primary identifier — email is optional
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const sessionUsername = (session?.user as any)?.username;

        if (!session || !sessionUsername) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const client = await clientPromise;
        const db = client.db(process.env.MONGODB_DB_NAME);

        // Disable TOTP and remove secrets/backup codes
        const result = await db.collection("users").updateOne(
            { username: sessionUsername },
            {
                $set: { totpEnabled: false },
                $unset: {
                    totpSecret: "",
                    backupCodes: ""
                }
            }
        );

        if (result.matchedCount === 0) {
            return NextResponse.json({ error: "ไม่พบข้อมูลผู้ใช้" }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: "Two-Factor Authentication disabled" });

    } catch (err) {
        console.error("Disable TOTP Error:", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
