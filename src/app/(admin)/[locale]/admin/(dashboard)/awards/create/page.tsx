"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import AwardsForm from "@/components/admin/awards/AwardsForm";
import type { Award } from "@/types/award";

export default function CreateAwardPage() {
    const router = useRouter();
    const [isSaving, setIsSaving] = useState(false);

    const handleCreate = async (data: Award) => {
        setIsSaving(true);
        try {
            const csrfToken = document.cookie
                .split("; ")
                .find((row) => row.startsWith("ced_csrf_token="))
                ?.split("=")[1];

            const res = await fetch("/api/admin/awards", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-csrf-token": csrfToken || "",
                },
                body: JSON.stringify(data),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || "Failed to create award");
            }

            const Swal = (await import("sweetalert2")).default;
            await Swal.fire({
                title: "Created!",
                text: "New award has been added successfully.",
                icon: "success",
                timer: 2000,
                showConfirmButton: false,
                toast: true,
                position: "top-end"
            });

            router.push("/admin/awards");
            router.refresh();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            console.error("Create error:", error);
            const Swal = (await import("sweetalert2")).default;
            Swal.fire({
                title: "Error",
                text: error.message || "An unexpected error occurred.",
                icon: "error"
            });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Add Award</h1>
                    <p className="text-slate-500 dark:text-slate-400">Record a new achievement.</p>
                </div>
            </div>

            <AwardsForm onSubmit={handleCreate} isLoading={isSaving} />
        </div>
    );
}
