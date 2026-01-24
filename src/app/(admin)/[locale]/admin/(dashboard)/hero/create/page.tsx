"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import HeroForm from "@/components/admin/hero/HeroForm";
import type { HeroCarouselImage } from "@/types/hero";
import Swal from "sweetalert2";

export default function CreateHeroPage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleCreate = async (data: HeroCarouselImage) => {
        setIsSubmitting(true);
        try {
            // [Fix] Add CSRF Token to headers
            const csrfToken = document.cookie
                .split("; ")
                .find((row) => row.startsWith("ced_csrf_token="))
                ?.split("=")[1];

            const res = await fetch("/api/admin/hero", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-csrf-token": csrfToken || "",
                },
                body: JSON.stringify(data),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || "Failed to create");
            }

            await Swal.fire({
                icon: 'success',
                title: 'Created!',
                text: 'Hero image has been added.',
                timer: 1500
            });

            router.push("/admin/hero");
            router.refresh();
        } catch (error: unknown) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const err = error as any;
            console.error(err);
            Swal.fire("Error", err.message || "Failed to create hero image", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Add Hero Image</h1>
                    <p className="text-slate-500 dark:text-slate-400">Upload or link a new banner image.</p>
                </div>
            </div>

            <HeroForm onSubmit={handleCreate} isLoading={isSubmitting} />
        </div>
    );
}
