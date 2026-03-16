
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ProgramForm from "@/components/admin/programs/ProgramForm";
import type { ProgramItem } from "@/types/program";
import Swal from "sweetalert2";
import { useTranslations } from "next-intl";

export default function CreateProgramClient() {
    const tAlert = useTranslations("Admin.alerts");
    const router = useRouter();
    const t = useTranslations("Admin.pages.programs");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (data: ProgramItem) => {
        setIsLoading(true);
        try {
            const csrfToken = document.cookie
                .split("; ")
                .find((row) => row.startsWith("ced_csrf_token="))
                ?.split("=")[1];

            const response = await fetch('/api/ced-portal/programs', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-csrf-token': csrfToken || ""
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || errorData.error || 'Failed to create program');
            }

            const created = await response.json();

            await Swal.fire({
                title: tAlert("created"),
                text: "Program has been created successfully. Now you can edit its details.",
                icon: "success",
                confirmButtonText: "Go to Edit"
            });

            // Redirect to the edit page of the newly created program
            router.push(`/ced-portal/programs/${created.id}`);
            router.refresh();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            Swal.fire({
                title: tAlert("error"),
                text: error.message || "Failed to create program",
                icon: "error"
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => router.back()}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-600 dark:text-slate-400 flex items-center gap-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                    <span className="text-sm font-medium">{t("backToList")}</span>
                </button>
                <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{t("createTitle")}</h1>
            </div>

            <ProgramForm
                onSubmit={handleSubmit}
                isLoading={isLoading}
            />
        </div>
    );
}
