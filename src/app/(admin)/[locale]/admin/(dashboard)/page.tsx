"use client";

import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faNewspaper,
    faUsers,
    faFileLines,
    faServer,
    faArrowRight,
    faClock
} from "@fortawesome/free-solid-svg-icons";

import { useTranslations } from "next-intl";

export default function AdminDashboardPage() {
    const t = useTranslations("Admin.pages.dashboard");
    const stats = [
        { label: "Total News", value: "24", icon: faNewspaper, color: "bg-blue-500", change: "+2 this week" },
        { label: "Active Personnel", value: "18", icon: faUsers, color: "bg-emerald-500", change: "Stable" },
        { label: "Pending Forms", value: "5", icon: faFileLines, color: "bg-amber-500", change: "-1 from yesterday" },
        { label: "System Status", value: "Online", icon: faServer, color: "bg-indigo-500", change: "Uptime 99.9%" },
    ];

    const recentActivity = [
        { action: "New Event Posted", target: "CED Open House 2024", time: "2 hours ago", user: "Admin" },
        { action: "Personnel Updated", target: "Dr. Suthep Profile", time: "5 hours ago", user: "Editor" },
        { action: "Login Failed", target: "Unknown IP (Russia)", time: "1 day ago", user: "System", alert: true },
        { action: "Service Added", target: "Student ID Card", time: "2 days ago", user: "Admin" },
    ];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{t("title")}</h1>
                <p className="text-slate-500 dark:text-slate-400">{t("description")}</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <div key={index} className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border dark:border-slate-800 p-6 flex items-start justify-between hover:shadow-md transition-shadow">
                        <div>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{stat.label}</p>
                            <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{stat.value}</h3>
                            <p className="text-xs text-slate-400">{stat.change}</p>
                        </div>
                        <div className={`${stat.color} text-white p-3 rounded-lg shadow-sm`}>
                            <FontAwesomeIcon icon={stat.icon} className="w-5 h-5" />
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Activity */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl shadow-sm border dark:border-slate-800 p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-100">Recent Activity</h3>
                        <Link href="/admin/login-history" className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium flex items-center gap-1">
                            View All <FontAwesomeIcon icon={faArrowRight} className="w-3 h-3" />
                        </Link>
                    </div>
                    <div className="space-y-4">
                        {recentActivity.map((item, index) => (
                            <div key={index} className="flex items-start gap-4 pb-4 border-b dark:border-slate-800 last:border-0 last:pb-0">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${item.alert ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
                                    <FontAwesomeIcon icon={item.alert ? faServer : faClock} className="w-4 h-4" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-slate-900 dark:text-slate-200">{item.action}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">{item.target} • <span className="text-slate-400 dark:text-slate-500">by {item.user}</span></p>
                                </div>
                                <span className="text-xs text-slate-400 dark:text-slate-500 whitespace-nowrap">{item.time}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Quick Shortcuts */}
                <div className="bg-indigo-50 dark:bg-slate-900 rounded-xl border border-indigo-100 dark:border-slate-800 p-6">
                    <h3 className="font-semibold text-lg text-indigo-900 dark:text-indigo-300 mb-4">Quick Shortcuts</h3>
                    <div className="space-y-3">
                        <Link href="/admin/news/create" className="block w-full text-left bg-white dark:bg-slate-800 p-3 rounded-lg border border-indigo-100 dark:border-slate-700 text-indigo-700 dark:text-indigo-300 text-sm font-medium hover:bg-indigo-500 hover:text-white transition-colors shadow-sm">
                            + Post New Event
                        </Link>
                        <Link href="/admin/personnel/create" className="block w-full text-left bg-white dark:bg-slate-800 p-3 rounded-lg border border-indigo-100 dark:border-slate-700 text-indigo-700 dark:text-indigo-300 text-sm font-medium hover:bg-indigo-500 hover:text-white transition-colors shadow-sm">
                            + Add Personnel
                        </Link>
                        <Link href="/admin/news" className="block w-full text-left bg-white dark:bg-slate-800 p-3 rounded-lg border border-indigo-100 dark:border-slate-700 text-indigo-700 dark:text-indigo-300 text-sm font-medium hover:bg-indigo-500 hover:text-white transition-colors shadow-sm">
                            Manage Content
                        </Link>
                    </div>

                    <div className="mt-6 pt-6 border-t border-indigo-200 dark:border-slate-800">
                        <p className="text-xs text-indigo-600 dark:text-indigo-400 mb-2">Need help?</p>
                        <Link href="/admin/guide" className="text-sm font-semibold text-indigo-800 dark:text-indigo-300 hover:underline">Read Admin Guide →</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
