
"use client";
import { getCsrfToken } from "@/utils/cookie";

import { useRouter } from "@/i18n/navigation";
import FormRequestForm from "@/components/admin/forms/FormRequestForm";
import Swal from "sweetalert2";
import { useState } from "react";
import { useTranslations } from "next-intl";

interface FormRequestItem {
    _id: string;
    categoryId: string;
    sectionId: string;
    url: string;
    th: { name: string };
    en: { name: string };
}

export default function CreateFormRequestPage() {
    const tAlert = useTranslations("Admin.alerts");
    const router = useRouter();
    const t = useTranslations("Admin.pages.forms");
    const [isLoading, setIsLoading] = useState(false);

    const handleCreate = async (data: Omit<FormRequestItem, "_id">) => {
        setIsLoading(true);
        try {
            // [Fix] Add CSRF Token to headers
            const csrfToken = getCsrfToken();

            const res = await fetch("/api/ced-portal/forms", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-csrf-token": csrfToken || "",
                },
                body: JSON.stringify(data),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error?.[0]?.message || errorData.error || "Failed to create document");
            }

            await Swal.fire({
                title: tAlert("success"),
                text: "Document has been created successfully!",
                icon: "success",
                timer: 1500,
                showConfirmButton: false,
            });

            router.push("/ced-portal/forms");
            router.refresh();
        } catch (error: unknown) {
            Swal.fire(tAlert("error"), error instanceof Error ? error.message : "An error occurred", "error");
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

            <FormRequestForm onSubmit={handleCreate} isLoading={isLoading} />
        </div>
    );
}