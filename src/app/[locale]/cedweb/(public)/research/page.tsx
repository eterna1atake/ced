import { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import ResearchPageClient from "./ResearchPageClient";

type PageParams = {
    params: Promise<{
        locale: string;
    }>;
};

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
    const { locale } = await params;
    const tMeta = await getTranslations({ locale, namespace: "Meta" });

    return {
        title: tMeta("researchTitle"),
    };
}


export default function ApplyPage() {
    return <ResearchPageClient />;
}