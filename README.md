# ภาพรวมระบบ (System Overview)

เอกสารนี้อธิบายโครงสร้างเชิงลึกและการทำงานของระบบเว็บไซต์ภาควิชาคอมพิวเตอร์ศึกษา (CED) เพื่อช่วยให้นักพัฒนาเข้าใจภาพรวมของสถาปัตยกรรม ฟีเจอร์หลัก และการไหลของข้อมูล (Data Flow) ภายในระบบ

---

## 🏗️ สถาปัตยกรรมระบบ (System Architecture)

ระบบถูกพัฒนาด้วย **Next.js 15 (App Router)** ซึ่งเป็นสถาปัตยกรรมแบบ **Full-stack** ที่รวมส่วนติดต่อผู้ใช้ (Frontend) และตรรกะฝั่งเซิร์ฟเวอร์ (Backend) ไว้ในโปรเจกต์เดียวกัน

### Tech Stack หลัก
- **Frontend**: React 19, Tailwind CSS (Styling), Framer Motion / AOS (Animations)
- **Backend API**: Next.js Route Handlers (`src/app/api/`)
- **Database**: MongoDB ใช้งานผ่าน Mongoose ODM
- **Authentication**: NextAuth.js v5 (Beta)
- **Internationalization**: next-intl (รองรับ TH/EN)

---

## 🗄️ โครงสร้างฐานข้อมูล (Database & Models)

ระบบใช้ **MongoDB** เป็นฐานข้อมูลหลัก โดยมีการกำหนด Schema หรือโครงสร้างข้อมูลผ่าน **Mongoose** ไฟล์ Model ทั้งหมดจะถูกเก็บไว้ที่ `src/collections/`

### Collections หลัก (Key Entities)
| Model | คำอธิบาย |
| :--- | :--- |
| **User** | ผู้ใช้งานระบบ (Admin) มีระดับสิทธิ์การเข้าถึง |
| **Personnel** | ข้อมูลบุคลากร อาจารย์ และเจ้าหน้าที่ (รองรับ 2 ภาษา) |
| **News** | ข่าวประชาสัมพันธ์และประกาศต่างๆ |
| **Award** | รางวัลและความภาคภูมิใจของภาควิชา |
| **Program** | ข้อมูลหลักสูตรการศึกษา (ตรี/โท/เอก) |
| **HeroCarousel** | ภาพแบนเนอร์ประชาสัมพันธ์หน้าแรกที่แก้ไขได้ |
| **Classroom** | ข้อมูลห้องเรียนและแหล่งเรียนรู้ |
| **FormRequest** | คำร้องและเอกสารดาวน์โหลด |

---

## 🔐 ระบบความปลอดภัยและการยืนยันตัวตน (Security & Auth)

ระบบให้ความสำคัญกับความปลอดภัยในระดับสูงสำหรับการเข้าถึงส่วนผู้ดูแลระบบ (Admin Panel):

1. **Authentication**:
   - ใช้ **NextAuth.js** จัดการ Session แบบ Server-side Secure Cookies
   - รองรับการล็อกอินด้วย Email/Password
   - มีระบบติดตาม Session และบังคับล็อกอินใหม่เมื่อ Session หมดอายุ

2. **Security Measures** (ใน `src/lib/`):
   - **Rate Limiting**: ป้องกันการโจมตีแบบ Brute Force หรือ DDoS ในหน้า Login และ API
   - **Password Hashing**: เข้ารหัสรหัสผ่านอย่างปลอดภัย (Argon2)
   - **TOTP / 2FA**: รองรับระบบรหัสผ่านครั้งเดียว (Time-based One-Time Password)
   - **Trusted Device**: ตรวจสอบอุปกรณ์ที่เข้าใช้งานเพื่อความปลอดภัยที่มากขึ้น
   - **Audit Logs**: บันทึกกิจกรรมการใช้งานที่สำคัญในระบบ

---

## 🌍 ระบบหลายภาษา (Internationalization - i18n)

ระบบถูกออกแบบให้รองรับ 2 ภาษา (ไทย/อังกฤษ) อย่างสมบูรณ์ (Fully Bilingual):

- **Routing**: URL จะมี prefix ของภาษา เช่น `/th/...` หรือ `/en/...` จัดการโดย Middleware
- **Content**: ข้อมูลในฐานข้อมูล (MongoDB) เก็บแยกฟิลด์ภาษาชัดเจน (เช่น `name.th`, `name.en`) เพื่อให้ฝ่าย Admin สามารถกรอกข้อมูลได้ทั้งสองภาษา
- **UI Text**: ข้อความคงที่บนหน้าเว็บถูกเก็บในไฟล์ JSON (`messages/path/to/locale.json`) และเรียกใช้ผ่าน `next-intl`

---

## ⚙️ ระบบจัดการหลังบ้าน (CMS Dashboard)

เข้าถึงได้ผ่าน Route `/admin` เป็นพื้นที่สำหรับดูแลจัดการเนื้อหาเว็บไซต์ทั้งหมด:

- **Dashboard**: แสดงสถิติภาพรวมและการเข้าชมเว็บไซต์ (Analytics)
- **Content Management**: ฟอร์ม (CRUD) สำหรับ สร้าง/แก้ไข/ลบ ข้อมูลต่างๆ เช่น ข่าว บุคลากร แบนเนอร์
- **Media Handling**: ระบบอัปโหลดรูปภาพพร้อมการแสดงผลพรีวิว
- **User Management**: จัดการบัญชีผู้ดูแลระบบและสิทธิ์การใช้งาน

---

## 🔄 การไหลของข้อมูล (Data Flow)

1. **Client Request**: ผู้ใช้เข้าชมหน้าเว็บ (เช่น หน้าบุคลากร)
2. **Middleware**: ตรวจสอบ Locale (ภาษา) และ Redirect หากจำเป็น
3. **Server Component**: Next.js ดึงข้อมูลจาก MongoDB ผ่าน Mongoose (Direct DB Call) เพื่อทำ SEO และ Performance ที่ดีที่สุด (Server-side Data Fetching)
4. **API Routes**: สำหรับการกระทำแบบโต้ตอบ (Interactive) เช่น การส่งฟอร์ม หรือการโหลดข้อมูลเพิ่มเติม จะเรียกผ่าน API (`/api/...`)
5. **Rendering**: ส่ง HTML ที่พร้อมแสดงผลกลับไปยัง Browser ของผู้ใช้

