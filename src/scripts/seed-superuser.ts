import "dotenv/config";
import clientPromise from "@/lib/mongodb";
import argon2 from "argon2";

//สร้าง Script สำหรับสร้าง Superuser (seed)
async function main() {
    //รับคำสั่งผ่าน cmd
    const email = process.argv[2];
    const password = process.argv[3];

    //ตรวจสอบ input
    if (!email || !password) {
        console.log("Please provide email and password");
        process.exit(1);
    }

    //เชื่อมต่อฐานข้อมูล
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME);

    const users = db.collection("users");

    //แปลงอีเมลที่ได้รับให้เป็นตัวพิมพ์เล็กทั้งหมดและลบช่องว่างหัวท้าย
    const normalizedEmail = email.toLowerCase().trim();

    //ตรวจสอบผู้ใช้เดิม
    const existing = await users.findOne({ email: normalizedEmail });
    if (existing) {
        console.log("User already exists");
        process.exit(1);
    }

    //เข้ารหัส password แบบ hash
    const passwordHash = await argon2.hash(password, {
        type: argon2.argon2id
    });

    //เตรียมข้อมูลและบันทึก
    const now = new Date();
    const result = await users.insertOne({
        email: normalizedEmail,
        passwordHash,
        role: "superuser",
        isActive: true,
        name: "Superuser",
        personnelId: null,
        createdAt: now,
        updatedAt: now,
    });

    console.log("Superuser created:", result.insertedId.toString());
    process.exit(0);
}

main().catch((error) => {
    console.error("Error:", error);
    process.exit(1);
});
