import { Metadata } from "next";
import { getTranslations, getLocale } from "next-intl/server";

import ApplyPageClient from "./ApplyPageClient";

type PageParams = {
    params: Promise<{
        locale: string;
    }>;
};

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
    const locale = await getLocale();
    const tMeta = await getTranslations({ locale, namespace: "Meta" });

    return {
        title: tMeta("applyTitle"),
    };
}


export default function ApplyPage() {
    return <ApplyPageClient />;
}