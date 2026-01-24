
"use client";

import { useState } from "react";
import AdminSidebar from "@/components/admin/layout/AdminSidebar";
import AdminHeader from "@/components/admin/layout/AdminHeader";

export default function AdminLayoutShell({ children }: { children: React.ReactNode }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <div className="flex bg-slate-50 dark:bg-slate-950 min-h-screen">
            {/* Sidebar Component handles its own visibility/responsive logic */}
            <AdminSidebar
                isOpen={isSidebarOpen}
                setIsOpen={setIsSidebarOpen}
                isCollapsed={isCollapsed}
                setIsCollapsed={setIsCollapsed}
            />

            {/* Main Content Area */}
            {/* 
                Mobile: w-full. 
                Desktop: ml-72 (expanded) or ml-28 (collapsed) to account for floating sidebar margins. 
            */}
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
                                © {new Date().getFullYear()}, <span className="font-semibold text-slate-700 dark:text-slate-200">Computer Education Department (CED)</span>. All Rights Reserved.
                            </p>
                            <div className="flex gap-6">
                                <a href="#" className="hover:text-slate-800 transition-colors">Privacy</a>
                                <a href="#" className="hover:text-slate-800 transition-colors">Terms</a>
                                <a href="#" className="hover:text-slate-800 transition-colors">Contact</a>
                            </div>
                        </div>
                    </footer>
                </div>
            </div>
        </div>
    );
}
