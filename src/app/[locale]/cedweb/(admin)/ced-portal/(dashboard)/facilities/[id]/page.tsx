import EditFacilityClient from "./EditFacilityClient";
import { notFound } from "@/i18n/navigation";
import dbConnect from "@/lib/mongoose";
import Facility from "@/collections/Facility";
import { IFacility } from "@/collections/Facility";

export default async function EditFacilityPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    await dbConnect();

    // Decode ID (url encoded)
    const decodedId = decodeURIComponent(id);
    const facility = await Facility.findOne({ id: decodedId }).lean<IFacility>();

    if (!facility) {
        notFound();
    }

    // Convert _id to string for serialization
    const serializedFacility = {
        ...facility,
        _id: facility._id?.toString(),
        createdAt: facility.createdAt?.toISOString(),
        updatedAt: facility.updatedAt?.toISOString()
    };

    // Need to cast to compatible type for Client Component (ignoring mongoose internals)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return <EditFacilityClient initialData={serializedFacility as any} />;
}
