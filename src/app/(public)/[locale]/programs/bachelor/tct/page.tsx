import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import TCTProgramPageClient from "./TCTProgramPageClient";

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
        title: tMeta("programsTitle"),
    };
}

export default function ProgramsPage() {
    return <TCTProgramPageClient />;
}
