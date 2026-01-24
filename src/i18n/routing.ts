// กำหนดค่าเส้นทางสำหรับการแปลภาษาใน next-intl
import {defineRouting} from "next-intl/routing";

export const routing = defineRouting({
  locales: ["th", "en"],
  defaultLocale: "en",      // ปรับได้ตามต้องการ
  localePrefix: "always"
});
