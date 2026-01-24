"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import HeroForm from "@/components/admin/hero/HeroForm";
import type { HeroCarouselImage } from "@/types/hero"; // Consider updating this type definition later
import Swal from "sweetalert2";

// Extend the type to include _id which might be missing in original type
type ExtendedHeroImage = HeroCarouselImage & { _id?: string };

type Props = {
    initialData: ExtendedHeroImage;
};

export default function EditHeroClient({ initialData }: Props) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleUpdate = async (data: HeroCarouselImage) => {
        setIsSubmitting(true);
        // Use _id from initialData if data.id is not the mongo ID
        const id = initialData._id || data.id;

        try {
            // [Fix] Add CSRF Token to headers
            const csrfToken = document.cookie
                .split("; ")
                .find((row) => row.startsWith("ced_csrf_token="))
                ?.split("=")[1];

            const res = await fetch(`/api/admin/hero/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "x-csrf-token": csrfToken || "",
                },
                body: JSON.stringify(data),
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({ error: "Unknown error" }));
                console.error("Update failed:", res.status, errorData);
                throw new Error(errorData.error || `Failed to update (Status: ${res.status})`);
            }

            await Swal.fire({
                icon: 'success',
                title: 'Updated!',
                text: 'Hero image has been updated.',
                timer: 1500
            });

            router.push("/admin/hero");
            router.refresh();
        } catch (error) {
            console.error(error);
            Swal.fire("Error", "Failed to update hero image", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Edit Hero Image</h1>
                    <p className="text-slate-500 dark:text-slate-400">Update banner details.</p>
                </div>
            </div>
            <HeroForm
                initialData={initialData}
                onSubmit={handleUpdate}
                isLoading={isSubmitting}
            />
        </div>
    );
}
