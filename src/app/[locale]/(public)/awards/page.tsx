import { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import AwardsPageClient from "./AwardsPageClient";

type PageParams = {
  params: Promise<{
    locale: string;
  }>;
};

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { locale } = await params;
  const tMeta = await getTranslations({ locale, namespace: "Meta" });

  return {
    title: tMeta("awardsTitle"),
  };
}

export default async function AwardsPage({ params }: PageParams) {
  const { locale } = await params;
  return <AwardsPageClient />;
}