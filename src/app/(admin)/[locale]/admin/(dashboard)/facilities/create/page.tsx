"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Swal from "sweetalert2";
import FacilityForm from "@/components/admin/facilities/FacilityForm";
import type { Facility } from "@/types/facility";

export default function CreateFacilityPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (data: Facility) => {
        setIsLoading(true);
        try {
            const csrfToken = document.cookie
                .split("; ")
                .find((row) => row.startsWith("ced_csrf_token="))
                ?.split("=")[1];

            const res = await fetch('/api/admin/facilities', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-csrf-token': csrfToken || ""
                },
                body: JSON.stringify(data),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || "Failed to create");
            }

            await Swal.fire({
                title: "Created!",
                text: "Facility has been created successfully.",
                icon: "success",
                timer: 1500,
                showConfirmButton: false
            });

            router.push("/admin/facilities");
        } catch (error: unknown) {
            console.error(error);
            const msg = error instanceof Error ? error.message : "Failed to create facility";
            Swal.fire("Error", msg, "error");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Add New Facility</h1>
                    <p className="text-slate-500 dark:text-slate-400">Create a new facility or lab entry.</p>
                </div>
            </div>
            <FacilityForm onSubmit={handleSubmit} isLoading={isLoading} />
        </div>
    );
}
