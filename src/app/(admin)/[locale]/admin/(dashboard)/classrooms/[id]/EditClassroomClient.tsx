"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Swal from "sweetalert2";
import ClassroomForm from "@/components/admin/classrooms/ClassroomForm";
import type { Classroom } from "@/types/classroom";

interface Props {
    initialData: Classroom;
}

export default function EditClassroomClient({ initialData }: Props) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (data: Classroom) => {
        setIsLoading(true);
        try {

            const csrfToken = document.cookie
                .split("; ")
                .find((row) => row.startsWith("ced_csrf_token="))
                ?.split("=")[1];

            const res = await fetch(`/api/admin/classrooms/${encodeURIComponent(data.id)}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-csrf-token': csrfToken || ""
                },
                body: JSON.stringify(data),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || "Failed to update");
            }

            await Swal.fire({
                title: "Updated!",
                text: "Classroom has been updated successfully.",
                icon: "success",
                timer: 1500,
                showConfirmButton: false
            });

            router.push("/admin/classrooms");
        } catch (error: unknown) {
            console.error(error);
            const msg = error instanceof Error ? error.message : "Failed to update classroom";
            Swal.fire("Error", msg, "error");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Edit Classroom</h1>
                    <p className="text-slate-500 dark:text-slate-400">Update classroom details.</p>
                </div>
            </div>
            <ClassroomForm initialData={initialData} onSubmit={handleSubmit} isLoading={isLoading} />
        </div>
    );
}
