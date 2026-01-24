import { notFound } from "next/navigation";
import EditNewsClient from "./EditNewsClient";
import dbConnect from "@/lib/mongoose";
import News from "@/collections/News";

type PageProps = {
    params: Promise<{
        id: string;
    }>;
};

export default async function EditNewsPage({ params }: PageProps) {
    const { id } = await params;

    await dbConnect();
    const newsDoc = await News.findById(id).lean();

    if (!newsDoc) {
        notFound();
    }

    // Convert to plain object for client serialization
    const newsItem = JSON.parse(JSON.stringify(newsDoc));
    // Ensure id exists (Mongoose .lean() might not include virtuals like .id)
    if (!newsItem.id && newsItem._id) {
        newsItem.id = newsItem._id.toString();
    }

    return <EditNewsClient initialData={newsItem} />;
}


// Client wrapper to handle submission logic
