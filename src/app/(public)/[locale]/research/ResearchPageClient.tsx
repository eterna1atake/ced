"use client"

import Breadcrumbs from "@/components/common/Breadcrumbs";
import FloatingBackButton from "@/components/common/FloatingBackButton";
import { useLocale, useTranslations } from "next-intl";
import HeroBanner from "@/components/common/HeroBanner";
import { faDatabase, faBookOpen, faFlask } from "@fortawesome/free-solid-svg-icons";
import ResearchCard from "@/components/research/ResearchCard";
import Image from "next/image";

export default function ResearchPageClient() {
    const t = useTranslations("ResearchPage");
    const breadcrumb = useTranslations("Breadcrumbs");
    const locale = useLocale();
    return (
        <main>
            <HeroBanner
                title={t("title")}
                description={t("description")}
                eyebrow={t("eyebrow")}
                imageAlt={t("title")}
            />

            <section className="mx-auto w-full max-w-7xl px-6 lg:px-10">
                <div className="border-b border-slate-200 bg-slate-50/80 py-4">
                    <Breadcrumbs
                        items={[
                            { href: `/${locale}`, label: breadcrumb("home") },
                            { label: breadcrumb("research") },
                        ]}
                    />
                </div>
                <FloatingBackButton />
            </section>

            <section className="mx-auto w-full max-w-7xl px-6 py-16 lg:px-10 z-10 relative">
                <div className="flex flex-col gap-16">
                    {/* Intro Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-bold text-primary-main dark:text-white mb-2 tracking-tight">
                                {t("introTitle")}
                            </h2>
                            <h3 className="text-xl md:text-2xl font-medium text-slate-600 mb-4">
                                {t("introHighlight")}
                            </h3>
                            <div className="w-16 h-1 bg-slate-600 mb-6"></div>

                            <p className="text-slate-600 text-lg leading-relaxed mb-4">
                                {t("introText1")}
                            </p>
                            <p className="text-slate-600 text-lg leading-relaxed">
                                {t("introText2")}
                            </p>
                        </div>

                        <div className="relative h-[300px] md:h-[400px] overflow-hidden shadow-2xl">
                            <Image
                                src="/images/asset/research.jpg"
                                alt="Computer Education Research"
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-primary-main/60 via-transparent to-transparent pointer-events-none"></div>
                        </div>
                    </div>

                    {/* Resources Section */}
                    <div className="flex flex-col w-full">
                        <div className="flex flex-col items-center text-center mb-6">
                            <h2 className="text-2xl md:text-3xl font-bold text-[#1F242D] mb-2 tracking-tight inline-block border-b-4 border-primary-main pb-1">
                                {t("sectionTitle")}
                            </h2>
                            <p className="text-slate-600 max-w-2xl text-lg relative z-10 block w-full whitespace-normal">
                                {t("sectionDesc")}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16 mt-4 mb-8">
                            <ResearchCard
                                title={t("databaseTitle")}
                                description={t("databaseDesc")}
                                icon={faDatabase}
                                link="https://www.research.kmutnb.ac.th/project/"
                                actionText={t("visitWebsite")}
                            />
                            <ResearchCard
                                title={t("journalTitle")}
                                description={t("journalDesc")}
                                icon={faBookOpen}
                                link="https://so10.tci-thaijo.org/index.php/FTEJournal"
                                actionText={t("visitWebsite")}
                            />
                            <ResearchCard
                                title={t("kjournalTitle")}
                                description={t("kjournalDesc")}
                                icon={faFlask}
                                link="https://ph01.tci-thaijo.org/index.php/kmutnb-journal"
                                actionText={t("visitWebsite")}
                            />
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}