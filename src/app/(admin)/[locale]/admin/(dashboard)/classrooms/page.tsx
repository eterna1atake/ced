
"use client";

import Image from "next/image";

import { AddButton } from "@/components/admin/common/AddButton";
import { ActionButtons } from "@/components/admin/common/ActionButtons";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import type { Classroom } from "@/types/classroom";

import { useTranslations } from "next-intl";

import { useLocale } from "next-intl";

export default function ClassroomsListPage() {
    const t = useTranslations("Admin.pages.classrooms");
    const locale = useLocale();

    // Helper to get localized string safely
    const getLocalized = (obj: { en: string; th: string } | string | undefined | null) => {
        if (!obj) return "";
        if (typeof obj === 'string') return obj;
        return obj[locale as 'en' | 'th'] || obj['en'] || "";
    };

    const [classrooms, setClassrooms] = useState<Classroom[]>([]);
    // const [_isLoading, setIsLoading] = useState(true); // Removed unused
    const [activeFilter, setActiveFilter] = useState<'all' | '44' | '52'>('all');

    useEffect(() => {
        fetchClassrooms();
    }, []);

    const fetchClassrooms = async () => {
        try {
            const res = await fetch('/api/admin/classrooms');
            if (res.ok) {
                const data = await res.json();
                setClassrooms(data);
            }
        } catch (error) {
            console.error("Failed to fetch classrooms", error);
            Swal.fire("Error", "Failed to load classrooms", "error");
        } finally {
            // setIsLoading(false);
        }
    };

    const filteredClassrooms = classrooms.filter(room => {
        if (activeFilter === 'all') return true;
        // Determine building from ID (e.g. 52-205 -> 52)
        const building = room.id.split('-')[0];
        return building === activeFilter;
    });

    const handleDelete = async (id: string) => {
        const result = await Swal.fire({
            title: "Are you sure?",
            text: "This action cannot be undone!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            confirmButtonText: "Yes, delete it!"
        });

        if (result.isConfirmed) {
            try {
                const csrfToken = document.cookie
                    .split("; ")
                    .find((row) => row.startsWith("ced_csrf_token="))
                    ?.split("=")[1];

                const res = await fetch(`/api/admin/classrooms/${encodeURIComponent(id)}`, {
                    method: 'DELETE',
                    headers: {
                        'x-csrf-token': csrfToken || ""
                    }
                });

                if (res.ok) {
                    setClassrooms(prev => prev.filter(c => c.id !== id));
                    Swal.fire("Deleted!", "Classroom has been deleted.", "success");
                } else {
                    throw new Error("Failed to delete");
                }
            } catch {
                Swal.fire("Error", "Failed to delete classroom", "error");
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
                    href="/admin/classrooms/create"
                    label={t("add")}
                />
            </div>

            <div className="flex gap-2">
                <button
                    onClick={() => setActiveFilter('all')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeFilter === 'all'
                        ? 'bg-primary-main text-white shadow-sm'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                        }`}
                >
                    All Buildings
                </button>
                <button
                    onClick={() => setActiveFilter('44')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeFilter === '44'
                        ? 'bg-primary-main text-white shadow-sm'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                        }`}
                >
                    Building 44
                </button>
                <button
                    onClick={() => setActiveFilter('52')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeFilter === '52'
                        ? 'bg-primary-main text-white shadow-sm'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                        }`}
                >
                    Building 52
                </button>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border dark:border-slate-800 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 dark:bg-slate-800 border-b dark:border-slate-700 text-slate-600 dark:text-slate-200 text-sm uppercase tracking-wider">
                            <th className="p-4 font-semibold">Room Info</th>
                            <th className="p-4 font-semibold">Building</th>
                            <th className="p-4 font-semibold">Capacity</th>
                            <th className="p-4 font-semibold text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {filteredClassrooms.map((item) => (
                            <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                <td className="p-4 flex gap-3 items-center">
                                    <div className="w-16 h-10 relative bg-slate-100 dark:bg-slate-800 rounded overflow-hidden flex-shrink-0">
                                        <Image src={item.image} alt={getLocalized(item.name)} fill className="object-cover" />
                                    </div>
                                    <div>
                                        <div className="font-medium text-slate-900 dark:text-slate-100">{getLocalized(item.name)}</div>
                                        <div className="text-xs text-slate-500 dark:text-slate-400">{item.id}</div>
                                    </div>
                                </td>
                                <td className="p-4 text-sm text-slate-600 dark:text-slate-300">
                                    Building {item.building}
                                </td>
                                <td className="p-4 text-sm text-slate-600 dark:text-slate-300">
                                    {item.capacity}
                                </td>
                                <td className="p-4 text-right">
                                    <ActionButtons
                                        editUrl={`/admin/classrooms/${encodeURIComponent(item.id)}`}
                                        onDelete={() => handleDelete(item.id)}
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
