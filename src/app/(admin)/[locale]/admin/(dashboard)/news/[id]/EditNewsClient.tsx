
"use client";

import { useRouter } from "next/navigation";
import NewsForm from "@/components/admin/news/NewsForm";
import type { NewsSeedItem } from "@/types/news";
import Swal from "sweetalert2";
import { useState } from "react";

type Props = {
    initialData: NewsSeedItem;
};

export default function EditNewsClient({ initialData }: Props) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleUpdate = async (data: NewsSeedItem) => {
        setIsSubmitting(true);
        try {
            // Ensure we use the ID from initialData if data.id is missing or different, though it should be consistent
            // MongoDB _id vs mock id. The data.id passed from form might be the mock one or mongo one.
            // The initialData passed to this component comes from the page, which will fetch from API later.
            // So initialData._id should be reliable.
            // We use initialData._id (or id if mapped) for the URL, and send the body.
            // But NewsSeedItem has 'id' string. Mongoose has '_id'. We need to be careful with mapping.
            // When we fetch in page.tsx, we should map _id to id or ensure types align.

            // Assuming the ID in the URL/Page param is what we need.
            // But here we rely on data.id being correct.
            const targetId = data.id || initialData.id;

            // [Fix] Add CSRF Token to headers
            const csrfToken = document.cookie
                .split("; ")
                .find((row) => row.startsWith("ced_csrf_token="))
                ?.split("=")[1];

            const res = await fetch(`/api/admin/news/${targetId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "x-csrf-token": csrfToken || "",
                },
                body: JSON.stringify(data),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || "Failed to update news item");
            }

            await Swal.fire({
                title: "Success!",
                text: "News item updated successfully.",
                icon: "success",
                timer: 1500,
                showConfirmButton: false
            });

            router.push("/admin/news");
        } catch (error: unknown) {
            console.error("Update error:", error);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const msg = (error as any).message || "Unknown error occurred";
            Swal.fire("Error", msg, "error");
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
