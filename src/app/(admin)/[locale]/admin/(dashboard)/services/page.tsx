"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExternalLinkAlt } from "@fortawesome/free-solid-svg-icons";
import { ActionButtons } from "@/components/admin/common/ActionButtons";
import { AddButton } from "@/components/admin/common/AddButton";
import Swal from "sweetalert2";
import Loading from "@/components/common/Loading";
import { useTranslations } from "next-intl";

type Service = {
    _id: string;
    title: {
        th: string;
        en: string;
    };
    icon: string;
    link?: string;
    category: string;
};

export default function ServicesListPage() {
    const t = useTranslations("Admin.pages.services");
    const [services, setServices] = useState<Service[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchServices = async () => {
        try {
            const res = await fetch("/api/admin/services");
            if (!res.ok) throw new Error("Failed to fetch");
            const data = await res.json();
            setServices(data);
        } catch (error) {
            console.error(error);
            Swal.fire("Error", "Failed to load services", "error");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchServices();
    }, []);

    const handleDelete = async (id: string) => {
        const result = await Swal.fire({
            title: "Are you sure?",
            text: "You won't be able to revert this!",
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

                const res = await fetch(`/api/admin/services/${id}`, {
                    method: "DELETE",
                    headers: {
                        "x-csrf-token": csrfToken || "",
                    },
                });

                if (res.ok) {
                    Swal.fire("Deleted!", "Service has been deleted.", "success");
                    fetchServices();
                } else {
                    throw new Error("Failed to delete");
                }
            } catch (error) {
                console.error(error);
                Swal.fire("Error", "Failed to delete service", "error");
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
                    href="/admin/services/create"
                    label={t("add")}
                />
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border dark:border-slate-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-800 border-b dark:border-slate-700 text-slate-600 dark:text-slate-200 text-sm uppercase tracking-wider">
                                <th className="p-4 font-semibold whitespace-nowrap">Icon</th>
                                <th className="p-4 font-semibold whitespace-nowrap">Title</th>
                                <th className="p-4 font-semibold whitespace-nowrap">Category</th>
                                <th className="p-4 font-semibold whitespace-nowrap">Link</th>
                                <th className="p-4 font-semibold text-right whitespace-nowrap">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {services.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-10 text-center text-slate-400">No services found.</td>
                                </tr>
                            ) : services.map((item) => (
                                <tr key={item._id} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                    <td className="p-4 w-16">
                                        <div className="w-10 h-10 relative bg-slate-100 dark:bg-slate-800 rounded flex items-center justify-center overflow-hidden border dark:border-slate-700">
                                            {item.icon ? (
                                                <Image src={item.icon} alt={item.title.th} fill className="object-contain p-1" />
                                            ) : (
                                                <div className="text-xs text-slate-400">?</div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-4 font-medium text-slate-900 dark:text-slate-100">
                                        <div>{item.title.th}</div>
                                        <div className="text-xs text-slate-400 italic">{item.title.en}</div>
                                    </td>
                                    <td className="p-4 text-sm text-slate-600 dark:text-slate-300 whitespace-nowrap">
                                        <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-xs font-medium border border-slate-200 dark:border-slate-700 capitalize">
                                            {item.category.replace("-", " ")}
                                        </span>
                                    </td>
                                    <td className="p-4 text-sm max-w-[200px] truncate">
                                        {item.link ? (
                                            <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1">
                                                <FontAwesomeIcon icon={faExternalLinkAlt} className="w-3 h-3" />
                                                {item.link}
                                            </a>
                                        ) : (
                                            <span className="text-slate-300">No link</span>
                                        )}
                                    </td>
                                    <td className="p-4 text-right whitespace-nowrap">
                                        <ActionButtons
                                            editUrl={`/admin/services/${item._id}`}
                                            onDelete={() => handleDelete(item._id)}
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
