import { ReactNode } from "react";
import AdminLayoutShell from "@/components/admin/layout/AdminLayoutShell";
import SessionTimeout from "@/components/admin/SessionTimeout";
import "@/app/globals.css";

export default function AdminLayout({ children }: { children: ReactNode }) {
    return (
        <>
            <SessionTimeout />
            <AdminLayoutShell>
                {children}
            </AdminLayoutShell>
        </>
    );
}
