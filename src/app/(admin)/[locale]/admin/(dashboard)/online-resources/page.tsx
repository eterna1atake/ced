"use client";

import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExternalLinkAlt } from "@fortawesome/free-solid-svg-icons";
import { ActionButtons } from "@/components/admin/common/ActionButtons";
import { AddButton } from "@/components/admin/common/AddButton";
import Swal from "sweetalert2";
import Loading from "@/components/common/Loading";
import { useTranslations } from "next-intl";

interface OnlineResourceItem {
    _id: string;
    key: string;
    link: string;
    iconName: string;
    imagePath?: string;
    colorClass: string;
    categoryKey: string;
    th: { title: string; description: string };
    en: { title: string; description: string };
}

export default function ResourcesListPage() {
    const t = useTranslations("Admin.pages.onlineResources");
    const [resources, setResources] = useState<OnlineResourceItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchResources = async () => {
        try {
            const res = await fetch("/api/admin/online-resources");
            if (!res.ok) throw new Error("Failed to fetch");
            const data = await res.json();
            setResources(data);
        } catch (error) {
            console.error("Error fetching resources:", error);
            Swal.fire("Error!", "Failed to load resources.", "error");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchResources();
    }, []);

    const handleDelete = async (id: string, title: string) => {
        const result = await Swal.fire({
            title: "Are you sure?",
            text: `You are about to delete "${title}". This action cannot be undone.`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes, delete it!",
        });

        if (result.isConfirmed) {
            try {
                // [Fix] Add CSRF Token to headers
                const csrfToken = document.cookie
                    .split("; ")
                    .find((row) => row.startsWith("ced_csrf_token="))
                    ?.split("=")[1];

                const res = await fetch(`/api/admin/online-resources/${id}`, {
                    method: "DELETE",
                    headers: {
                        "x-csrf-token": csrfToken || "",
                    },
                });

                if (res.ok) {
                    Swal.fire("Deleted!", "Resource has been deleted.", "success");
                    setResources(prev => prev.filter(item => item._id !== id));
                } else {
                    throw new Error("Failed to delete");
                }
            } catch (error) {
                console.error("Delete error:", error);
                Swal.fire("Error!", "Failed to delete record.", "error");
            }
        }
    };

    if (isLoading) return (
        <div className="flex h-[50vh] items-center justify-center">
            <Loading />
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{t("title")}</h1>
                    <p className="text-slate-500 dark:text-slate-400">{t("description")}</p>
                </div>
                <AddButton
                    href="/admin/online-resources/create"
                    label={t("add")}
                />
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-800 border-b dark:border-slate-700 text-slate-600 dark:text-slate-200 text-sm uppercase tracking-wider font-bold">
                                <th className="p-4">Title</th>
                                <th className="p-4">Category</th>
                                <th className="p-4">Link</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {resources.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="p-12 text-center text-slate-400 italic">
                                        No resources found.
                                    </td>
                                </tr>
                            ) : resources.map((item) => (
                                <tr key={item._id} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group">
                                    <td className="p-4">
                                        <div className="font-bold text-slate-900 dark:text-slate-100">{item.en.title}</div>
                                        <div className="text-xs text-slate-500 dark:text-slate-400">{item.th.title}</div>
                                        <div className="text-[10px] text-slate-300 dark:text-slate-600 mt-1 uppercase tracking-tighter">Key: {item.key}</div>
                                    </td>
                                    <td className="p-4 whitespace-nowrap">
                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${item.categoryKey === "learning_resources"
                                            ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 border border-blue-100 dark:border-blue-800"
                                            : "bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300 border border-purple-100 dark:border-purple-800"
                                            }`}>
                                            {item.categoryKey.replace("_", " ")}
                                        </span>
                                    </td>
                                    <td className="p-4 text-sm max-w-[200px] truncate font-medium">
                                        <a
                                            href={item.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-500 hover:text-blue-700 flex items-center gap-1"
                                        >
                                            <span className="truncate">{item.link}</span>
                                            <FontAwesomeIcon icon={faExternalLinkAlt} className="text-[10px]" />
                                        </a>
                                    </td>
                                    <td className="p-4 text-right whitespace-nowrap">
                                        <ActionButtons
                                            editUrl={`/admin/online-resources/${item._id}`}
                                            onDelete={() => handleDelete(item._id, item.en.title)}
                                        />
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
