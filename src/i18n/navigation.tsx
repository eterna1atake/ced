import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";
import React, { ComponentProps } from "react";

// สร้าง navigation มาตรฐานจาก next-intl
const navigation = createNavigation(routing);

/**
 * 🛠️ CUSTOM WRAPPER: เติม /cedweb เข้าไปที่ข้างหน้า Path เสมอ
 * เพื่อให้เมนูทัั้งหมด (Navbar/Footer) พลิกเป็น /cedweb/... อัตโนมัติ
 */
const { 
  Link: NexIntlLink, 
  redirect: nextIntlRedirect, 
  usePathname: nextIntlUsePathname, 
  useRouter: nextIntlUseRouter, 
  getPathname: nextIntlGetPathname 
} = navigation;

// 1. ปรับแต่ง Link
// @ts-ignore - หลีกเลี่ยงความซับซ้อนของ Generics ใน ForwardRefExoticComponent
export const Link = React.forwardRef<HTMLAnchorElement, ComponentProps<typeof NexIntlLink>>(
  (props, ref) => {
    const { href, ...remaining } = props;
    
    let updatedHref = href;
    // ถ้า href เป็น string และเริ่มด้วย / แต่ยังไม่มี /cedweb ให้นำหน้าด้วย /cedweb
    if (typeof href === 'string' && href.startsWith('/') && !href.startsWith('/cedweb')) {
      updatedHref = href === '/' ? '/cedweb' : `/cedweb${href}`;
    }
    
    return <NexIntlLink {...remaining} href={updatedHref as any} ref={ref} />;
  }
);

Link.displayName = "CedwebLink";

// 2. ปรับแต่ง redirect
export const redirect = (href: string, ...args: any[]) => {
    let updatedHref = href;
    if (typeof href === 'string' && href.startsWith('/') && !href.startsWith('/cedweb')) {
        updatedHref = href === '/' ? '/cedweb' : `/cedweb${href}`;
    }
    // @ts-ignore
    return nextIntlRedirect(updatedHref, ...args);
};

// 3. ปรับแต่ง usePathname ให้ใช้ง่าย
export const usePathname = () => {
    const pathname = nextIntlUsePathname();
    // ถ้าแสดงผลแล้วมี /cedweb ให้ตัดออกเพื่อความสะดวกในการเอาไปเช็ค Active Menu
    return pathname.startsWith('/cedweb') ? pathname.replace('/cedweb', '') || '/' : pathname;
};

// 4. ปรับแต่ง useRouter
export const useRouter = () => {
    const router = nextIntlUseRouter();
    return {
        ...router,
        push: (href: string, options?: any) => {
            let updatedHref = href;
            if (typeof href === 'string' && href.startsWith('/') && !href.startsWith('/cedweb')) {
                updatedHref = href === '/' ? '/cedweb' : `/cedweb${href}`;
            }
            return router.push(updatedHref, options);
        },
        replace: (href: string, options?: any) => {
            let updatedHref = href;
            if (typeof href === 'string' && href.startsWith('/') && !href.startsWith('/cedweb')) {
                updatedHref = href === '/' ? '/cedweb' : `/cedweb${href}`;
            }
            return router.replace(updatedHref, options);
        }
    };
};

export const getPathname = nextIntlGetPathname;

// ส่งต่อ hooks มาตรฐานจาก next/navigation เพื่อความสะดวกในการใช้งาน
export { useSearchParams, useParams, notFound } from "next/navigation";
