import { notFound } from "next/navigation";
import dbConnect from "@/lib/mongoose";
import OnlineResource from "@/collections/OnlineResource";
import EditResourceClient from "./EditResourceClient";

type PageProps = {
    params: Promise<{
        id: string;
    }>;
};

interface RawOnlineResource {
    _id: { toString: () => string };
    key: string;
    link: string;
    iconName: string;
    imagePath?: string;
    colorClass: string;
    categoryKey: "learning_resources" | "systems_tools";
    th: { title: string; description: string };
    en: { title: string; description: string };
    createdAt?: Date;
    updatedAt?: Date;
}

export default async function EditResourcePage({ params }: PageProps) {
    const { id } = await params;

    try {
        await dbConnect();
        const resource = await OnlineResource.findById(id).lean() as unknown as RawOnlineResource;

        if (!resource) {
            notFound();
        }

        // Serialize for client
        const initialData = JSON.parse(JSON.stringify(resource));
        if (!initialData.id && initialData._id) {
            initialData.id = initialData._id.toString();
        }

        return <EditResourceClient initialData={initialData} />;

    } catch (error) {
        console.error("Error loading resource:", error);
        notFound();
    }
}
