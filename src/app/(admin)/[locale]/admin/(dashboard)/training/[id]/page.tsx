
import { notFound } from "next/navigation";
import { TRAINING_SEED } from "@/data/training";
import EditTrainingClient from "./EditTrainingClient";

type PageProps = {
    params: Promise<{
        id: string;
    }>;
};

export default async function EditTrainingPage({ params }: PageProps) {
    const { id } = await params;
    const training = TRAINING_SEED.find((item) => item.id === id);

    if (!training) {
        notFound();
    }

    return <EditTrainingClient initialData={training} />;
}
