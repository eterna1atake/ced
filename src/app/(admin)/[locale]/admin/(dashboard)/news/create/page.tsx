
"use client";

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
    const tForm = useTranslations("Admin.forms.news");

    const handleCreate = async (data: NewsSeedItem) => {
        setIsSubmitting(true);
        try {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { id, ...submitData } = data;

            const csrfToken = document.cookie
                .split("; ")
                .find((row) => row.startsWith("ced_csrf_token="))
                ?.split("=")[1];

            const res = await fetch("/api/admin/news", {
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
                title: "Success!",
                text: tAlert("createdText"),
                icon: "success",
                timer: 1500,
                showConfirmButton: false
            });

            router.push("/admin/news");
        } catch (error: unknown) {
            console.error("Create error:", error);
            const msg = (error as any).message || "Unknown error occurred";
            Swal.fire(tAlert("error"), msg, "error");
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
                        ← Back to List
                    </button>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Create News</h1>
                    <p className="text-slate-500 dark:text-slate-400">Draft a new article or event.</p>
                </div>
            </div>

            <NewsForm onSubmit={handleCreate} isLoading={isSubmitting} />
        </div>
    );
}
