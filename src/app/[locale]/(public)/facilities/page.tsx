import { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import FacilityPageClient from "./FacilityPageClient";

type PageParams = {
  params: Promise<{
    locale: string;
  }>;
};

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { locale } = await params;
  const tMeta = await getTranslations({ locale, namespace: "Meta" });

  return {
    title: tMeta("facilityTitle"),
  };
}

export default async function FacilityPage({ params }: PageParams) {
  const { locale } = await params;
  return <FacilityPageClient />;
}