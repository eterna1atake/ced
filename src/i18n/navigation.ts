// ตัวช่วยสร้าง navigation ที่รองรับหลายภาษา โดยอิง config จาก routing.ts
import {createNavigation} from "next-intl/navigation";
import {routing} from "./routing";

export const {Link, redirect, usePathname, useRouter, getPathname} =
  createNavigation(routing);
