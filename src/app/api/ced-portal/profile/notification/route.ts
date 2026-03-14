import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function PUT(req: NextRequest) {
    try {
        const session = await auth();
        const user = session?.user as any;
        if (!session || user?.role !== "superuser") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { notificationEmail, notificationEnabled } = await req.json();

        // Validate email format if provided
        if (notificationEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(notificationEmail)) {
            return NextResponse.json({ error: "รูปแบบอีเมลไม่ถูกต้อง" }, { status: 400 });
        }

        // Cannot enable without email
        if (notificationEnabled && !notificationEmail) {
            return NextResponse.json({ error: "กรุณาระบุอีเมลก่อนเปิดใช้งานการแจ้งเตือน" }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db(process.env.MONGODB_DB_NAME);

        // Get username from session to find user
        const sessionUsername = user?.username;
        if (!sessionUsername) {
            return NextResponse.json({ error: "Session invalid" }, { status: 401 });
        }

        const updateFields: Record<string, unknown> = {
            notificationEnabled: notificationEnabled === true,
            updatedAt: new Date(),
        };

        if (notificationEmail !== undefined) {
            updateFields.notificationEmail = notificationEmail.trim().toLowerCase();
        }

        const result = await db.collection("users").updateOne(
            { username: sessionUsername },
            { $set: updateFields }
        );

        if (result.matchedCount === 0) {
            return NextResponse.json({ error: "ไม่พบข้อมูลผู้ใช้" }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: "บันทึกการตั้งค่าแจ้งเตือนเรียบร้อย" });

    } catch (error) {
        console.error("Notification settings update error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
