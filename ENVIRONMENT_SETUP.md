# 🛡️ คู่มือการตั้งค่า Environment (ENV) สำหรับ CED Portal

คู่มือนี้สรุปวิธีการหาค่าและเจนเนอเรทคีย์ทั้งหมดที่จำเป็นสำหรับระบบ **CED Portal** เพื่อให้คุณนำไปใส่ในไฟล์ `.env.local` (Local) และ `.env` (Production) ได้อย่างถูกต้อง

---

## **1. ส่วน Authentication & Security (สุ่มคีย์เอง)**
ใช้สำหรับเข้ารหัสเซสชันและรหัสผ่านของผู้ใช้งาน

| ตัวแปร | วิธีการหา / คำสั่งเจนเนอเรท |
| :--- | :--- |
| **AUTH_SECRET** | `openssl rand -base64 32` |
| **AUTH_PRIVATE_KEY** | `openssl genrsa -out private.pem 2048` (ก๊อปจากไฟล์ `private.pem`) |
| **AUTH_PUBLIC_KEY** | `openssl rsa -in private.pem -pubout -out public.pem` (ก๊อปจาก `public.pem`) |

---

## **2. บริการส่งอีเมล (Gmail SMTP)**
ใช้สำหรับส่ง Login Alert และรีเซ็ตรหัสผ่าน

| ตัวแปร | ที่มา / วิธีการหา |
| :--- | :--- |
| **SMTP_USER** | อีเมล Gmail ของคุณ (เช่น `ced@gmail.com`) |
| **SMTP_PASS** | ไปขอ **App Password 16 หลัก** ที่ [Google Account Security](https://myaccount.google.com/apppasswords) |
| **SMTP_PORT** | ใส่เป็น `587` |
| **SMTP_SECURE** | **สำคัญ:** ต้องใส่เป็น `false` เท่านั้น (สำหรับพอร์ต 587 ใน Nodemailer) |
| **SMTP_FROM** | รูปแบบ: `ชื่อโปรเจกต์ <อีเมลคุณ>` (เช่น `CED Admin <ced@gmail.com>`) |

---

## **3. สถิติเว็บไซต์ (Google Analytics 4)**
ใช้สำหรับดึงกราฟสถิติมาโชว์ที่ Dashboard แอดมิน

| ตัวแปร | ที่มา / วิธีการหา |
| :--- | :--- |
| **GA_PROPERTY_ID** | จากหน้า [GA Admin](https://analytics.google.com/) -> Property Settings -> **Property ID** |
| **NEXT_PUBLIC_GA_MEASUREMENT_ID** | จากหน้า GA Admin -> Data Streams -> **Measurement ID** (เริ่มด้วย G-...) |
| **GOOGLE_CLIENT_EMAIL** | จาก [Google Cloud Console](https://console.cloud.google.com/) -> IAM -> **Service Account Email** |
| **GOOGLE_PRIVATE_KEY** | จากไฟล์ JSON ที่โหลดมาจาก Service Account -> ฟิลด์ **`private_key`** |

> **⚠️ ขั้นตอนสุดท้าย:** ต้องนำอีเมล Service Account ไปแอดเพิ่มใน Google Analytics (Property Access Management) โดยให้สิทธิ์เป็น **Viewer** ด้วยนะครับ

---

## **4. บริการฝากรูปภาพ (Cloudinary)**
ใช้สำหรับเก็บไฟล์รูปภาพข่าวและโปรไฟล์บุคลากร

*   **ที่มา:** หน้า Dashboard ของ [Cloudinary.com](https://cloudinary.com/console)
*   **ค่าที่ต้องนำมาใส่:**
    - `CLOUDINARY_CLOUD_NAME`
    - `CLOUDINARY_API_KEY`
    - `CLOUDINARY_API_SECRET`

---

## **5. ความปลอดภัย (reCAPTCHA v2)**
ใช้สำหรับป้องกันบอทในหน้า Login

*   **ที่มา:** [Google reCAPTCHA Console](https://www.google.com/recaptcha/admin)
*   **ประเภท:** เลือก **v2 "I'm not a robot" Checkbox**
*   **ค่าที่ต้องนำมาใส่:**
    - `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`
    - `RECAPTCHA_SECRET_KEY`

---

## **💡 เคล็ดลับการใส่ข้อมูล:**
- หากคีย์ตัวไหนมีหลายบรรทัด (เช่น Private Key) **ต้องครอบด้วยเครื่องหมายอัญประกาศคู่ (`"..."`)** และใส่ `\n` ให้เรียบร้อย
- เมื่อแก้ไขไฟล์ `.env.local` เสร็จแล้ว **ต้อง Restart Server เสมอ** (`npm run dev`) เพื่อให้ระบบอ่านค่าใหม่
- **ห้ามนำไฟล์ .env อัปโหลดขึ้น GitHub/GitLab!** ควรเก็บเป็นความลับที่สุด
