import type { Metadata } from "next";
import { getTranslations, getLocale } from "next-intl/server";

import CEDProgramPageClient from "./CEDProgramPageClient";

type PageParams = {
    params: Promise<{
        locale: string;
    }>;
};

export async function generateMetadata({
    params,
}: PageParams): Promise<Metadata> {
    const locale = await getLocale();
    const tMeta = await getTranslations({ locale, namespace: "Meta" });

    return {
        title: tMeta("programsTitle"),
    };
}

export default function ProgramsPage() {
    return <CEDProgramPageClient />;
}
