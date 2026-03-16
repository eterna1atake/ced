
import { notFound } from "next/navigation";
import dbConnect from "@/lib/mongoose";
import FormRequest from "@/collections/FormRequest";
import EditFormRequestClient from "./EditFormRequestClient";

type PageProps = {
    params: Promise<{
        id: string;
    }>;
};

export default async function EditFormRequestPage({ params }: PageProps) {
    const { id } = await params;

    try {
        await dbConnect();
        // Use lean() but we'll need to serialize _id for the client
        const resource = await FormRequest.findById(id).lean();

        if (!resource) {
            notFound();
        }

        // Serialize MongoDB objects for Client Component
        const initialData = JSON.parse(JSON.stringify(resource));
        if (!initialData.id && initialData._id) {
            initialData.id = initialData._id.toString();
        }

        return <EditFormRequestClient initialData={initialData} />;

    } catch (error) {
        console.error("Error loading form request:", error);
        notFound();
    }
}
