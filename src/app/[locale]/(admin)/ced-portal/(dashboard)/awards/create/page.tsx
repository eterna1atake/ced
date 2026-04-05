"use client";
import { getCsrfToken } from "@/utils/cookie";

import React, { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import AwardsForm from "@/components/admin/awards/AwardsForm";
import type { Award } from "@/types/award";
import { useTranslations } from "next-intl";

export default function CreateAwardPage() {
    const tAlert = useTranslations("Admin.alerts");
    const router = useRouter();
    const t = useTranslations("Admin.pages.awards");
    const [isSaving, setIsSaving] = useState(false);

    const handleCreate = async (data: Award) => {
        setIsSaving(true);
        try {
            const csrfToken = getCsrfToken();

            const res = await fetch("/api/ced-portal/awards", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-csrf-token": csrfToken || "",
                },
                body: JSON.stringify(data),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || "Failed to create award");
            }

            const Swal = (await import("sweetalert2")).default;
            await Swal.fire({
                title: tAlert("success"),
                text: tAlert("createdText"),
                icon: "success",
                timer: 1500,
                showConfirmButton: false,
            });

            router.push("/ced-portal/awards");
            router.refresh();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            console.error("Create error:", error);
            const Swal = (await import("sweetalert2")).default;
            Swal.fire({
                title: tAlert("error"),
                text: error.message || tAlert("createFailed"),
                icon: "error"
            });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <button
                        onClick={() => router.back()}
                        className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 mb-2 flex items-center gap-1"
                    >
                        ← {t("backToList")}
                    </button>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{t("createTitle")}</h1>
                    <p className="text-slate-500 dark:text-slate-400">{t("createSubtitle")}</p>
                </div>
            </div>

            <AwardsForm onSubmit={handleCreate} isLoading={isSaving} />
        </div>
    );
}