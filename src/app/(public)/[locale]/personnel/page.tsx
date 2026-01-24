import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import PersonnelPageClient from "./PersonnelPageClient";
import { getApiBaseUrl } from "@/lib/api-config";

type PageParams = {
  params: Promise<{
    locale: string;
  }>;
};

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { locale } = await params;
  const tMeta = await getTranslations({ locale, namespace: "Meta" });

  return {
    title: tMeta("personnelTitle"),
  };
}

async function getPersonnel() {
  const baseUrl = getApiBaseUrl();
  try {
    const res = await fetch(`${baseUrl}/api/public/personnel`, { cache: 'no-store' });
    if (!res.ok) return [];
    return res.json();
  } catch (error) {
    console.error("Failed to fetch personnel:", error);
    return [];
  }
}

export default async function StaffPage() {
  const allPersonnel = await getPersonnel();

  return <PersonnelPageClient allPersonnel={allPersonnel} />;
}
