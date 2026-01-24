
"use client";

import React from "react";
import { useRouter } from "next/navigation";
import AwardsForm from "@/components/admin/awards/AwardsForm";
import type { Award } from "@/types/award";

type Props = {
    initialData: Award;
};

export default function EditAwardClient({ initialData }: Props) {
    const router = useRouter();
    const [isSaving, setIsSaving] = React.useState(false);

    const handleUpdate = async (data: Award) => {
        setIsSaving(true);
        try {
            const csrfToken = document.cookie
                .split("; ")
                .find((row) => row.startsWith("ced_csrf_token="))
                ?.split("=")[1];

            // Use MongoDB _id if present, otherwise fallback to id
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const awardId = (initialData as any)._id || initialData.id;

            const res = await fetch(`/api/admin/awards/${awardId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "x-csrf-token": csrfToken || "",
                },
                body: JSON.stringify(data),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || "Failed to update award");
            }

            const Swal = (await import("sweetalert2")).default;
            await Swal.fire({
                title: "Updated!",
                text: "Award has been updated successfully.",
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
            console.error("Update error:", error);
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
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Edit Award</h1>
                    <p className="text-slate-500 dark:text-slate-400">Update achievement details.</p>
                </div>
            </div>
            <AwardsForm initialData={initialData} onSubmit={handleUpdate} isLoading={isSaving} />
        </div>
    );
}
