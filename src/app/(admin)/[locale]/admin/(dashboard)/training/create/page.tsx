
"use client";

import { useRouter } from "next/navigation";
import TrainingForm from "@/components/admin/training/TrainingForm";

export default function CreateTrainingPage() {
    const router = useRouter();

    const handleCreate = (data: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
        console.log("Creating training:", data);
        setTimeout(() => {
            router.push("/admin/training");
        }, 1000);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Add Training</h1>
                    <p className="text-slate-500 dark:text-slate-400">Create a new course offering.</p>
                </div>
            </div>

            <TrainingForm onSubmit={handleCreate} />
        </div>
    );
}
