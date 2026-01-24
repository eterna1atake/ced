"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ResourceForm, { IOnlineResourceForm } from "@/components/admin/online-resources/ResourceForm";
import Swal from "sweetalert2";

interface EditResourceClientProps {
    initialData: IOnlineResourceForm & { _id: string };
}

export default function EditResourceClient({ initialData }: EditResourceClientProps) {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleUpdate = async (data: IOnlineResourceForm) => {
        setIsLoading(true);
        try {
            // [Fix] Add CSRF Token to headers
            const csrfToken = document.cookie
                .split("; ")
                .find((row) => row.startsWith("ced_csrf_token="))
                ?.split("=")[1];

            const res = await fetch(`/api/admin/online-resources/${initialData._id}`, {
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
                title: "Updated!",
                text: "Resource details have been saved.",
                icon: "success",
                confirmButtonColor: "#35622F",
            });

            router.push("/admin/online-resources");
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
                <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Edit Resource</h1>
                <p className="text-slate-500 dark:text-slate-400">Update configuration for {initialData.en.title}.</p>
            </div>

            <ResourceForm initialData={initialData} onSubmit={handleUpdate} isLoading={isLoading} />
        </div>
    );
}
