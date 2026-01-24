
"use client";

import { useRouter } from "next/navigation";
import FormRequestForm from "@/components/admin/forms/FormRequestForm";
import { useState } from "react";
import Swal from "sweetalert2";

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
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleUpdate = async (data: Omit<FormRequestItem, "_id">) => {
        setIsLoading(true);
        try {
            // [Fix] Add CSRF Token to headers
            const csrfToken = document.cookie
                .split("; ")
                .find((row) => row.startsWith("ced_csrf_token="))
                ?.split("=")[1];

            const res = await fetch(`/api/admin/forms/${initialData._id}`, {
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

            Swal.fire({
                title: "Updated",
                text: "Document has been updated successfully!",
                icon: "success",
                timer: 1500,
                showConfirmButton: false,
            });

            router.push("/admin/forms");
        } catch (error: unknown) {
            Swal.fire("Error", error instanceof Error ? error.message : "An error occurred", "error");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Edit Document</h1>
                    <p className="text-slate-500 dark:text-slate-400">Update file details.</p>
                </div>
            </div>
            <FormRequestForm initialData={initialData} onSubmit={handleUpdate} isLoading={isLoading} />
        </div>
    );
}
