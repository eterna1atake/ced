
"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useTheme } from "next-themes";
import { Fragment, useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import { useLocale, useTranslations } from "next-intl";
import LanguageSwitch from "@/components/common/LanguageSwitch";
import Swal from "sweetalert2";
import router from "next/router";

export default function AdminHeader({
    onMenuClick,
}: {
    onMenuClick: () => void;
}) {
    const pathname = usePathname();
    const locale = useLocale();
    const t = useTranslations("Admin.header");
    const tAlert = useTranslations("Admin.alerts");
    const tB = useTranslations("Admin.breadcrumbs");
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Generate breadcrumb items
    const generateBreadcrumbs = () => {
        // Remove locale prefix if present for consistent processing
        const pathParts = pathname.split('/').filter(Boolean);
        const segments = (pathParts[0] === locale) ? pathParts.slice(1) : pathParts;

        // Helper to check if string is a MongoDB ObjectId
        const isObjectId = (str: string) => /^[0-9a-fA-F]{24}$/.test(str);

        // Mapping of URL segments to translation keys
        const segmentToKey: Record<string, string> = {
            'ced-portal': 'dashboard',
            'hero': 'hero',
            'news': 'news',
            'awards': 'awards',
            'training': 'training',
            'personnel': 'personnel',
            'programs': 'programs',
            'facilities': 'facilities',
            'online-resources': 'onlineResources',
            'services': 'services',
            'forms': 'forms',
            'login-history': 'loginHistory',
            'settings': 'settings',
            'profile': 'profile',
            'guide': 'guide',
            'privacy': 'privacy',
            'contact': 'contact'
        };

        let accumulatePath = `/${locale}`;
        return segments.map((segment, index) => {
            accumulatePath += `/${segment}`;
            const isLast = index === segments.length - 1;

            // Default label from segment
            let label = segment.replace(/-/g, ' ');

            if (isObjectId(segment)) {
                // If it's an ID, determine label based on parent segment
                const parentSegment = segments[index - 1];
                const itemKey = segmentToKey[parentSegment];
                if (itemKey) {
                    label = tB('editItem', { item: tB(itemKey) });
                } else {
                    label = tB('editGeneral');
                }
            } else if (segment === 'create' || segment === 'new') {
                // Handle creation actions
                const parentSegment = segments[index - 1];
                const itemKey = segmentToKey[parentSegment];
                if (itemKey) {
                    label = tB('createItem', { item: tB(itemKey) });
                } else {
                    label = tB('createGeneral');
                }
            } else {
                // Standard segment translation
                const key = segmentToKey[segment];
                if (key) {
                    label = tB(key);
                } else {
                    label = label.charAt(0).toUpperCase() + label.slice(1);
                }
            }

            return {
                href: accumulatePath,
                label,
                isLast
            };
        });
    };

    const breadcrumbs = generateBreadcrumbs();

    const [isProfileOpen, setIsProfileOpen] = useState(false);

    return (
        <header
            className="sticky top-4 z-30 mx-4 mb-4 rounded-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-sm h-auto min-h-[4rem] px-4 py-3 flex flex-row items-center justify-between transition-all duration-300 gap-4 border border-transparent dark:border-slate-800"
        >
            <div className="flex items-center gap-4 flex-1">
                <button
                    onClick={onMenuClick}
                    className="lg:hidden p-2 -ml-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded-full transition-colors flex-shrink-0"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                    </svg>
                </button>

                {/* Creative Tim Style Breadcrumbs */}
                <div className="flex flex-col">
                    {/* Mobile: Show Simple Title */}
                    <div className="md:hidden font-semibold text-slate-800 dark:text-slate-200 text-sm">
                        {breadcrumbs.length > 0 ? breadcrumbs[breadcrumbs.length - 1].label : 'Dashboard'}
                    </div>

                    {/* Desktop: Show Full Breadcrumbs */}
                    <nav aria-label="Breadcrumb" className="hidden md:flex items-center text-xs text-slate-500 dark:text-slate-400">
                        {breadcrumbs.map((item, index) => (
                            <Fragment key={item.href}>
                                {index > 0 && <span className="mx-2">/</span>}
                                {item.isLast ? (
                                    <span className="font-normal text-slate-800 dark:text-slate-200">
                                        {item.label}
                                    </span>
                                ) : (
                                    <Link
                                        href={item.href}
                                        className="hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                                    >
                                        {item.label}
                                    </Link>
                                )}
                            </Fragment>
                        ))}
                    </nav>
                </div>
            </div>

            <div className="flex items-center gap-4 justify-end">
                {/* Icons Area */}
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                    {/* Language Switch */}
                    <div className="mr-2 pr-2 border-r border-slate-200 dark:border-slate-700">
                        <LanguageSwitch />
                    </div>

                    {/* Theme Toggle */}
                    <button
                        onClick={() => theme === 'dark' ? setTheme('light') : setTheme('dark')}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500 dark:text-slate-400"
                        title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
                        suppressHydrationWarning
                    >
                        {mounted && theme === 'dark' ? (
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                                <path fillRule="evenodd" d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z" clipRule="evenodd" />
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-amber-500">
                                <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" />
                            </svg>
                        )}
                    </button>

                    {/* Profile Dropdown */}
                    <div className="relative">

                        <button
                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                            className="flex items-center gap-3 focus:outline-none group pl-2"
                        >
                            <div className="hidden md:flex flex-col items-end mr-1 text-right">
                                <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 leading-none group-hover:text-primary-main dark:group-hover:text-primary transition-colors uppercase tracking-tight">{t("adminUser")}</span>
                                <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-widest font-bold">{t("superAdmin")}</span>
                            </div>
                            <div className="w-9 h-9 bg-slate-500 rounded-full flex items-center justify-center text-white shadow-md ring-2 ring-transparent group-hover:ring-slate-200 dark:group-hover:ring-slate-700 transition-all">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                                    <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </button>

                        {/* Dropdown Menu */}
                        {isProfileOpen && (
                            <>
                                <div
                                    className="fixed inset-0 z-10"
                                    onClick={() => setIsProfileOpen(false)}
                                />
                                <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-100 dark:border-slate-800 py-1 z-20 animate-in fade-in slide-in-from-top-2 duration-200">
                                    <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 md:hidden">
                                        <p className="text-sm font-medium text-slate-900 dark:text-slate-200">{t("adminUser")}</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{t("superAdmin")}</p>
                                    </div>
                                    {/* Click to Link a Profile Page*/}
                                    <button
                                        onClick={
                                            () => router.push(`/${locale}/ced-portal/profile`)
                                        }
                                        className="w-full text-left px-4 py-2 text-sm text-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900/20 hover:text-slate-700 dark:hover:text-slate-400 transition-colors flex items-center gap-2"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                            {/* ส่วนหัว (Head) */}
                                            <circle cx="12" cy="7" r="4" />

                                            {/* ส่วนลำตัวและช่วงไหล่ (Body/Shoulders) */}
                                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                        </svg>
                                        {t("profile")}
                                    </button>

                                    {/* Click to Link a Log out*/}
                                    <button
                                        onClick={async () => {
                                            const result = await Swal.fire({
                                                title: tAlert("deleteConfirmTitle"),
                                                text: tAlert("sessionExpiredText"),
                                                icon: "warning",
                                                showCancelButton: true,
                                                confirmButtonColor: "#d33",
                                                cancelButtonColor: "#3085d6",
                                                confirmButtonText: t("logout"),
                                                cancelButtonText: tAlert("cancelButton")
                                            });

                                            if (result.isConfirmed) {
                                                await signOut({
                                                    callbackUrl: `/${locale}/ced-portal/login`,
                                                });
                                            }
                                        }}
                                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700 dark:hover:text-red-400 transition-colors flex items-center gap-2"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                                        </svg>
                                        {t("logout")}
                                    </button>


                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}