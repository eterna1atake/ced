
"use client";

import { useRouter } from "next/navigation";
import TrainingForm from "@/components/admin/training/TrainingForm";

type Props = {
    // Using any for simplicity as partial type matching is complex with readonly seed
    initialData: any; // eslint-disable-line @typescript-eslint/no-explicit-any
};

export default function EditTrainingClient({ initialData }: Props) {
    const router = useRouter();

    const handleUpdate = (data: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
        console.log("Updating training:", data);
        setTimeout(() => {
            router.push("/admin/training");
        }, 1000);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Edit Training</h1>
                    <p className="text-slate-500 dark:text-slate-400">Update course details.</p>
                </div>
            </div>
            <TrainingForm initialData={initialData} onSubmit={handleUpdate} />
        </div>
    );
}
