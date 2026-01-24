import EditClassroomClient from "./EditClassroomClient";
import { notFound } from "next/navigation";
import dbConnect from "@/lib/mongoose";
import Classroom from "@/collections/Classroom";
import { IClassroom } from "@/collections/Classroom";

export default async function EditClassroomPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    await dbConnect();

    // Decode ID (url encoded)
    const decodedId = decodeURIComponent(id);
    const classroom = await Classroom.findOne({ id: decodedId }).lean<IClassroom>();

    if (!classroom) {
        notFound();
    }

    // Convert _id to string for serialization
    const serializedClassroom = {
        ...classroom,
        _id: classroom._id?.toString(),
        createdAt: classroom.createdAt?.toISOString(),
        updatedAt: classroom.updatedAt?.toISOString()
    };

    // Need to cast to compatible type for Client Component (ignoring mongoose internals)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return <EditClassroomClient initialData={serializedClassroom as any} />;
}
