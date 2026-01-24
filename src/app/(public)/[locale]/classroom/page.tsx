import { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import ClassroomPageClient from "./ClassroomPageClient";

type PageParams = {
  params: Promise<{
    locale: string;
  }>;
};

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { locale } = await params;
  const tMeta = await getTranslations({ locale, namespace: "Meta" });

  return {
    title: tMeta("classroomTitle"),
  };
}


export default function ClassroomPage() {
  return <ClassroomPageClient />;
}