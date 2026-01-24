import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import OnlineLearningPageClient from "./OnlineLearningPageClient";
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
    title: tMeta("onlineLearningTitle"),
  };
}

async function getResources() {
  const baseUrl = getApiBaseUrl();
  try {
    const res = await fetch(`${baseUrl}/api/public/online-resources`, { cache: 'no-store' });
    if (!res.ok) return [];
    return res.json();
  } catch (error) {
    console.error("Failed to fetch online resources:", error);
    return [];
  }
}

export default async function OnlineLearningPage({ params }: PageParams) {
  await params;
  const initialResources = await getResources();

  return <OnlineLearningPageClient initialResources={initialResources} />;
}
