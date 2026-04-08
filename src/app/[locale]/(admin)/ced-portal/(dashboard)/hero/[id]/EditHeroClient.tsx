"use client";
import { getCsrfToken } from "@/utils/cookie";

import { useRouter } from "@/i18n/navigation";
import { useState } from "react";
import HeroForm from "@/components/admin/hero/HeroForm";
import type { HeroCarouselImage } from "@/types/hero"; // Consider updating this type definition later
import Swal from "sweetalert2";
import { useTranslations } from "next-intl";

// Extend the type to include _id which might be missing in original type
type ExtendedHeroImage = HeroCarouselImage & { _id?: string };

type Props = {
    initialData: ExtendedHeroImage;
};

export default function EditHeroClient({ initialData }: Props) {
    const tAlert = useTranslations("Admin.alerts");
    const router = useRouter();
    const t = useTranslations("Admin.pages.hero");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleUpdate = async (data: HeroCarouselImage) => {
        setIsSubmitting(true);
        // Use _id from initialData if data.id is not the mongo ID
        const id = initialData._id || data.id;

        try {
            // [Fix] Add CSRF Token to headers
            const csrfToken = getCsrfToken();

            const res = await fetch(`/cedweb/api/ced-portal/hero/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "x-csrf-token": csrfToken || "",
                },
                body: JSON.stringify(data),
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({ error: "Unknown error" }));
                console.error("Update failed:", res.status, errorData);
                throw new Error(errorData.error || `Failed to update (Status: ${res.status})`);
            }

            await Swal.fire({
                icon: 'success',
                title: tAlert("updated"),
                text: tAlert("updatedText"),
                timer: 1500
            });

            router.push("/ced-portal/hero");
            router.refresh();
        } catch (error) {
            console.error(error);
            Swal.fire(tAlert("error"), "Failed to update hero image", "error");
        } finally {
            setIsSubmitting(false);
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
            <HeroForm
                initialData={initialData}
                onSubmit={handleUpdate}
                isLoading={isSubmitting}
            />
        </div>
    );
}