"use client";

import { useRouter } from "next/navigation";
import PersonnelForm from "@/components/admin/personnel/PersonnelForm";
import type { Personnel } from "@/types/personnel";
import Swal from "sweetalert2";
import { useState } from "react";

export default function CreatePersonnelPage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleCreate = async (data: Personnel) => {
        setIsSubmitting(true);
        try {
            // Remove the client-side generated ID
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { id, ...submitData } = data;

            // [Fix] Add CSRF Token to headers
            const csrfToken = document.cookie
                .split("; ")
                .find((row) => row.startsWith("ced_csrf_token="))
                ?.split("=")[1];

            const res = await fetch("/api/admin/personnel", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-csrf-token": csrfToken || "",
                },
                body: JSON.stringify(submitData),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || "Failed to create personnel");
            }

            await Swal.fire({
                title: "Success!",
                text: "Personnel profile created successfully.",
                icon: "success",
                timer: 1500,
                showConfirmButton: false
            });

            router.push("/admin/personnel");
        } catch (error: unknown) {
            console.error("Create error:", error);
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
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Add Personnel</h1>
                    <p className="text-slate-500 dark:text-slate-400">Create a new faculty or staff profile.</p>
                </div>
            </div>

            <PersonnelForm onSubmit={handleCreate} isLoading={isSubmitting} />
        </div>
    );
}
