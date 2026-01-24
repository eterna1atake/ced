import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import AboutPageClient from "./AboutPageClient";

type PageParams = {
  params: Promise<{
    locale: string;
  }>;
};

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { locale } = await params;
  const tMeta = await getTranslations({ locale, namespace: "Meta" });

  return {
    title: tMeta("aboutTitle"),
  };
}

export default function AboutPage() {
  return <AboutPageClient />;
}
