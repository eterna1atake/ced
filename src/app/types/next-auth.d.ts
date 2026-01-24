import "next-auth";

declare module "next-auth" {
    // ขยาย interface ของ Session เพื่อเพิ่มฟิลด์ที่เรากำหนดเอง
    interface Session {
        user: {
            email?: string | null;
            name?: string | null;
            role?: "superuser" | null;
            personnelId?: string | null;
        };
    }
    // (หมายเหตุ: หากมีการขยาย Type ของ JWT Token ด้วย ควรเพิ่ม 'interface JWT' เข้ามาในบล็อกนี้ด้วย)
}

// ไฟล์นี้จำเป็นเพื่อให้ TypeScript สามารถตรวจสอบความปลอดภัยของ Type (Type Safety)
// เมื่อมีการเข้าถึง session.user.role หรือ session.user.personnelId ในโค้ดส่วนอื่น
// โดยเฉพาะในส่วน Frontend ที่ใช้ useSession()