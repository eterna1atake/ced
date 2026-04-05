"use client";
import { getCsrfToken } from "@/utils/cookie";

import { useRouter } from "@/i18n/navigation";
import { useState } from "react";
import ServiceForm from "@/components/admin/services/ServiceForm";
import type { Service } from "@/types/service";
import Swal from "sweetalert2";
import { useTranslations } from "next-intl";

export default function CreateServicePage() {
    const tAlert = useTranslations("Admin.alerts");
    const router = useRouter();
    const t = useTranslations("Admin.pages.services");
    const [isLoading, setIsLoading] = useState(false);

    const handleCreate = async (data: Service) => {
        setIsLoading(true);
        try {
            // [Fix] Add CSRF Token to headers
            const csrfToken = getCsrfToken();

            const res = await fetch("/api/ced-portal/services", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-csrf-token": csrfToken || "",
                },
                body: JSON.stringify(data),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || "Failed to create service");
            }

            await Swal.fire({
                title: tAlert("success"),
                text: tAlert("createdText"),
                icon: "success",
                timer: 1500,
                showConfirmButton: false
            });

            router.push("/ced-portal/services");
            router.refresh();
        } catch (error: unknown) {
            console.error("Create error:", error);
            const message = error instanceof Error ? error.message : "Something went wrong";
            Swal.fire(tAlert("error"), message, "error");
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

            <ServiceForm onSubmit={handleCreate} isLoading={isLoading} />
        </div>
    );
}