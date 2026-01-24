import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import ContactUsPageClient from "./ContactUsPageClient";

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
    title: tMeta("contactUsTitle"),
  };
}

export default function ProgramsPage() {
  return <ContactUsPageClient />;
}
