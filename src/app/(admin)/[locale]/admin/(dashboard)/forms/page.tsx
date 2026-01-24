
"use client";

import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExternalLinkAlt } from "@fortawesome/free-solid-svg-icons";
import { ActionButtons } from "@/components/admin/common/ActionButtons";
import { AddButton } from "@/components/admin/common/AddButton";
import Swal from "sweetalert2";
import Loading from "@/components/common/Loading";
import { useTranslations } from "next-intl";

interface FormRequestItem {
    _id: string;
    categoryId: string;
    sectionId: string;
    url: string;
    th: { name: string };
    en: { name: string };
    createdAt: string;
}

export default function FormRequestsListPage() {
    const t = useTranslations("Admin.pages.forms");
    const [forms, setForms] = useState<FormRequestItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchForms = async () => {
        try {
            const res = await fetch("/api/admin/forms");
            if (res.ok) {
                const data = await res.json();
                setForms(data);
            }
        } catch (error) {
            console.error("Failed to fetch forms", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchForms();
    }, []);

    const handleDelete = async (id: string, name: string) => {
        const result = await Swal.fire({
            title: "Are you sure?",
            text: `You are about to delete "${name}"`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes, delete it!"
        });

        if (result.isConfirmed) {
            try {
                // [Fix] Add CSRF Token to headers
                const csrfToken = document.cookie
                    .split("; ")
                    .find((row) => row.startsWith("ced_csrf_token="))
                    ?.split("=")[1];

                const res = await fetch(`/api/admin/forms/${id}`, {
                    method: "DELETE",
                    headers: {
                        "x-csrf-token": csrfToken || "",
                    },
                });
                if (res.ok) {
                    Swal.fire("Deleted!", "Document has been deleted.", "success");
                    fetchForms();
                } else {
                    throw new Error("Failed to delete");
                }
            } catch {
                Swal.fire("Error!", "Failed to delete document.", "error");
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
                    href="/admin/forms/create"
                    label={t("add")}
                />
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border dark:border-slate-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-800 border-b dark:border-slate-700 text-slate-600 dark:text-slate-200 text-sm uppercase tracking-wider">
                                <th className="p-4 font-semibold whitespace-nowrap">Document Name</th>
                                <th className="p-4 font-semibold whitespace-nowrap">Category / Section</th>
                                <th className="p-4 font-semibold whitespace-nowrap">File</th>
                                <th className="p-4 font-semibold text-right whitespace-nowrap">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {forms.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="p-8 text-center text-slate-400">No documents found.</td>
                                </tr>
                            ) : (
                                forms.map((item) => (
                                    <tr key={item._id} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                        <td className="p-4">
                                            <div className="font-medium text-slate-900 dark:text-slate-100">{item.en.name}</div>
                                            <div className="text-xs text-slate-500 dark:text-slate-400">{item.th.name}</div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-tight">{item.categoryId}</span>
                                                <span className="text-sm text-slate-600 dark:text-slate-300">{item.sectionId}</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <a
                                                href={item.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                                            >
                                                <FontAwesomeIcon icon={faExternalLinkAlt} className="w-3 h-3" />
                                                View File
                                            </a>
                                        </td>
                                        <td className="p-4 text-right whitespace-nowrap">
                                            <ActionButtons
                                                editUrl={`/admin/forms/${item._id}`}
                                                onDelete={() => handleDelete(item._id, item.en.name)}
                                            />
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
