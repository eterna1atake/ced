import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import dbConnect from "@/lib/mongoose";
import Program from "@/collections/Program";
import ProgramsPageClient from "./ProgramsPageClient";

export const dynamic = 'force-dynamic';

type PageParams = {
  params: Promise<{
    locale: string;
  }>;
};

export async function generateMetadata({
  params,
}: PageParams): Promise<Metadata> {
  const { locale } = await params;
  const tMeta = await getTranslations({ locale, namespace: "Meta" });

  return {
    title: tMeta("programsTitle"),
  };
}

export default async function ProgramsPage({ params }: PageParams) {
  const { locale } = await params;
  await dbConnect();
  const programs = await Program.find({}).sort({ level: 1 }).lean();

  // Map to the format expected by the client
  // Using next-intl Link in ProgramCard, so we don't need manual locale prefix
  const mappedPrograms = programs.map(p => {
    // Ensure link starts with /
    const rawLink = p.link || "";
    const cleanLink = rawLink.startsWith('/') ? rawLink : `/${rawLink}`;

    return {
      level: p.level,
      imageSrc: p.imageSrc,
      imageAlt: p.imageAlt,
      buttonLink: cleanLink,
      degree: p[locale === 'th' ? 'th' : 'en'].degree,
      title: p[locale === 'th' ? 'th' : 'en'].title,
      subtitle: p[locale === 'th' ? 'th' : 'en'].subtitle,
      description: p[locale === 'th' ? 'th' : 'en'].description,
    };
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <ProgramsPageClient initialPrograms={mappedPrograms as any} />;
}
