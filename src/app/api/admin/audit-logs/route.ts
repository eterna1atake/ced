import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";

export async function GET(req: NextRequest) {
    try {
        const session = await auth();
        const role = (session?.user as { role?: string })?.role;

        // 1. Security Check: Only Superuser can view logs
        if (role !== "superuser") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const type = searchParams.get("type") || "login"; // 'login' | 'system'

        const client = await clientPromise;
        const db = client.db(process.env.MONGODB_DB_NAME);

        let collectionName = "audit_login_logs";
        if (type === "system") {
            collectionName = "audit_system_logs";
        }

        // 2. Fetch Logs
        const logs = await db
            .collection(collectionName)
            .find({})
            .sort({ timestamp: -1 })
            .limit(100)
            .toArray();

        return NextResponse.json({ logs });
    } catch (error) {
        console.error("Failed to fetch audit logs:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
