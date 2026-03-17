"use client";
import { getCsrfToken } from "@/utils/cookie";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ResourceForm, { IOnlineResourceForm } from "@/components/admin/online-resources/ResourceForm";
import Swal from "sweetalert2";
import { useTranslations } from "next-intl";

interface EditResourceClientProps {
    initialData: IOnlineResourceForm & { _id: string };
}

export default function EditResourceClient({ initialData }: EditResourceClientProps) {
    const tAlert = useTranslations("Admin.alerts");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const t = useTranslations("Admin.pages.onlineResources");

    const handleUpdate = async (data: IOnlineResourceForm) => {
        setIsLoading(true);
        try {
            // [Fix] Add CSRF Token to headers
            const csrfToken = getCsrfToken();

            const res = await fetch(`/api/ced-portal/online-resources/${initialData._id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "x-csrf-token": csrfToken || "",
                },
                body: JSON.stringify(data),
            });

            const result = await res.json();

            if (!res.ok) {
                // Handle Zod issues or custom error message
                if (Array.isArray(result.error)) {
                    const messages = (result.error as { path: (string | number)[]; message: string }[]).map((err) => `${err.path.join('.')}: ${err.message}`).join("\n");
                    throw new Error(messages);
                }
                throw new Error(result.error || "Failed to update resource");
            }

            await Swal.fire({
                title: tAlert("updated"),
                text: "Resource details have been saved.",
                icon: "success",
                confirmButtonColor: "#35622F",
            });

            router.push("/ced-portal/online-resources");
            router.refresh();
        } catch (error: unknown) {
            console.error("Update error:", error);
            const err = error as Error;
            Swal.fire({
                title: "Validation Error",
                text: err.message || "Failed to update record.",
                icon: "error",
                confirmButtonColor: "#d33",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
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

            <ResourceForm initialData={initialData} onSubmit={handleUpdate} isLoading={isLoading} />
        </div>
    );
}