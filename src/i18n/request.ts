// กำหนดวิธีโหลดข้อความแปลสำหรับแต่ละ request
import {getRequestConfig} from "next-intl/server";
import {hasLocale} from "next-intl";
import {routing} from "./routing";

// NOTE: โฟลเดอร์ messages อยู่ที่ ROOT (ข้าง package.json)
export default getRequestConfig(async ({locale}) => {
  const current = hasLocale(routing.locales, locale) ? (locale as string) : routing.defaultLocale;

  return {
    locale: current,
    messages: (await import(`../../messages/${current}.json`)).default
  };
});
