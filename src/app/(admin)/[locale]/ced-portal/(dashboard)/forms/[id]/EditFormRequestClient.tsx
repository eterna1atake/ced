
"use client";
import { getCsrfToken } from "@/utils/cookie";

import { useRouter } from "next/navigation";
import FormRequestForm from "@/components/admin/forms/FormRequestForm";
import { useState } from "react";
import Swal from "sweetalert2";
import { useTranslations } from "next-intl";

interface FormRequestItem {
    _id: string;
    categoryId: string;
    sectionId: string;
    url: string;
    th: { name: string };
    en: { name: string };
}

type Props = {
    initialData: FormRequestItem;
};

export default function EditFormRequestClient({ initialData }: Props) {
    const tAlert = useTranslations("Admin.alerts");
    const router = useRouter();
    const t = useTranslations("Admin.pages.forms");
    const [isLoading, setIsLoading] = useState(false);

    const handleUpdate = async (data: Omit<FormRequestItem, "_id">) => {
        setIsLoading(true);
        try {
            // [Fix] Add CSRF Token to headers
            const csrfToken = getCsrfToken();

            const res = await fetch(`/api/ced-portal/forms/${initialData._id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "x-csrf-token": csrfToken || "",
                },
                body: JSON.stringify(data),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error?.[0]?.message || errorData.error || "Failed to update document");
            }

            await Swal.fire({
                title: "Updated",
                text: "Document has been updated successfully!",
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
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{t("editTitle")}</h1>
                    <p className="text-slate-500 dark:text-slate-400">{t("editSubtitle")}</p>
                </div>
            </div>
            <FormRequestForm initialData={initialData} onSubmit={handleUpdate} isLoading={isLoading} />
        </div>
    );
}