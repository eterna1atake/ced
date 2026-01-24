
"use client";

import { useRouter } from "next/navigation";
import FormRequestForm from "@/components/admin/forms/FormRequestForm";
import Swal from "sweetalert2";
import { useState } from "react";

interface FormRequestItem {
    _id: string;
    categoryId: string;
    sectionId: string;
    url: string;
    th: { name: string };
    en: { name: string };
}

export default function CreateFormRequestPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleCreate = async (data: Omit<FormRequestItem, "_id">) => {
        setIsLoading(true);
        try {
            // [Fix] Add CSRF Token to headers
            const csrfToken = document.cookie
                .split("; ")
                .find((row) => row.startsWith("ced_csrf_token="))
                ?.split("=")[1];

            const res = await fetch("/api/admin/forms", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-csrf-token": csrfToken || "",
                },
                body: JSON.stringify(data),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error?.[0]?.message || errorData.error || "Failed to create document");
            }

            Swal.fire({
                title: "Success",
                text: "Document has been created successfully!",
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
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Add Document</h1>
                    <p className="text-slate-500 dark:text-slate-400">Upload a new form or file.</p>
                </div>
            </div>

            <FormRequestForm onSubmit={handleCreate} isLoading={isLoading} />
        </div>
    );
}
