import { notFound } from "next/navigation";
import dbConnect from "@/lib/mongoose";
import StudentService from "@/collections/StudentService";
import EditServiceClient from "./EditServiceClient";

type PageProps = {
    params: Promise<{
        id: string;
    }>;
};

export default async function EditServicePage({ params }: PageProps) {
    const { id } = await params;

    try {
        await dbConnect();
        // Plain object for the client component
        const serviceData = await StudentService.findById(id).lean();

        if (!serviceData) {
            notFound();
        }

        // Convert MongoDB _id and dates to serializable format for Client Component
        const service = JSON.parse(JSON.stringify(serviceData));
        if (!service.id && service._id) {
            service.id = service._id.toString();
        }

        return <EditServiceClient initialData={service} />;

    } catch (error) {
        console.error("Error loading service for edit:", error);
        notFound();
    }
}
