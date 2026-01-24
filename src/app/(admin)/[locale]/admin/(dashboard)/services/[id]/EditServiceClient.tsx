"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import ServiceForm from "@/components/admin/services/ServiceForm";
import { Service } from "@/types/service";
import Swal from "sweetalert2";

type Props = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    initialData: any; // Using any to avoid strict type mismatch with Mongoose document
};

export default function EditServiceClient({ initialData }: Props) {
    const router = useRouter();
    const [isSaving, setIsSaving] = useState(false);

    const handleUpdate = async (data: Service) => {
        setIsSaving(true);
        try {
            // [Fix] Add CSRF Token to headers
            const csrfToken = document.cookie
                .split("; ")
                .find((row) => row.startsWith("ced_csrf_token="))
                ?.split("=")[1];

            const res = await fetch(`/api/admin/services/${initialData._id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "x-csrf-token": csrfToken || "",
                },
                body: JSON.stringify(data),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || "Failed to update service");
            }

            await Swal.fire({
                title: "Success",
                text: "Service updated successfully",
                icon: "success",
                timer: 1500,
                showConfirmButton: false
            });

            router.push("/admin/services");
        } catch (error: unknown) {
            console.error("Update error:", error);
            const message = error instanceof Error ? error.message : "Something went wrong";
            Swal.fire("Error", message, "error");
        } finally {
            setIsSaving(false);
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
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Edit Service</h1>
                    <p className="text-slate-500 dark:text-slate-400">Update service details.</p>
                </div>
            </div>
            <ServiceForm initialData={initialData} onSubmit={handleUpdate} isLoading={isSaving} />
        </div>
    );
}
