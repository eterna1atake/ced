"use client";
import { getCsrfToken } from "@/utils/cookie";

import { useRouter } from "@/i18n/navigation";
import PersonnelForm from "@/components/admin/personnel/PersonnelForm";
import type { Personnel } from "@/types/personnel";
import Swal from "sweetalert2";
import { useState } from "react";
import { useTranslations } from "next-intl";

export default function CreatePersonnelPage() {
    const tAlert = useTranslations("Admin.alerts");
    const router = useRouter();
    const t = useTranslations("Admin.pages.personnel");
    const [isLoading, setIsLoading] = useState(false);

    const handleCreate = async (data: Personnel) => {
        setIsLoading(true);
        try {
            // Remove the client-side generated ID
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { id, ...submitData } = data;

            // [Fix] Add CSRF Token to headers
            const csrfToken = getCsrfToken();

            const res = await fetch("/api/ced-portal/personnel", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-csrf-token": csrfToken || "",
                },
                body: JSON.stringify(submitData),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || "Failed to create personnel");
            }

            await Swal.fire({
                title: "Success!",
                text: tAlert("createdText"),
                icon: "success",
                timer: 1500,
                showConfirmButton: false
            });

            router.push("/ced-portal/personnel");
            router.refresh();
        } catch (error: unknown) {
            console.error("Create error:", error);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const msg = (error as any).message || "Unknown error occurred";
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
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{t("createTitle")}</h1>
                    <p className="text-slate-500 dark:text-slate-400">{t("createSubtitle")}</p>
                </div>
            </div>

            <PersonnelForm onSubmit={handleCreate} isLoading={isLoading} />
        </div>
    );
}