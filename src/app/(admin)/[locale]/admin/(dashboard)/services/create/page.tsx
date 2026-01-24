"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import ServiceForm from "@/components/admin/services/ServiceForm";
import type { Service } from "@/types/service";
import Swal from "sweetalert2";

export default function CreateServicePage() {
    const router = useRouter();
    const [isSaving, setIsSaving] = useState(false);

    const handleCreate = async (data: Service) => {
        setIsSaving(true);
        try {
            // [Fix] Add CSRF Token to headers
            const csrfToken = document.cookie
                .split("; ")
                .find((row) => row.startsWith("ced_csrf_token="))
                ?.split("=")[1];

            const res = await fetch("/api/admin/services", {
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
                title: "Success",
                text: "Service created successfully",
                icon: "success",
                timer: 1500,
                showConfirmButton: false
            });

            router.push("/admin/services");
        } catch (error: unknown) {
            console.error("Create error:", error);
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
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Add Service</h1>
                    <p className="text-slate-500 dark:text-slate-400">Create a new student service link.</p>
                </div>
            </div>

            <ServiceForm onSubmit={handleCreate} isLoading={isSaving} />
        </div>
    );
}
