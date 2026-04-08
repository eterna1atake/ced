"use client";
import { getCsrfToken } from "@/utils/cookie";

import { useRouter } from "@/i18n/navigation";
import { useState } from "react";
import Swal from "sweetalert2";
import FacilityForm from "@/components/admin/facilities/FacilityForm";
import type { Facility } from "@/types/facility";
import { useTranslations } from "next-intl";

interface Props {
    initialData: Facility;
}

export default function EditFacilityClient({ initialData }: Props) {
    const tAlert = useTranslations("Admin.alerts");
    const router = useRouter();
    const t = useTranslations("Admin.pages.facilities");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (data: Facility) => {
        setIsLoading(true);
        try {

            const csrfToken = getCsrfToken();

            const res = await fetch(`/cedweb/api/ced-portal/facilities/${encodeURIComponent(data.id)}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-csrf-token': csrfToken || ""
                },
                body: JSON.stringify(data),
            });

            if (!res.ok) {
                const errorData = await res.json();
                let errorMsg = errorData.error || "Failed to update";
                if (errorData.details) {
                    errorMsg += ": " + JSON.stringify(errorData.details);
                }
                throw new Error(errorMsg);
            }

            await Swal.fire({
                title: tAlert("updated"),
                text: tAlert("updatedText"),
                icon: "success",
                timer: 1500,
                showConfirmButton: false
            });

            router.push("/ced-portal/facilities");
        } catch (error: unknown) {
            console.error(error);
            const msg = error instanceof Error ? error.message : "Failed to update facility";
            Swal.fire(tAlert("error"), msg, "error");
        } finally {
            setIsLoading(false);
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
            <FacilityForm initialData={initialData} onSubmit={handleSubmit} isLoading={isLoading} />
        </div>
    );
}