import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import ServicesPageClient from "./ServicesPageClient";
import { getApiBaseUrl } from "@/lib/api-config";

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
    title: tMeta("servicesTitle"),
  };
}

async function getServices(locale: string) {
  const baseUrl = getApiBaseUrl();
  try {
    const res = await fetch(`${baseUrl}/api/public/student-services?locale=${locale}`, { cache: 'no-store' });
    if (!res.ok) return [];
    return res.json();
  } catch (error) {
    console.error("Failed to fetch student services:", error);
    return [];
  }
}

export default async function ServicesPage({ params }: PageParams) {
  const { locale } = await params;
  const services = await getServices(locale);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <ServicesPageClient initialServices={services as any} />;
}