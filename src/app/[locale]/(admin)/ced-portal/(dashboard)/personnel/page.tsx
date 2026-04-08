"use client";
import { getCsrfToken } from "@/utils/cookie";

import { ActionButtons } from "@/components/admin/common/ActionButtons";
import { AddButton } from "@/components/admin/common/AddButton";
import Image from "next/image";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import type { IPersonnel } from "@/collections/Personnel";
import Loading from "../loading";
import { useTranslations } from "next-intl";
import { formatPersonnelName } from "@/utils/personnel";
import Pagination from "@/components/common/Pagination";

// Fallback interface to match what's used in the component if the model import is tricky or we want to be explicit here
// But actually we should use the type from the model we created if possible, or define a local one matching the API response.
// The IPersonnel from model is good.

import { useRouter } from "@/i18n/navigation";

export default function PersonnelListPage() {
    const tAlert = useTranslations("Admin.alerts");
    const t = useTranslations("Admin.pages.personnel");
    const router = useRouter();
    const [personnel, setPersonnel] = useState<IPersonnel[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;

    const fetchPersonnel = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/cedweb/api/ced-portal/personnel");
            if (!res.ok) throw new Error("Failed to fetch personnel");
            const data = await res.json();
            // Helper to determine position weight (lower is higher priority)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const getWeight = (p: any) => {
                const thPos = (p.position?.th || "").trim();
                const enPos = (p.position?.en || "").toLowerCase();
                const thTitle = (p.academicTitle?.th || "").trim();

                // 1. Head of Department (หัวหน้าภาค)
                if (thPos.startsWith("หัวหน้าภาค") || (enPos.includes("head") && !enPos.includes("associate") && !enPos.includes("deputy") && !enPos.includes("vice"))) {
                    return 1;
                }

                // 2. Deputy Head (รองหัวหน้า)
                if (thPos.startsWith("รองหัวหน้า") || thPos.startsWith("รอง") || enPos.includes("associate") || enPos.includes("deputy") || enPos.includes("vice")) {
                    return 2;
                }

                // 3. Lecturer (อาจารย์) - Check position or presence of academic title (Prof, Assoc Prof, etc.)
                if (thPos.includes("อาจารย์") || thTitle.length > 0) {
                    return 3;
                }

                // 4. Staff (เจ้าหน้าที่)
                if (thPos.includes("เจ้าหน้าที่") || thPos.includes("นักวิชาการ") || thPos.includes("บรรณารักษ์")) {
                    return 4;
                }

                return 5; // Others
            };

            // Sort: Priority Weight -> Alphabetical (TH Name)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const sortedData = data.sort((a: any, b: any) => {
                const weightA = getWeight(a);
                const weightB = getWeight(b);
                if (weightA !== weightB) return weightA - weightB;
                const nameA = formatPersonnelName(a, 'th');
                const nameB = formatPersonnelName(b, 'th');
                return nameA.localeCompare(nameB);
            });

            setPersonnel(sortedData);
        } catch (error) {
            console.error(error);
            Swal.fire(tAlert("error"), tAlert("failedToLoad"), "error");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPersonnel();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    const handleDelete = async (id: string) => {
        const result = await Swal.fire({
            title: tAlert("deleteConfirmTitle"),
            text: tAlert("deleteConfirmText"),
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: tAlert("deleteConfirmButton"),
        });

        if (result.isConfirmed) {
            try {
                const csrfToken = getCsrfToken();
                const res = await fetch(`/cedweb/api/ced-portal/personnel/${id}`, {
                    method: "DELETE",
                    headers: {
                        "x-csrf-token": csrfToken || "",
                    },
                });

                if (!res.ok) throw new Error("Failed to delete");

                Swal.fire({ title: tAlert("deleted"), text: tAlert("deletedText"), icon: "success" });
                fetchPersonnel();
                router.refresh();
            } catch (error) {
                console.error(error);
                Swal.fire(tAlert("error"), tAlert("deleteFailed"), "error");
            }
        }
    };

    const totalPages = Math.ceil(personnel.length / ITEMS_PER_PAGE);
    const paginatedPersonnel = personnel.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

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
                    href="/ced-portal/personnel/create"
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
                                paginatedPersonnel.map((person) => (
                                    <tr key={person._id} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                        <td className="p-4 w-16">
                                            <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden relative">
                                                {person.imageSrc ? (
                                                    <Image src={person.imageSrc} alt={formatPersonnelName(person, 'th')} fill className="object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">?</div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-4 whitespace-nowrap">
                                            <div className="font-medium text-slate-900 dark:text-slate-100">{formatPersonnelName(person, 'th')}</div>
                                            <div className="text-sm text-slate-500 dark:text-slate-400">{person.position.th}</div>
                                        </td>
                                        <td className="p-4 text-sm text-slate-600 dark:text-slate-300 whitespace-nowrap">
                                            <div>{person.email}</div>
                                            <div className="text-xs text-slate-400">{person.phone}</div>
                                        </td>
                                        <td className="p-4 text-right whitespace-nowrap">
                                            <ActionButtons
                                                editUrl={`/ced-portal/personnel/${person._id}`}
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