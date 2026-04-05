import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

/**
 * มาตรฐานการทำ Navigation สำหรับ Next.js 16 + next-intl
 * เนื่องจากเราใช้ Root (/) เป็นหลักแล้ว จึงไม่จำเป็นต้องมี Wrapper เติม Path
 */
export const { 
  Link, 
  redirect, 
  usePathname, 
  useRouter, 
  getPathname 
} = createNavigation(routing);

// ส่งต่อ hooks มาตรฐานจาก next/navigation เพื่อความสะดวกในการใช้งาน
export { useSearchParams, useParams, notFound } from "next/navigation";
