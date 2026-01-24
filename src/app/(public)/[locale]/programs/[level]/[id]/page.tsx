import type { Metadata } from "next";
import dbConnect from "@/lib/mongoose";
import Program from "@/collections/Program";
import { notFound } from "next/navigation";
import ProgramDetailTemplate from "@/components/programs/ProgramDetailTemplate";

type PageParams = {
    params: Promise<{
        locale: string;
        level: string;
        id: string;
    }>;
};

export async function generateMetadata({
    params,
}: PageParams): Promise<Metadata> {
    const { locale, id } = await params;
    await dbConnect();
    const program = await Program.findOne({ id }).lean();

    if (!program) {
        return {
            title: "Program Not Found",
        };
    }

    const lang = locale === 'th' ? 'th' : 'en';
    return {
        title: (program as any)[lang]?.title || "Program Detail",
    };
}

export default async function ProgramDetailPage({ params }: PageParams) {
    const { locale, id } = await params;
    await dbConnect();

    // Find the program by ID
    const program = await Program.findOne({ id }).lean();

    if (!program || !program.detail) {
        notFound();
    }

    const lang = locale === 'th' ? 'th' : 'en';

    // Ensure we only pass plain objects to Client Components
    const plainDetail = JSON.parse(JSON.stringify(program.detail));

    return (
        <ProgramDetailTemplate
            data={plainDetail}
            breadcrumbLabel={(program as any)[lang]?.title || "Program Detail"}
        />
    );
}
