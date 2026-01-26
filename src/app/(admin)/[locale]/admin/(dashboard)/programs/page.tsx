
"use client";

import { useState, useEffect } from "react";
import { ActionButtons } from "@/components/admin/common/ActionButtons";
import { AddButton } from "@/components/admin/common/AddButton";
import Image from "next/image";
import { useTranslations } from "next-intl";
import Swal from "sweetalert2";
import type { ProgramItem } from "@/types/program";

export default function ProgramsListPage() {
    const t = useTranslations("Admin.pages.programs");

    const [programs, setPrograms] = useState<ProgramItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchPrograms = async () => {
        try {
            const res = await fetch("/api/admin/programs");
            if (res.ok) {
                const data = await res.json();

                // Sort by Level: Bachelor > Master > Doctoral
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const sortedData = data.sort((a: any, b: any) => {
                    const levelOrder: Record<string, number> = {
                        "bachelor": 1,
                        "master": 2,
                        "doctoral": 3
                    };
                    const levelA = a.level?.toLowerCase() || "";
                    const levelB = b.level?.toLowerCase() || "";

                    const weightA = levelOrder[levelA] || 99;
                    const weightB = levelOrder[levelB] || 99;

                    if (weightA !== weightB) return weightA - weightB;
                    // Fallback to title if same level
                    return (a.en?.title || "").localeCompare(b.en?.title || "");
                });

                setPrograms(sortedData);
            }
        } catch (error) {
            console.error("Failed to fetch programs:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPrograms();
    }, []);

    const handleDelete = async (id: string, name: string) => {
        const result = await Swal.fire({
            title: "Are you sure?",
            text: `You are about to delete "${name}". This action cannot be undone!`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes, delete it!"
        });

        if (result.isConfirmed) {
            try {
                const csrfToken = document.cookie
                    .split("; ")
                    .find((row) => row.startsWith("ced_csrf_token="))
                    ?.split("=")[1];

                const res = await fetch(`/api/admin/programs/${id}/general`, {
                    method: "DELETE",
                    headers: {
                        "x-csrf-token": csrfToken || ""
                    }
                });

                if (res.ok) {
                    await Swal.fire("Deleted!", "Program has been deleted.", "success");
                    fetchPrograms();
                } else {
                    const data = await res.json();
                    throw new Error(data.message || "Failed to delete");
                }
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } catch (error: any) {
                Swal.fire("Error", error.message || "Failed to delete program", "error");
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{t("title")}</h1>
                    <p className="text-slate-500 dark:text-slate-400">{t("description")}</p>
                </div>
                <AddButton
                    label={t("add")}
                    href={`/admin/programs/new`}
                />
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border dark:border-slate-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-800 border-b dark:border-slate-700 text-slate-600 dark:text-slate-200 text-sm uppercase tracking-wider">
                                <th className="p-4 font-semibold whitespace-nowrap">Program</th>
                                <th className="p-4 font-semibold whitespace-nowrap">Level</th>
                                <th className="p-4 font-semibold whitespace-nowrap">Degree</th>
                                <th className="p-4 font-semibold text-right whitespace-nowrap">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={4} className="p-8 text-center text-slate-500">Loading programs...</td>
                                </tr>
                            ) : programs.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="p-8 text-center text-slate-500">No programs found.</td>
                                </tr>
                            ) : (
                                programs.map((item, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                        <td className="p-4 flex gap-3 items-center min-w-[250px]">
                                            <div className="w-16 h-10 relative bg-slate-100 dark:bg-slate-800 rounded overflow-hidden flex-shrink-0">
                                                <Image src={item.imageSrc} alt={item.imageAlt} fill className="object-cover" />
                                            </div>
                                            <div>
                                                <div className="font-medium text-slate-900 dark:text-slate-100">{item.en?.title || item.id}</div>
                                                <div className="text-xs text-slate-500 dark:text-slate-400">{item.th?.title}</div>
                                            </div>
                                        </td>
                                        <td className="p-4 text-sm text-slate-600 dark:text-slate-300 capitalize whitespace-nowrap">
                                            {item.level}
                                        </td>
                                        <td className="p-4 text-xs text-slate-500 dark:text-slate-400 max-w-[250px] min-w-[200px]">
                                            {item.en?.degree}
                                        </td>
                                        <td className="p-4 text-right whitespace-nowrap">
                                            <ActionButtons
                                                editUrl={`/admin/programs/${item.id}`}
                                                onDelete={() => handleDelete(item.id, item.en?.title || item.id)}
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
