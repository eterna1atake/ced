
"use client";
import { getCsrfToken } from "@/utils/cookie";

import React from "react";
import { useRouter } from "@/i18n/navigation";
import AwardsForm from "@/components/admin/awards/AwardsForm";
import type { Award } from "@/types/award";
import { useTranslations } from "next-intl";

type Props = {
    initialData: Award;
};

export default function EditAwardClient({ initialData }: Props) {
    const tAlert = useTranslations("Admin.alerts");
    const router = useRouter();
    const t = useTranslations("Admin.pages.awards");
    const [isSaving, setIsSaving] = React.useState(false);

    const handleUpdate = async (data: Award) => {
        setIsSaving(true);
        try {
            const csrfToken = getCsrfToken();

            // Use MongoDB _id if present, otherwise fallback to id
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const awardId = (initialData as any)._id || initialData.id;

            const res = await fetch(`/cedweb/api/ced-portal/awards/${awardId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "x-csrf-token": csrfToken || "",
                },
                body: JSON.stringify(data),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || "Failed to update award");
            }

            const Swal = (await import("sweetalert2")).default;
            await Swal.fire({
                title: tAlert("success"),
                text: tAlert("updatedText"),
                icon: "success",
                timer: 1500,
                showConfirmButton: false,
            });

            router.push("/ced-portal/awards");
            router.refresh();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            console.error("Update error:", error);
            const Swal = (await import("sweetalert2")).default;
            Swal.fire({
                title: tAlert("error"),
                text: error.message || tAlert("updateFailed"),
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
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{t("editTitle")}</h1>
                    <p className="text-slate-500 dark:text-slate-400">{t("editSubtitle")}</p>
                </div>
            </div>
            <AwardsForm initialData={initialData} onSubmit={handleUpdate} isLoading={isSaving} />
        </div>
    );
}