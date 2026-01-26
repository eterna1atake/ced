"use client";

import Breadcrumbs from "@/components/common/Breadcrumbs";
import HeroBanner from "@/components/common/HeroBanner";
import Pagination from "@/components/common/Pagination";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { LocalizedString } from "@/types/common";
import FloatingBackButton from "@/components/common/FloatingBackButton";

import { Service, ServiceCategory } from "@/types/service";

const categoryLabels: Record<"all" | ServiceCategory, LocalizedString> = {
    all: { th: "ทั้งหมด", en: "All" },
    software: { th: "ซอฟต์แวร์", en: "Software" },
    account: { th: "บัญชีผู้ใช้งาน", en: "User Account" },
    network: { th: "ระบบเครือข่าย", en: "Network" },
    "information-system": { th: "ระบบสารสนเทศ", en: "Information System" },
    "service-area": { th: "พื้นที่บริการ", en: "Service Area" },
    other: { th: "อื่นๆ", en: "Other" },
};

export default function ServicesPageClient({ initialServices = [] }: { initialServices?: Service[] }) {
    const locale = useLocale();
    const lang = locale as keyof LocalizedString;
    const t = useTranslations("ServicesPage");
    const breadcrumb = useTranslations("Breadcrumbs");

    const [services] = useState<Service[]>(initialServices);
    const [isLoading] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<"all" | ServiceCategory>("all");
    const [tabUnderlineLeft, setTabUnderlineLeft] = useState(0);
    const [tabUnderlineWidth, setTabUnderlineWidth] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    const tabsRef = useRef<(HTMLButtonElement | null)[]>([]);
    const containerRef = useRef<HTMLDivElement>(null);

    const categories = (Object.keys(categoryLabels) as Array<"all" | ServiceCategory>).map((id) => ({
        id,
        label: categoryLabels[id][lang]
    }));


    useEffect(() => {
        const activeTabIndex = categories.findIndex(c => c.id === selectedCategory);
        const currentTab = tabsRef.current[activeTabIndex];
        const container = containerRef.current;

        if (currentTab && container) {
            const textSpan = currentTab.querySelector("span");
            if (textSpan && textSpan instanceof HTMLElement) {
                setTabUnderlineLeft(currentTab.offsetLeft + textSpan.offsetLeft);
                setTabUnderlineWidth(textSpan.offsetWidth);
            }
        }
    }, [selectedCategory, lang, categories]);

    const filteredServices = selectedCategory === "all"
        ? services
        : services.filter(service => service.category === selectedCategory);

    useEffect(() => {
        setCurrentPage(1);
    }, [selectedCategory]);

    const totalPages = Math.ceil(filteredServices.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedServices = filteredServices.slice(startIndex, endIndex);

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
                            { label: breadcrumb("services") },
                        ]}
                    />
                </div>
                <FloatingBackButton />
            </section>

            <section className="mx-auto w-full max-w-5xl px-6 py-4 text-center lg:px-10">
                <div className="relative border-b border-slate-200">
                    <div
                        ref={containerRef}
                        className="flex flex-nowrap overflow-x-auto gap-6 relative [&::-webkit-scrollbar]:hidden -mb-[1px]"
                    >
                        {categories.map((category, index) => (
                            <button
                                key={category.id}
                                ref={(el) => { tabsRef.current[index] = el; }}
                                onClick={() => setSelectedCategory(category.id)}
                                className={`relative px-4 py-2 text-base font-semibold transition-colors whitespace-nowrap ${selectedCategory === category.id
                                    ? "text-primary-main"
                                    : "text-slate-500 hover:text-slate-700"
                                    }`}
                            >
                                <span>{category.label}</span>
                            </button>
                        ))}
                        <span
                            className="absolute bottom-0 block h-1 bg-primary-main rounded-full transition-all duration-300 ease-in-out"
                            style={{ left: tabUnderlineLeft, width: tabUnderlineWidth }}
                        />
                    </div>
                </div>
            </section>

            {/* Services Grid */}
            <section className="mx-auto w-full max-w-7xl px-6 py-6 lg:px-10 min-h-[400px]">
                {isLoading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-main"></div>
                    </div>
                ) : filteredServices.length === 0 ? (
                    <div className="text-center py-20 text-slate-500">
                        No services found in this category.
                    </div>
                ) : (
                    <div className="grid gap-6 grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                        {paginatedServices.map((service, index) => (
                            <div
                                key={service._id || service.id}
                                className="group cursor-pointer overflow-hidden rounded-2xl bg-white shadow-md transition-all duration-300 hover:shadow-xl animate-in fade-in slide-in-from-bottom-4"
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                <div className="flex flex-col items-center p-4 md:p-8">
                                    <div className="relative h-14 w-14 md:h-24 md:w-24 mb-2 md:mb-6">
                                        <Image
                                            src={service.icon}
                                            alt={service.title[lang]}
                                            fill
                                            className="object-contain"
                                        />
                                    </div>

                                    <h3 className="text-center text-base md:text-lg font-semibold text-slate-800 mb-6 min-h-[3rem] flex items-center">
                                        {service.title[lang]}
                                    </h3>

                                    {service.link && (
                                        <Link
                                            href={service.link.startsWith("http") ? service.link : `/${locale}${service.link}`}
                                            target={service.link.startsWith("http") ? "_blank" : undefined}
                                            rel={service.link.startsWith("http") ? "noopener noreferrer" : undefined}
                                            className="px-4 md:px-6 py-1 md:py-2 rounded-full border-2 border-[#35622F] text-[#35622F] font-medium text-sm transition-all duration-300 hover:bg-[#35622F] hover:text-white hover:shadow-lg"
                                        >
                                            {lang === 'th' ? "ดูเพิ่มเติม" : "View More"}
                                        </Link>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {totalPages > 1 && (
                    <Pagination
                        className="mt-12 flex justify-center items-center gap-2"
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
                )}
            </section>
        </main>
    );
}