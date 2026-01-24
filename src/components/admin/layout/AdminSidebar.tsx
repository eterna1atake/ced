
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";

// SVG Icons for generic usage
const Icons = {
    Dashboard: (props: React.ComponentProps<'svg'>) => <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" /></svg>,
    Content: (props: React.ComponentProps<'svg'>) => <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>,
    News: (props: React.ComponentProps<'svg'>) => <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z" /></svg>,
    Award: (props: React.ComponentProps<'svg'>) => <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.504-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0V5.625a2.25 2.25 0 00-2.25-2.25h-1.5a2.25 2.25 0 00-2.25 2.25v8.625" /></svg>,
    Training: (props: React.ComponentProps<'svg'>) => <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" /></svg>,
    Person: (props: React.ComponentProps<'svg'>) => <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>,
    Program: (props: React.ComponentProps<'svg'>) => <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" /></svg>,
    Room: (props: React.ComponentProps<'svg'>) => <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6h1.5m-1.5 3h1.5m-1.5 3h1.5M6.75 21v-3.75a1.5 1.5 0 013 0V21m5.25 0v-3.75a1.5 1.5 0 013 0V21M9 6.75v3.375m3-3.375v3.375m3-3.375v3.375" /></svg>,
    Service: (props: React.ComponentProps<'svg'>) => <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.26 2.26 0 0021 17.25l-5.83-5.83m0-6.63L21 4.13m0 0l-5.83 5.83m0 0l-4.06-4.06a6 6 0 00-8.49 8.49l4.06 4.06a6 6 0 008.49-8.491z" /></svg>,
    Form: (props: React.ComponentProps<'svg'>) => <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>,
    Globe: (props: React.ComponentProps<'svg'>) => <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" /></svg>,
    History: (props: React.ComponentProps<'svg'>) => <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    Users: (props: React.ComponentProps<'svg'>) => <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>,
    Settings: (props: React.ComponentProps<'svg'>) => <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 00-2.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
    Key: (props: React.ComponentProps<'svg'>) => <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" /></svg>,
};


export default function AdminSidebar({
    isOpen,
    setIsOpen,
    isCollapsed = false,
    setIsCollapsed
}: {
    isOpen: boolean;
    setIsOpen: (val: boolean) => void;
    isCollapsed?: boolean;
    setIsCollapsed?: (val: boolean) => void;
}) {
    const pathname = usePathname();
    const t = useTranslations("Admin.sidebar");
    const locale = useLocale();

    // Prevent scrolling when mobile sidebar is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        // Cleanup
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    const navGroups = [
        {
            title: t("content"),
            items: [
                { label: t("dashboard"), href: `/${locale}/admin`, icon: Icons.Dashboard },
                { label: t("hero"), href: `/${locale}/admin/hero`, icon: Icons.Content },
                { label: t("news"), href: `/${locale}/admin/news`, icon: Icons.News },
                { label: t("awards"), href: `/${locale}/admin/awards`, icon: Icons.Award },
                { label: t("training"), href: `/${locale}/admin/training`, icon: Icons.Training },
            ]
        },
        {
            title: t("people"),
            items: [
                { label: t("personnel"), href: `/${locale}/admin/personnel`, icon: Icons.Person },
            ]
        },
        {
            title: t("academic"),
            items: [
                { label: t("programs"), href: `/${locale}/admin/programs`, icon: Icons.Program },
                { label: t("classrooms"), href: `/${locale}/admin/classrooms`, icon: Icons.Room },
                { label: t("onlineResources"), href: `/${locale}/admin/online-resources`, icon: Icons.Globe },
            ]
        },
        {
            title: t("services"),
            items: [
                { label: t("studentServices"), href: `/${locale}/admin/services`, icon: Icons.Service },
                { label: t("formRequests"), href: `/${locale}/admin/forms`, icon: Icons.Form },
            ]
        },
        {
            title: t("system"),
            items: [
                { label: t("users"), href: `/${locale}/admin/users`, icon: Icons.Users },
                { label: t("loginHistory"), href: `/${locale}/admin/login-history`, icon: Icons.History },
                { label: t("settings"), href: `/${locale}/admin/settings`, icon: Icons.Settings },
                { label: t("myProfile"), href: `/${locale}/admin/profile`, icon: Icons.Person },
            ]
        }
    ];

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm transition-opacity"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
                    fixed top-0 left-0 h-[calc(100vh-2rem)] m-4 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 z-50 transform transition-transform duration-300 ease-in-out
                    flex flex-col shadow-xl rounded-xl w-64 border border-transparent dark:border-slate-800
                    ${isOpen ? 'translate-x-0' : '-translate-x-[calc(100%+1rem)] lg:translate-x-0'}
                    ${isCollapsed ? 'lg:w-20' : 'lg:w-64'}
                `}
            >
                <div className={`p-4 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} h-24 border-b border-slate-100 dark:border-slate-800`}>
                    {!isCollapsed && (
                        <div className="flex items-center gap-2 px-2">
                            <div className="overflow-hidden">
                                <Image
                                    src="/images/logo/logo_1.png"
                                    alt="CED Logo"
                                    width={140}
                                    height={35}
                                    className="object-contain block dark:hidden"
                                />
                                <Image
                                    src="/images/logo/logo_1.png"
                                    alt="CED Logo"
                                    width={140}
                                    height={35}
                                    className="object-contain hidden dark:block brightness-0 invert"
                                />
                            </div>
                        </div>
                    )}
                    {isCollapsed && (
                        <div className="relative w-[50px] h-[35px]">
                            <Image
                                src="/images/logo/logo_2.png"
                                alt="CED Logo"
                                fill
                                className="object-contain block dark:hidden"
                            />
                            <Image
                                src="/images/logo/logo_2.png"
                                alt="CED Logo"
                                fill
                                className="object-contain hidden dark:block brightness-0 invert"
                            />
                        </div>
                    )}

                    {/* Desktop Toggle Button */}
                    {setIsCollapsed && (
                        <button
                            onClick={() => setIsCollapsed(!isCollapsed)}
                            className="hidden lg:flex p-1.5 rounded-md text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                        >
                            {isCollapsed ? (
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 4.5l7.5 7.5-7.5 7.5m-6-15l7.5 7.5-7.5 7.5" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M18.75 19.5l-7.5-7.5 7.5-7.5m-6 15L5.25 12l7.5-7.5" />
                                </svg>
                            )}
                        </button>
                    )}

                    {/* Close Button (Mobile/Tablet Only) */}
                    <button
                        onClick={() => setIsOpen(false)}
                        className="lg:hidden text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <nav className="flex-1 p-4 space-y-4 overflow-y-auto overflow-x-hidden [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-200 dark:[&::-webkit-scrollbar-thumb]:bg-slate-700 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-300 dark:hover:[&::-webkit-scrollbar-thumb]:bg-slate-600">
                    {navGroups.map((group) => (
                        <div key={group.title} className={`${isCollapsed ? 'text-center' : ''}`}>
                            {!isCollapsed && (
                                <h3 className="px-4 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 mt-2 truncate">
                                    {group.title}
                                </h3>
                            )}
                            {isCollapsed && (
                                <div className="h-4"></div> // Spacer
                            )}

                            <div className="space-y-1">
                                {group.items.map((item) => {
                                    const isActive = pathname === item.href;
                                    const Icon = item.icon;
                                    return (
                                        <Link
                                            key={item.label}
                                            href={item.href}
                                            onClick={() => {
                                                setIsOpen(false);
                                                if (isCollapsed && setIsCollapsed) setIsCollapsed(false);
                                            }}
                                            title={isCollapsed ? item.label : undefined}
                                            className={`
                                                flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-sm font-medium group
                                                ${isActive
                                                    ? 'bg-gradient-to-tr from-primary-hover to-primary-main text-white shadow-md'
                                                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'}
                                                ${isCollapsed ? 'justify-center px-2' : ''}
                                            `}
                                        >
                                            <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200'}`} />

                                            {!isCollapsed && (
                                                <span className="truncate">{item.label}</span>
                                            )}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </nav>
            </aside>
        </>
    );
}
