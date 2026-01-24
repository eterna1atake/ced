"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShieldHalved, faDesktop, faMobileScreen, faCircleCheck, faCircleXmark, faCircleExclamation, faClockRotateLeft, faGear, faUserShield, faList } from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState, useCallback } from "react";

import Loading from "@/components/common/Loading";
import { useTranslations } from "next-intl";

// Types
type LoginLog = {
    _id: string;
    email: string;
    ip: string;
    userAgent?: string;
    status: "SUCCESS" | "FAILED" | "BLOCKED";
    reason?: string;
    timestamp: string;
};

type SystemLog = {
    _id: string;
    action: string;
    actorEmail: string;
    details?: string;
    ip: string;
    userAgent?: string;
    targetId?: string;
    timestamp: string;
};

export default function AuditLogsPage() {
    const [activeTab, setActiveTab] = useState<"login" | "system">("login");
    const [loginLogs, setLoginLogs] = useState<LoginLog[]>([]);
    const [systemLogs, setSystemLogs] = useState<SystemLog[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchLogs = useCallback(async () => {
        try {
            // Fetch based on active tab ONLY to save bandwidth, or fetch both? 
            // Let's fetch the active one.
            const res = await fetch(`/api/admin/audit-logs?type=${activeTab}`);
            if (res.ok) {
                const data = await res.json();
                if (activeTab === "login") {
                    setLoginLogs(data.logs);
                } else {
                    setSystemLogs(data.logs);
                }
            }
        } catch (error) {
            console.error("Failed to fetch logs", error);
        } finally {
            setLoading(false);
        }
    }, [activeTab]);

    useEffect(() => {
        setLoading(true); // Show loading when tab switches
        fetchLogs();

        const interval = setInterval(() => {
            fetchLogs();
        }, 5000); // Poll every 5 seconds

        return () => clearInterval(interval);
    }, [fetchLogs]);

    // Format User Agent
    const getDeviceName = (ua?: string) => {
        if (!ua) return "Unknown";
        if (ua.includes("iPhone")) return "iPhone";
        if (ua.includes("iPad")) return "iPad";
        if (ua.includes("Android")) return "Android";
        if (ua.includes("Macintosh")) return "Mac";
        if (ua.includes("Windows")) return "Windows";
        return "Desktop";
    };

    // Helper for Status Styles (Login)
    const getStatusStyle = (status: string) => {
        switch (status) {
            case "SUCCESS": return "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800";
            case "BLOCKED": return "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800";
            case "FAILED": return "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800";
            default: return "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700";
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "SUCCESS": return faCircleCheck;
            case "BLOCKED": return faCircleExclamation;
            case "FAILED": return faCircleXmark;
            default: return faShieldHalved;
        }
    };

    const t = useTranslations("Admin.pages.auditLogs");

    if (loading) return (
        <div className="flex h-[50vh] items-center justify-center">
            <Loading />
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{t("title")}</h1>
                    <p className="text-slate-500 dark:text-slate-400">{t("description")}</p>
                </div>
                <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                    <button
                        onClick={() => setActiveTab("login")}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === "login" ? "bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 shadow-sm" : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"}`}
                    >
                        <FontAwesomeIcon icon={faUserShield} className="mr-2" />
                        Login Access
                    </button>
                    <button
                        onClick={() => setActiveTab("system")}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === "system" ? "bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 shadow-sm" : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"}`}
                    >
                        <FontAwesomeIcon icon={faGear} className="mr-2" />
                        System Events
                    </button>
                    <button onClick={fetchLogs} className="ml-2 px-3 py-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors border-l border-slate-200 dark:border-slate-700" title="Refresh Logs">
                        <FontAwesomeIcon icon={faClockRotateLeft} />
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border dark:border-slate-800 overflow-hidden">
                <div className="overflow-x-auto">
                    {activeTab === "login" ? (
                        <table className="min-w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-800 border-b dark:border-slate-700 text-slate-600 dark:text-slate-200 text-sm uppercase tracking-wider">
                                    <th className="p-4 font-semibold whitespace-nowrap">User</th>
                                    <th className="p-4 font-semibold whitespace-nowrap">Status</th>
                                    <th className="p-4 font-semibold whitespace-nowrap">IP Address</th>
                                    <th className="p-4 font-semibold whitespace-nowrap">Device</th>
                                    <th className="p-4 font-semibold whitespace-nowrap text-right">Time</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {loading && loginLogs.length === 0 ? (
                                    <tr><td colSpan={5} className="p-8 text-center text-slate-400">Loading logs...</td></tr>
                                ) : loginLogs.map((log) => (
                                    <tr key={log._id} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                        <td className="p-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400">
                                                    <FontAwesomeIcon icon={faShieldHalved} className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <div className="font-medium text-slate-900 dark:text-slate-100">{log.email}</div>
                                                    {log.reason && (
                                                        <div className="text-xs text-slate-500 dark:text-slate-400 max-w-[200px] truncate" title={log.reason}>{log.reason}</div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusStyle(log.status)}`}>
                                                <FontAwesomeIcon icon={getStatusIcon(log.status)} />
                                                {log.status}
                                            </span>
                                        </td>
                                        <td className="p-4 font-mono text-sm text-slate-600 dark:text-slate-300">{log.ip}</td>
                                        <td className="p-4 text-sm text-slate-600 dark:text-slate-300">
                                            <span className="flex items-center gap-2">
                                                <FontAwesomeIcon icon={log.userAgent?.includes('Mobile') ? faMobileScreen : faDesktop} className="text-slate-400" />
                                                {getDeviceName(log.userAgent)}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap">
                                            {new Date(log.timestamp).toLocaleString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit', day: 'numeric', month: 'short' })}
                                        </td>
                                    </tr>
                                ))}
                                {!loading && loginLogs.length === 0 && (
                                    <tr><td colSpan={5} className="p-8 text-center text-slate-400">No login logs found.</td></tr>
                                )}
                            </tbody>
                        </table>
                    ) : (
                        <table className="min-w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-800 border-b dark:border-slate-700 text-slate-600 dark:text-slate-200 text-sm uppercase tracking-wider">
                                    <th className="p-4 font-semibold whitespace-nowrap">Action</th>
                                    <th className="p-4 font-semibold whitespace-nowrap">Actor</th>
                                    <th className="p-4 font-semibold whitespace-nowrap">Details</th>
                                    <th className="p-4 font-semibold whitespace-nowrap">IP / Device</th>
                                    <th className="p-4 font-semibold whitespace-nowrap text-right">Time</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {loading && systemLogs.length === 0 ? (
                                    <tr><td colSpan={5} className="p-8 text-center text-slate-400">Loading logs...</td></tr>
                                ) : systemLogs.map((log) => (
                                    <tr key={log._id} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                        <td className="p-4 whitespace-nowrap">
                                            <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-800 text-xs font-bold uppercase">
                                                <FontAwesomeIcon icon={faList} />
                                                {log.action.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="p-4 whitespace-nowrap font-medium text-slate-900 dark:text-slate-100">
                                            {log.actorEmail}
                                        </td>
                                        <td className="p-4 text-sm text-slate-600 dark:text-slate-300 max-w-xs truncate">
                                            {log.details || "-"}
                                            {log.targetId && <span className="text-xs text-slate-400 ml-1">(ID: {log.targetId})</span>}
                                        </td>
                                        <td className="p-4 text-sm text-slate-600 dark:text-slate-300">
                                            <div className="flex flex-col text-xs">
                                                <span className="font-mono">{log.ip}</span>
                                                <span className="text-slate-400">{getDeviceName(log.userAgent)}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-right text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap">
                                            {new Date(log.timestamp).toLocaleString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit', day: 'numeric', month: 'short' })}
                                        </td>
                                    </tr>
                                ))}
                                {!loading && systemLogs.length === 0 && (
                                    <tr><td colSpan={5} className="p-8 text-center text-slate-400">No system logs found.</td></tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}
