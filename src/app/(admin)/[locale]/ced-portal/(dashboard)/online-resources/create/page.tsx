"use client";
import { getCsrfToken } from "@/utils/cookie";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import ResourceForm, { IOnlineResourceForm } from "@/components/admin/online-resources/ResourceForm";
import Swal from "sweetalert2";

export default function CreateResourcePage() {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const t = useTranslations("Admin.pages.onlineResources");

    const handleCreate = async (data: IOnlineResourceForm) => {
        setIsLoading(true);
        try {
            // [Fix] Add CSRF Token to headers
            const csrfToken = getCsrfToken();

            const res = await fetch("/api/ced-portal/online-resources", {
                method: "POST",
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
                throw new Error(result.error || "Failed to create resource");
            }

            await Swal.fire({
                title: "Success!",
                text: "Online Resource has been created.",
                icon: "success",
                confirmButtonColor: "#35622F",
            });

            router.push("/ced-portal/online-resources");
            router.refresh();
        } catch (error: unknown) {
            console.error("Creation error:", error);
            const err = error as Error;
            Swal.fire({
                title: "Validation Error",
                text: err.message || "Failed to save record.",
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
                <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{t("createTitle")}</h1>
                <p className="text-slate-500 dark:text-slate-400">{t("createSubtitle")}</p>
            </div>

            <ResourceForm onSubmit={handleCreate} isLoading={isLoading} />
        </div>
    );
}