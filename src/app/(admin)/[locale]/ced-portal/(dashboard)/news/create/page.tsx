
"use client";
import { getCsrfToken } from "@/utils/cookie";

import { useRouter } from "next/navigation";
import NewsForm from "@/components/admin/news/NewsForm";
import type { NewsSeedItem } from "@/types/news";
import Swal from "sweetalert2";
import { useState } from "react";
import { useTranslations } from "next-intl";

export default function CreateNewsPage() {
    const tAlert = useTranslations("Admin.alerts");
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const t = useTranslations("Admin.pages.news");
    const tForm = useTranslations("Admin.forms.news");

    const handleCreate = async (data: NewsSeedItem) => {
        setIsSubmitting(true);
        try {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { id, ...submitData } = data;

            const csrfToken = getCsrfToken();

            const res = await fetch("/api/ced-portal/news", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-csrf-token": csrfToken || "",
                },
                body: JSON.stringify(submitData),
            });

            const responseData = await res.json();

            if (!res.ok) {
                if (res.status === 409 && responseData.code === "SLUG_EXISTS") {
                    await Swal.fire({
                        title: tForm("slugErrorTitle"),
                        text: tForm("slugErrorText"),
                        icon: "warning",
                        confirmButtonColor: "#f59e0b",
                    });
                    return;
                }
                throw new Error(responseData.error || "Failed to create news item");
            }

            await Swal.fire({
                title: tAlert("success"),
                text: tAlert("createdText"),
                icon: "success",
                timer: 1500,
                showConfirmButton: false
            });

            router.push("/ced-portal/news");
        } catch (error: unknown) {
            console.error(error);
            const msg = error instanceof Error ? error.message : tAlert("createFailed");
            Swal.fire({
                icon: "error",
                title: tAlert("error"),
                text: msg,
            });
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
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{t("createTitle")}</h1>
                    <p className="text-slate-500 dark:text-slate-400">{t("createSubtitle")}</p>
                </div>
            </div>

            <NewsForm onSubmit={handleCreate} isLoading={isSubmitting} />
        </div>
    );
}