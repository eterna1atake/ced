import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getApiBaseUrl } from "@/lib/api-config";

import NewsAndEventsClient from "./NewsAndEventsClient";

type PageParams = {
  params: Promise<{
    locale: string;
  }>;
};

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { locale } = await params;
  const tMeta = await getTranslations({ locale, namespace: "Meta" });

  return {
    title: tMeta("newsListTitle"),
  };
}

async function getNews() {
  const baseUrl = getApiBaseUrl();
  try {
    const res = await fetch(`${baseUrl}/api/public/news`, {
      cache: 'no-store' // Ensure fresh data on every request, or use revalidate if preferred
    });
    if (!res.ok) return [];
    return res.json();
  } catch (error) {
    console.error("Failed to fetch news:", error);
    return [];
  }
}

export default async function NewsAndEventsPage() {
  const news = await getNews();

  return <NewsAndEventsClient initialNews={news} />;
}
