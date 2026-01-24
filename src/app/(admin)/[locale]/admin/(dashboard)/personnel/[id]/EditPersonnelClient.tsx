"use client";

import { useRouter } from "next/navigation";
import PersonnelForm from "@/components/admin/personnel/PersonnelForm";
// Use the type from the model, but PersonnelForm might expect the legacy type
// We can cast it or update PersonnelForm later. For now, let's keep it compatible.
import type { IPersonnel } from "@/collections/Personnel";
import type { Personnel } from "@/types/personnel";
import { useState } from "react";
import Swal from "sweetalert2";

type Props = {
    // We accept IPersonnel from the server (DB model)
    initialData: IPersonnel;
};

export default function EditPersonnelClient({ initialData }: Props) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Adapt IPersonnel to Personnel for the form
    const formData: Partial<Personnel> = {
        ...initialData,
        id: initialData._id!, // Adapt _id to id
    };

    const handleUpdate = async (data: Personnel) => {
        setIsSubmitting(true);
        try {
            // Remove the id from the body, we use the one in the URL
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { id, ...updateData } = data;

            // [Fix] Add CSRF Token to headers
            const csrfToken = document.cookie
                .split("; ")
                .find((row) => row.startsWith("ced_csrf_token="))
                ?.split("=")[1];

            const res = await fetch(`/api/admin/personnel/${initialData._id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "x-csrf-token": csrfToken || "",
                },
                body: JSON.stringify(updateData),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || "Failed to update personnel");
            }

            await Swal.fire({
                title: "Updated!",
                text: "Personnel profile has been updated.",
                icon: "success",
                timer: 1500,
                showConfirmButton: false
            });

            router.push("/admin/personnel");
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
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Edit Personnel</h1>
                    <p className="text-slate-500 dark:text-slate-400">Update profile information.</p>
                </div>
            </div>
            {/* 
                The form expects `Personnel`, we pass the adapted data. 
                Cast it to `any` if strict type check fails due to minor differences,
                but `formData` should be compatible.
            */}
            <PersonnelForm initialData={formData} onSubmit={handleUpdate} isLoading={isSubmitting} />
        </div>
    );
}
