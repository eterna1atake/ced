import { notFound } from "next/navigation";
import EditPersonnelClient from "./EditPersonnelClient";
import dbConnect from "@/lib/mongoose";
import Personnel from "@/collections/Personnel";

type PageProps = {
    params: Promise<{
        id: string;
    }>;
};

export default async function EditPersonnelPage({ params }: PageProps) {
    const { id } = await params;

    await dbConnect();
    // Use lean() for better performance as we just need the JS object
    // JSON.parse(JSON.stringify()) is needed because Mongoose objects have methods/types that can't be passed to client components directly
    const personDoc = await Personnel.findById(id).lean();

    if (!personDoc) {
        notFound();
    }

    // Convert _id to string and handle other non-serializable fields if any
    const person = JSON.parse(JSON.stringify(personDoc));

    return <EditPersonnelClient initialData={person} />;
}
