
"use client";

import { useRouter } from "next/navigation";
import NewsForm from "@/components/admin/news/NewsForm";
import type { NewsSeedItem } from "@/types/news";
import Swal from "sweetalert2";
import { useState } from "react";
import { useTranslations } from "next-intl";

type Props = {
    initialData: NewsSeedItem;
};

export default function EditNewsClient({ initialData }: Props) {
    const tAlert = useTranslations("Admin.alerts");
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const tForm = useTranslations("Admin.forms.news");

    const handleUpdate = async (data: NewsSeedItem) => {
        setIsSubmitting(true);
        try {
            const targetId = data.id || initialData.id;

            const csrfToken = document.cookie
                .split("; ")
                .find((row) => row.startsWith("ced_csrf_token="))
                ?.split("=")[1];

            const res = await fetch(`/api/ced-portal/news/${targetId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "x-csrf-token": csrfToken || "",
                },
                body: JSON.stringify(data),
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
                throw new Error(responseData.error || "Failed to update news item");
            }

            await Swal.fire({
                title: "Success!",
                text: tAlert("updatedText"),
                icon: "success",
                timer: 1500,
                showConfirmButton: false
            });

            router.push("/admin/news");
        } catch (error: unknown) {
            console.error("Update error:", error);
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
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Edit News</h1>
                    <p className="text-slate-500 dark:text-slate-400">Update existing article.</p>
                </div>
            </div>
            <NewsForm initialData={initialData} onSubmit={handleUpdate} isLoading={isSubmitting} />
        </div>
    );
}
