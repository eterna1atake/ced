
"use client";

import { useState } from "react";
import AdminSidebar from "@/components/admin/layout/AdminSidebar";
import AdminHeader from "@/components/admin/layout/AdminHeader";
import { UnsavedChangesProvider } from "@/contexts/UnsavedChangesContext";
import { AdminDataProvider } from "@/contexts/AdminDataContext";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function AdminLayoutShell({ children }: { children: React.ReactNode }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const locale = useLocale();
    const t = useTranslations("Admin.footer");

    return (
        <UnsavedChangesProvider>
            <AdminDataProvider>
                <div className="flex bg-slate-50 dark:bg-slate-950 min-h-screen">
                {/* Sidebar Component handles its own visibility/responsive logic */}
                <AdminSidebar
                    isOpen={isSidebarOpen}
                    setIsOpen={setIsSidebarOpen}
                    isCollapsed={isCollapsed}
                    setIsCollapsed={setIsCollapsed}
                />

                {/* Main Content Area */}

                <div
                    className={`flex-1 w-full transition-all duration-300 ${isCollapsed ? 'lg:ml-28' : 'lg:ml-72'}`}
                >
                    <AdminHeader
                        onMenuClick={() => setIsSidebarOpen(true)}
                    />

                    <div className="p-4 md:p-8 flex flex-col min-h-screen">
                        <main className="flex-1 overflow-x-hidden">
                            {children}
                        </main>

                        <footer className="mt-8 pt-8 pb-4 border-t border-slate-200 dark:border-slate-800">
                            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                                <p>
                                    {t.rich("rights", {
                                        year: new Date().getFullYear(),
                                        dept: (chunks) => <span className="font-semibold text-slate-700 dark:text-slate-200">{chunks}</span>
                                    })}
                                </p>
                                <div className="flex gap-6">
                                    <Link href="/ced-portal/guide" className="hover:text-slate-800 transition-colors">
                                        {t("guide")}
                                    </Link>
                                    <Link href={`/${locale}/ced-portal/privacy`} className="hover:text-slate-800 transition-colors">
                                        {t("privacy")}
                                    </Link>
                                    <Link href={`/${locale}/ced-portal/contact`} className="hover:text-slate-800 transition-colors">
                                        {t("contact")}
                                    </Link>
                                </div>
                            </div>
                        </footer>
                    </div>
                </div>
            </div>
            </AdminDataProvider>
        </UnsavedChangesProvider>
    );
}
