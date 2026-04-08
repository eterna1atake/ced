import { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import ApplyPageClient from "./ApplyPageClient";

type PageParams = {
    params: Promise<{
        locale: string;
    }>;
};

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
    const { locale } = await params;
    const tMeta = await getTranslations({ locale, namespace: "Meta" });

    return {
        title: tMeta("applyTitle"),
    };
}

export default async function ApplyPage({ params }: PageParams) {
    await params;
    return <ApplyPageClient />;
}