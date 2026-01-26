"use client";

import React, { useEffect, useState } from "react";
import { ActionButtons } from "@/components/admin/common/ActionButtons";
import { AddButton } from "@/components/admin/common/AddButton";
import Image from "next/image";
import { useTranslations } from "next-intl";
import type { Award } from "@/types/award";

export default function AwardsListPage() {
    const t = useTranslations("Admin.pages.awards");
    const [awards, setAwards] = useState<Award[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchAwards = async () => {
        try {
            const res = await fetch("/api/admin/awards");
            if (!res.ok) throw new Error("Failed to fetch awards");
            const data = await res.json();
            // Sort by year descending (latest year first)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const sortedData = data.sort((a: any, b: any) => parseInt(b.year) - parseInt(a.year));
            setAwards(sortedData);
        } catch (error) {
            console.error("Fetch error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAwards();
    }, []);

    const handleDelete = async (id: string) => {
        const Swal = (await import("sweetalert2")).default;
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
                const csrfToken = document.cookie
                    .split("; ")
                    .find((row) => row.startsWith("ced_csrf_token="))
                    ?.split("=")[1];

                const res = await fetch(`/api/admin/awards/${id}`, {
                    method: "DELETE",
                    headers: {
                        "x-csrf-token": csrfToken || "",
                    }
                });

                if (!res.ok) throw new Error("Delete failed");

                await Swal.fire("Deleted!", "Award has been deleted.", "success");
                fetchAwards();
            } catch (error) {
                console.error("Delete error:", error);
                Swal.fire("Error", "Could not delete award.", "error");
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
                <div className="flex gap-2">

                    <AddButton
                        href="/admin/awards/create"
                        label={t("add")}
                    />
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border dark:border-slate-800 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 dark:bg-slate-800 border-b dark:border-slate-700 text-slate-600 dark:text-slate-200 text-sm uppercase tracking-wider">
                            <th className="p-4 font-semibold">Image</th>
                            <th className="p-4 font-semibold">Award / Project</th>
                            <th className="p-4 font-semibold">Year</th>
                            <th className="p-4 font-semibold">Team</th>
                            <th className="p-4 font-semibold text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {isLoading ? (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-slate-500">Loading awards...</td>
                            </tr>
                        ) : awards.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-slate-500">No awards found.</td>
                            </tr>
                        ) : (
                            awards.map((item) => {
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                const id = (item as any)._id || item.id;
                                return (
                                    <tr key={id} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                        <td className="p-4 w-24">
                                            <div className="w-16 h-10 relative rounded overflow-hidden bg-slate-100 dark:bg-slate-700">
                                                {item.image ? (
                                                    <Image src={item.image} alt={item.title.th} fill className="object-cover" />
                                                ) : (
                                                    <div className="h-full flex items-center justify-center text-xs text-slate-400">No Img</div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="font-medium text-slate-900 dark:text-slate-100 line-clamp-1">{item.title.th}</div>
                                            <div className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">{item.project.th}</div>
                                        </td>
                                        <td className="p-4 text-sm text-slate-600 dark:text-slate-300">
                                            {item.year}
                                        </td>
                                        <td className="p-4 text-xs text-slate-500 dark:text-slate-400 max-w-xs truncate">
                                            {item.team.map(t => t.th).join(", ")}
                                        </td>
                                        <td className="p-4 text-right whitespace-nowrap">
                                            <ActionButtons
                                                editUrl={`/admin/awards/${id}`}
                                                onDelete={() => handleDelete(id)}
                                            />
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
