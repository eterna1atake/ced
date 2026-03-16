import { notFound } from "next/navigation";
import dbConnect from "@/lib/mongoose";
import Award from "@/collections/Award";
import EditAwardClient from "./EditAwardClient";
import { isValidObjectId } from "mongoose";

type PageProps = {
    params: Promise<{
        id: string;
    }>;
};

export default async function EditAwardPage({ params }: PageProps) {
    const { id } = await params;

    // Validate if it's a valid MongoDB ObjectId
    if (!isValidObjectId(id)) {
        notFound();
    }

    await dbConnect();
    const award = await Award.findById(id).lean();

    if (!award) {
        notFound();
    }

    // Convert MongoDB document to plain object and handle _id to id string
    const sanitizedAward = JSON.parse(JSON.stringify(award));

    return <EditAwardClient initialData={sanitizedAward} />;
}
