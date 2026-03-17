"use client";
import { getCsrfToken } from "@/utils/cookie";

import { useRouter } from "next/navigation";
import { useState } from "react";
import HeroForm from "@/components/admin/hero/HeroForm";
import type { HeroCarouselImage } from "@/types/hero";
import Swal from "sweetalert2";
import { useTranslations } from "next-intl";

export default function CreateHeroPage() {
    const tAlert = useTranslations("Admin.alerts");
    const router = useRouter();
    const t = useTranslations("Admin.pages.hero");
    const [isLoading, setIsLoading] = useState(false);

    const handleCreate = async (data: HeroCarouselImage) => {
        setIsLoading(true);
        try {
            // [Fix] Add CSRF Token to headers
            const csrfToken = getCsrfToken();

            const res = await fetch("/api/ced-portal/hero", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-csrf-token": csrfToken || "",
                },
                body: JSON.stringify(data),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || "Failed to create");
            }

            await Swal.fire({
                icon: 'success',
                title: tAlert("created"),
                text: 'Hero image has been added.',
                timer: 1500
            });

            router.push("/ced-portal/hero");
            router.refresh();
        } catch (error: unknown) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const err = error as any;
            console.error(err);
            Swal.fire(tAlert("error"), err.message || "Failed to create hero image", "error");
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
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{t("createTitle")}</h1>
                    <p className="text-slate-500 dark:text-slate-400">{t("createSubtitle")}</p>
                </div>
            </div>

            <HeroForm onSubmit={handleCreate} isLoading={isLoading} />
        </div>
    );
}