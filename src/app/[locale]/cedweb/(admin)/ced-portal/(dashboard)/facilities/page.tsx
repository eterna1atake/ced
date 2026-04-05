
"use client";
import { getCsrfToken } from "@/utils/cookie";

import Image from "next/image";

import { AddButton } from "@/components/admin/common/AddButton";
import { ActionButtons } from "@/components/admin/common/ActionButtons";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import type { Facility } from "@/types/facility";

import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import Pagination from "@/components/common/Pagination";
import Loading from "@/components/common/Loading";

export default function FacilitiesListPage() {
    const tAlert = useTranslations("Admin.alerts");
    const t = useTranslations("Admin.pages.facilities");
    const locale = useLocale();

    // Helper to get localized string safely
    const getLocalized = (obj: { en: string; th: string } | string | undefined | null) => {
        if (!obj) return "";
        if (typeof obj === 'string') return obj;
        return obj[locale as 'en' | 'th'] || obj['en'] || "";
    };

    const [facilities, setFacilities] = useState<Facility[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState<'all' | '44' | '52'>('all');
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;

    useEffect(() => {
        fetchFacilities();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchFacilities = async () => {
        try {
            const res = await fetch('/cedweb/api/ced-portal/facilities');
            if (res.ok) {
                const data = await res.json();
                setFacilities(data);
            }
        } catch (error) {
            console.error("Failed to fetch facilities", error);
            Swal.fire(tAlert("error"), tAlert("failedToLoad"), "error");
        } finally {
            setIsLoading(false);
        }
    };

    const filteredFacilities = facilities.filter(room => {
        if (activeFilter === 'all') return true;
        // Determine building from ID (e.g. 52-205 -> 52)
        const building = room.id.split('-')[0];
        return building === activeFilter;
    });

    const totalPages = Math.ceil(filteredFacilities.length / ITEMS_PER_PAGE);
    const paginatedFacilities = filteredFacilities.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const handleDelete = async (id: string) => {
        const result = await Swal.fire({
            title: tAlert("deleteConfirmTitle"),
            text: tAlert("deleteConfirmText"),
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            confirmButtonText: tAlert("deleteConfirmButton")
        });

        if (result.isConfirmed) {
            try {
                const csrfToken = getCsrfToken();

                const res = await fetch(`/api/ced-portal/facilities/${encodeURIComponent(id)}`, {
                    method: 'DELETE',
                    headers: {
                        'x-csrf-token': csrfToken || ""
                    }
                });

                if (res.ok) {
                    setFacilities(prev => prev.filter(c => c.id !== id));
                    Swal.fire({ title: tAlert("deleted"), text: tAlert("deletedText"), icon: "success" });
                } else {
                    throw new Error("Failed to delete");
                }
            } catch {
                Swal.fire(tAlert("error"), tAlert("deleteFailed"), "error");
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
                    href="/ced-portal/facilities/create"
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
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-800 border-b dark:border-slate-700 text-slate-600 dark:text-slate-200 text-sm uppercase tracking-wider">
                                <th className="p-4 font-semibold whitespace-nowrap">Room Info</th>
                                <th className="p-4 font-semibold whitespace-nowrap">Building</th>
                                <th className="p-4 font-semibold whitespace-nowrap">Capacity</th>
                                <th className="p-4 font-semibold text-right whitespace-nowrap">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={4} className="p-10 text-center">
                                        <div className="flex justify-center items-center gap-2 text-slate-500">
                                            <Loading />
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredFacilities.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="p-10 text-center text-slate-400">No facilities found.</td>
                                </tr>
                            ) : paginatedFacilities.map((item) => (
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
                                        {getLocalized(item.capacity)}
                                    </td>
                                    <td className="p-4 text-right">
                                        <ActionButtons
                                            editUrl={`/ced-portal/facilities/${encodeURIComponent(item.id)}`}
                                            onDelete={() => handleDelete(item.id)}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {totalPages > 1 && (
                <div className="mt-6">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
                </div>
            )}
        </div>
    );
}