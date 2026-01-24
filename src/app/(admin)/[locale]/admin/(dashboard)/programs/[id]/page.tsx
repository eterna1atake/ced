import dbConnect from "@/lib/mongoose";
import Program from "@/collections/Program";
import { notFound } from "next/navigation";
import EditProgramClient from "./EditProgramClient";
import { PROGRAMS_SEED } from "@/data/programs";

export const dynamic = 'force-dynamic';

export async function generateStaticParams() {
    return PROGRAMS_SEED.map((program) => ({
        id: program.id,
    }));
}

export default async function EditProgramPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    await dbConnect();
    const programData = await Program.findOne({ id }).lean();

    if (!programData) {
        notFound();
    }

    // Map MongoDB data to props
    const initialData = {
        id: programData.id,
        level: programData.level,
        imageSrc: programData.imageSrc,
        imageAlt: programData.imageAlt,
        link: programData.link,
        th: programData.th,
        en: programData.en,
    };

    const initialDetailData = programData.detail;

    // Fix: Ensure plain objects are passed to Client Components
    const plainInitialData = JSON.parse(JSON.stringify(initialData));
    const plainInitialDetailData = JSON.parse(JSON.stringify(initialDetailData));

    return <EditProgramClient initialData={plainInitialData} initialDetailData={plainInitialDetailData} />;
}
