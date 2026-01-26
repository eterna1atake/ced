"use client";

import { ActionButtons } from "@/components/admin/common/ActionButtons";
import { AddButton } from "@/components/admin/common/AddButton";
import Image from "next/image";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import type { IPersonnel } from "@/collections/Personnel";
import Loading from "../loading";
import { useTranslations } from "next-intl";

// Fallback interface to match what's used in the component if the model import is tricky or we want to be explicit here
// But actually we should use the type from the model we created if possible, or define a local one matching the API response.
// The IPersonnel from model is good.

export default function PersonnelListPage() {
    const t = useTranslations("Admin.pages.personnel");
    const [personnel, setPersonnel] = useState<IPersonnel[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchPersonnel = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/admin/personnel");
            if (!res.ok) throw new Error("Failed to fetch personnel");
            const data = await res.json();
            // Helper to determine position weight (lower is higher priority)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const getWeight = (p: any) => {
                const th = (p.position?.th || "").trim();
                const en = (p.position?.en || "").toLowerCase();

                // 1. Check Strict Head (Must start with 'หัวหน้าภาค' or be 'head' without deputy terms)
                // Note: "รองหัวหน้า" starts with "รอง", so it won't match "startsWith('หัวหน้าภาค')"
                const isHead = th.startsWith("หัวหน้าภาค") || (en.includes("head") && !en.includes("associate") && !en.includes("deputy") && !en.includes("vice"));
                if (isHead) return 1;

                // 2. Check Deputy / Associate (Starts with 'รอง' or contains deputy terms)
                const isDeputy = th.startsWith("รอง") || en.includes("associate") || en.includes("deputy") || en.includes("vice");
                if (isDeputy) return 2;

                return 3; // Others
            };

            // Sort: Priority Weight -> Alphabetical (TH Name)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const sortedData = data.sort((a: any, b: any) => {
                const weightA = getWeight(a);
                const weightB = getWeight(b);
                if (weightA !== weightB) return weightA - weightB;
                return (a.name?.th || "").localeCompare(b.name?.th || "");
            });

            setPersonnel(sortedData);
        } catch (error) {
            console.error(error);
            Swal.fire("Error", "Failed to load personnel data", "error");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPersonnel();
    }, []);

    const handleDelete = async (id: string) => {
        const result = await Swal.fire({
            title: "Are you sure?",
            text: "You won't be able to revert this!",
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

                const res = await fetch(`/api/admin/personnel/${id}`, {
                    method: "DELETE",
                    headers: {
                        "x-csrf-token": csrfToken || "",
                    },
                });

                if (!res.ok) throw new Error("Failed to delete");

                Swal.fire("Deleted!", "Personnel has been deleted.", "success");
                fetchPersonnel(); // Refresh list
            } catch (error) {
                console.error(error);
                Swal.fire("Error", "Failed to delete personnel", "error");
            }
        }
    };

    if (isLoading) {
        return <div className="flex h-[50vh] items-center justify-center">
            <Loading />
        </div>
    }



    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{t("title")}</h1>
                    <p className="text-slate-500 dark:text-slate-400">{t("description")}</p>
                </div>
                <AddButton
                    href="/admin/personnel/create"
                    label={t("add")}
                />
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border dark:border-slate-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-800 border-b dark:border-slate-700 text-slate-600 dark:text-slate-200 text-sm uppercase tracking-wider">
                                <th className="p-4 font-semibold whitespace-nowrap">Profile</th>
                                <th className="p-4 font-semibold whitespace-nowrap">Name / Position</th>
                                <th className="p-4 font-semibold whitespace-nowrap">Contact</th>
                                <th className="p-4 font-semibold text-right whitespace-nowrap">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {personnel.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="p-8 text-center text-slate-400">
                                        No personnel found. Click &quot;Add Person&quot; to create one.
                                    </td>
                                </tr>
                            ) : (
                                personnel.map((person) => (
                                    <tr key={person._id} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                        <td className="p-4 w-16">
                                            <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden relative">
                                                {person.imageSrc ? (
                                                    <Image src={person.imageSrc} alt={person.name.th} fill className="object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">?</div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-4 whitespace-nowrap">
                                            <div className="font-medium text-slate-900 dark:text-slate-100">{person.name.th}</div>
                                            <div className="text-sm text-slate-500 dark:text-slate-400">{person.position.th}</div>
                                        </td>
                                        <td className="p-4 text-sm text-slate-600 dark:text-slate-300 whitespace-nowrap">
                                            <div>{person.email}</div>
                                            <div className="text-xs text-slate-400">{person.phone}</div>
                                        </td>
                                        <td className="p-4 text-right whitespace-nowrap">
                                            <ActionButtons
                                                editUrl={`/admin/personnel/${person._id}`}
                                                onDelete={() => handleDelete(person._id!)}
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
