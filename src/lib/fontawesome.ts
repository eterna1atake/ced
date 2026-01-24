// ตั้งค่าการใช้งาน Font Awesome ให้ไม่ inject CSS อัตโนมัติซ้ำกับ Next.js
import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";

// ปิดการ add css อัตโนมัติ
config.autoAddCss = false;
