"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Swal from "sweetalert2";
import ClassroomForm from "@/components/admin/classrooms/ClassroomForm";
import type { Classroom } from "@/types/classroom";

export default function CreateClassroomPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (data: Classroom) => {
        setIsLoading(true);
        try {
            const csrfToken = document.cookie
                .split("; ")
                .find((row) => row.startsWith("ced_csrf_token="))
                ?.split("=")[1];

            const res = await fetch('/api/admin/classrooms', {
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
                text: "Classroom has been created successfully.",
                icon: "success",
                timer: 1500,
                showConfirmButton: false
            });

            router.push("/admin/classrooms");
        } catch (error: unknown) {
            console.error(error);
            const msg = error instanceof Error ? error.message : "Failed to create classroom";
            Swal.fire("Error", msg, "error");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Add New Classroom</h1>
                    <p className="text-slate-500 dark:text-slate-400">Create a new classroom or lab entry.</p>
                </div>
            </div>
            <ClassroomForm onSubmit={handleSubmit} isLoading={isLoading} />
        </div>
    );
}
