"use client";


import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faUserShield, faUserPen, faEllipsisVertical } from "@fortawesome/free-solid-svg-icons";

// Mock Data
const users = [
    { id: 1, name: "Admin User", email: "admin@kmutnb.ac.th", role: "Super Admin", status: "Active", lastLogin: "2 hours ago" },
    { id: 2, name: "Content Editor", email: "editor@kmutnb.ac.th", role: "Editor", status: "Active", lastLogin: "5 hours ago" },
    { id: 3, name: "Staff Member", email: "staff@kmutnb.ac.th", role: "Viewer", status: "Inactive", lastLogin: "1 week ago" },
];

import { useTranslations } from "next-intl";

export default function UsersPage() {
    const t = useTranslations("Admin.pages.users");

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{t("title")}</h1>
                    <p className="text-slate-500 dark:text-slate-400">{t("description")}</p>
                </div>
                <button className="bg-primary-main/90 hover:bg-primary-hover text-white px-4 py-2 rounded-md font-medium transition-colors flex items-center gap-2">
                    <span className="hidden md:block"><FontAwesomeIcon icon={faPlus} /> {t("add")}</span>
                    <span className="block md:hidden"><FontAwesomeIcon icon={faPlus} /></span>
                </button>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border dark:border-slate-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-800 border-b dark:border-slate-700 text-slate-600 dark:text-slate-200 text-sm uppercase tracking-wider">
                                <th className="p-4 font-semibold whitespace-nowrap">User</th>
                                <th className="p-4 font-semibold whitespace-nowrap">Role</th>
                                <th className="p-4 font-semibold whitespace-nowrap">Status</th>
                                <th className="p-4 font-semibold whitespace-nowrap">Last Login</th>
                                <th className="p-4 font-semibold text-right whitespace-nowrap">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {users.map((user) => (
                                <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                    <td className="p-4 whitespace-nowrap">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 font-bold">
                                                {user.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-medium text-slate-900 dark:text-slate-100">{user.name}</div>
                                                <div className="text-xs text-slate-500 dark:text-slate-400">{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${user.role === 'Super Admin'
                                            ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800'
                                            : 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                                            }`}>
                                            <FontAwesomeIcon icon={user.role === 'Super Admin' ? faUserShield : faUserPen} className="w-3 h-3" />
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="p-4 whitespace-nowrap">
                                        <span className={`inline-block w-2 h-2 rounded-full mr-2 ${user.status === 'Active' ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-600'}`}></span>
                                        <span className="text-sm text-slate-600 dark:text-slate-300">{user.status}</span>
                                    </td>
                                    <td className="p-4 text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap">
                                        {user.lastLogin}
                                    </td>
                                    <td className="p-4 text-right whitespace-nowrap">
                                        <button className="text-slate-400 hover:text-slate-600 p-2">
                                            <FontAwesomeIcon icon={faEllipsisVertical} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
