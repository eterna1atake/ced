# 🚀 CED Portal: Deployment Guide (Docker & VPS)

คู่มือฉบับสมบูรณ์สำหรับการ Deploy โปรเจกต์ **CED Portal** ขึ้นสู่เครื่องเซิร์ฟเวอร์จริง (VPS) โดยใช้งานผ่าน **Docker** เพื่อความปลอดภัยและรวดเร็ว

---

## 🛠️ 1. การเตรียมความพร้อม (Prerequisites)

ก่อนเริ่มดำเนินการ คุณจำเป็นต้องเตรียมสิ่งเหล่านี้ให้พร้อม:
*   **เครื่อง VPS**: แนะนำ CPU 1-2 vCPUs, RAM อย่างน้อย 2GB (เช่น ClawCloud, DigitalOcean, Oracle Cloud)
*   **ระบบปฏิบัติการ**: Ubuntu 22.04 LTS หรือใหม่กว่า
*   **External Service Accounts**: 
    - **Cloudinary**: สำหรับเก็บรูปภาพ
    - **Google Analytics 4**: สำหรับระบบ Traffic Dashboard
    - **reCAPTCHA v2**: สำหรับระบบป้องกันบอท (Security)

---

## 🔐 2. การจัดการตัวแปรสภาพแวดล้อม (.env)

ไฟล์ `.env` คือส่วนที่สำคัญและเปราะบางที่สุด **ห้ามอัปโหลดขึ้น GitHub เด็ดขาด!**

### ขั้นตอนการตั้งค่า:
1.  คัดลอกไฟล์ต้นแบบ: `cp .env.example .env`
2.  **แก้ไขค่าสำคัญใน .env**:
    - **DB_ROOT_USER / PASS**: ตั้งรหัสผ่านที่ซับซ้อนสำหรับฐานข้อมูล MongoDB
    - **NEXT_PUBLIC_APP_URL**: เปลี่ยนจาก `localhost` เป็นโดเมนหรือ IP ของ VPS คุณ
    - **AUTH_SECRET**: ใช้รหัสที่ปลอดภัย (Generator: `openssl rand -base64 32`)
    - **Cloudinary / GA4**: ใส่คีย์ที่ได้จากบัญชีของคุณเอง

---

## 🏗️ 3. การเตรียมตัวก่อนขึ้น VPS (Local Test)

ก่อนจะส่งโค้ดขึ้นเซิร์ฟเวอร์ ให้ทดสอบบิ้วและรันในเครื่องตัวเองก่อน:

```bash
# ตรวจสอบว่าแอปทำงานร่วมกับ Docker ได้ปกติ
docker-compose up -d --build
```

*ตรวจสอบการทำงานเบื้องต้นที่ `localhost:3006`*

---

## 🚢 4. การติดตั้งและ Deploy บน VPS

### 4.1 ติดตั้ง Docker บน VPS (Ubuntu)
รีโมทเข้าเครื่อง VPS ผ่าน SSH แล้วรันคำสั่งเหล่านี้:

```bash
# ลง Docker อัตโนมัติ
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
```

### 4.2 การคัดลอกโปรเจกต์
คุณสามารถใช้ **Git Clone** หรือส่งไฟล์ด้วย **SCP** (แนะนำให้มีไฟล์ `.env` ไปด้วย):

```bash
# ตัวอย่างการส่งไฟล์ .env ขึ้น VPS
scp .env root@<IP_VPS>:/root/ced-portal/.env
```

### 4.3 การเปิดระบบ (First Launch)
ภายในโฟลเดอร์โปรเจกต์บน VPS ให้รันสคริปต์ที่เตรียมไว้ให้:

```bash
# ทำให้สคริปต์รันได้
chmod +x deploy.sh

# เริ่มการ Deploy
./deploy.sh
```

*(สคริปต์จะทำการสร้าง Image, รัน Container และล้างข้อมูลขยะให้อัตโนมัติ)*

---

## 🛡️ 5. การตั้งค่าความปลอดภัย (Security Checklist)

### 5.1 การตั้งค่า Firewall (UFW)
เปิดเฉพาะพอร์ตที่จำเป็นเท่านั้น:

```bash
sudo ufw allow 22        # SSH (จำเป็น)
sudo ufw allow 3006      # พอร์ตเว็บ CED Portal
sudo ufw default deny incoming
sudo ufw enable
```

### 5.2 การเข้าจัดการฐานข้อมูล (Admin Panel)
พอร์ต **8086** และ **27016** ถูกบล็อก (Bound) ไว้ที่ `127.0.0.1` ภายในเครื่อง VPS เพื่อความปลอดภัย:
*   **การเข้าใช้งาน**: ให้ใช้การทำ **SSH Tunnel** จากโปรแกรมจัดการฐานข้อมูล (เช่น MongoDB Compass) มุ่งหน้าไปที่ IP VPS ของคุณ

---

## 📈 6. การดูแลและบำรุงรักษา (Maintenance)

*   **ดู Logs การทำงาน**: `docker-compose logs -f`
*   **อัปเดตระบบ**: แก้ไขโค้ดในเครื่องแล้วรัน `./deploy.sh` อีกรอบ (ระบบจะทำ Zero-Downtime Deployment ให้อัตโนมัติ)
*   **การสำรองข้อมูล (Backup)**: แนะนำให้ทำ Snapshot ของเครื่อง VPS หรือสำรองโฟลเดอร์ `mongo-data` เป็นระยะเพื่อป้องกันข้อมูลสูญหาย

---

**จัดทำโดย**: Antigravity AI Coding Assistant
**สถานะโปรเจกต์**: พร้อมใช้งานระดับ Production (Production Ready) 🌍✨
