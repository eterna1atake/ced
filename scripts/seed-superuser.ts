import "dotenv/config";
import clientPromise from "@/lib/mongodb";
import argon2 from "argon2";

//สร้าง Script สำหรับสร้าง Superuser (seed)
// ระบบนี้ใช้ Google Authenticator สำหรับ 2FA และการกู้คืนรหัสผ่าน
// ดังนั้น email เป็น optional (สำหรับแจ้งเตือนเท่านั้น ตั้งค่าภายหลังได้ในระบบ)
async function main() {
    //รับคำสั่งผ่าน cmd
    const usernameArg = process.argv[2];
    const password = process.argv[3];
    const email = process.argv[4]; // optional

    //ตรวจสอบ input
    if (!usernameArg || !password) {
        console.log("Usage: npx tsx src/scripts/seed-superuser.ts <username> <password> [email]");
        console.log("  username  - Admin Alias ที่ใช้ Login (required)");
        console.log("  password  - รหัสผ่าน (required)");
        console.log("  email     - อีเมลสำหรับแจ้งเตือน Login (optional)");
        process.exit(1);
    }

    //เชื่อมต่อฐานข้อมูล
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME);

    const users = db.collection("users");

    const normalizedUsername = usernameArg.toLowerCase().trim();
    const normalizedEmail = email ? email.toLowerCase().trim() : null;

    //ตรวจสอบ username ซ้ำ
    const existingByUsername = await users.findOne({ username: normalizedUsername });
    if (existingByUsername) {
        console.log(`Username '${normalizedUsername}' already exists`);
        process.exit(1);
    }

    // ตรวจสอบ email ซ้ำ (เฉพาะถ้ามีการระบุมา)
    if (normalizedEmail) {
        const existingByEmail = await users.findOne({ email: normalizedEmail });
        if (existingByEmail) {
            console.log(`Email '${normalizedEmail}' already exists`);
            process.exit(1);
        }
    }

    //เข้ารหัส password แบบ hash
    const passwordHash = await argon2.hash(password, {
        type: argon2.argon2id
    });

    //เตรียมข้อมูลและบันทึก
    const now = new Date();
    const insertData: Record<string, unknown> = {
        username: normalizedUsername,
        passwordHash,
        role: "superuser",
        isActive: true,
        name: "Superuser",
        personnelId: null,
        createdAt: now,
        updatedAt: now,
    };

    // ใส่ email เฉพาะถ้ามีการระบุมา
    if (normalizedEmail) {
        insertData.email = normalizedEmail;
    }

    const result = await users.insertOne(insertData);

    console.log("✅ Superuser created successfully!");
    console.log(`   ID:       ${result.insertedId.toString()}`);
    console.log(`   Alias:    ${normalizedUsername}`);
    console.log(`   Email:    ${normalizedEmail || "(ไม่ได้ระบุ - ตั้งค่าได้ภายหลัง)"}`);
    console.log(`   Role:     superuser`);
    console.log("\n📌 ใช้ Alias + Password ในการ Login`");
    process.exit(0);
}

main().catch((error) => {
    console.error("Error:", error);
    process.exit(1);
});
