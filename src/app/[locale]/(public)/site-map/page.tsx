import type { Metadata } from "next";
import { getTranslations, getLocale } from "next-intl/server";

import SitemapPageClient from "./SitemapPageClient";

type PageParams = {
    params: Promise<{
        locale: string;
    }>;
};

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
    const locale = await getLocale();
    const tMeta = await getTranslations({ locale, namespace: "Meta" });

    return {
        title: tMeta("sitemapTitle"),
    };
}

export default function SitemapPage() {
    return <SitemapPageClient />;
}
