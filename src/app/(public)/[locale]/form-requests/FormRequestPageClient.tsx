
"use client";

import Breadcrumbs from "@/components/common/Breadcrumbs";
import HeroBanner from "@/components/common/HeroBanner";
import FloatingBackButton from "@/components/common/FloatingBackButton";
import { useLocale, useTranslations } from "next-intl";
import { useState, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faFileArrowDown } from "@fortawesome/free-solid-svg-icons";

export interface FormRequestItem {
    _id: string;
    categoryId: string;
    sectionId: string;
    url: string;
    th: { name: string };
    en: { name: string };
}

interface FormRequestPageClientProps {
    initialForms?: FormRequestItem[];
}

// These matches static structure for UI labels but data comes from initialForms
const CATEGORIES_CONFIG = [
    { id: "academic", th: "งานบริการวิชาการ", en: "Academic Services" },
    { id: "coop", th: "สหกิจศึกษา", en: "Cooperative Education" }
];

const SECTIONS_CONFIG: Record<string, { id: string, th: string, en: string }[]> = {
    academic: [
        { id: "academic-forms", th: "ใบคำร้องภาควิชา", en: "Department Forms" },
        { id: "university-regulations", th: "ประกาศ ระเบียบมหาวิทยาลัย", en: "University Regulations" }
    ],
    coop: [
        { id: "coop-docs", th: "เอกสารสหกิจศึกษา", en: "Cooperative Education Documents" }
    ]
};

export default function FormRequestPageClient({ initialForms = [] }: FormRequestPageClientProps) {
    const locale = useLocale();
    const isThai = locale === "th";
    const t = useTranslations("FormRequestsPage");
    const breadcrumb = useTranslations("Breadcrumbs");

    const [activeCategory, setActiveCategory] = useState<string>("academic");
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
        "academic-forms": true,
        "university-regulations": true,
        "coop-docs": true
    });

    // Group forms by category and section
    const groupedData = useMemo(() => {
        const result: Record<string, Record<string, FormRequestItem[]>> = {};

        initialForms.forEach(form => {
            if (!result[form.categoryId]) result[form.categoryId] = {};
            if (!result[form.categoryId][form.sectionId]) result[form.categoryId][form.sectionId] = [];
            result[form.categoryId][form.sectionId].push(form);
        });

        return result;
    }, [initialForms]);

    const toggleSection = (id: string) => {
        setExpandedSections((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
    };

    const activeCategoryConfig = CATEGORIES_CONFIG.find(c => c.id === activeCategory);
    const activeSections = SECTIONS_CONFIG[activeCategory] || [];

    return (
        <main className="flex-grow bg-slate-50/30">
            <HeroBanner
                title={t("title")}
                description={t("description")}
                eyebrow={t("eyebrow")}
                imageAlt="Documents"
            />

            <section className="mx-auto w-full max-w-7xl px-6 lg:px-10">
                <div className="border-b border-slate-200 bg-slate-50/80 py-4">
                    <Breadcrumbs
                        items={[
                            { href: `/${locale}`, label: breadcrumb("home") },
                            { href: `/${locale}/student-services`, label: breadcrumb("services") },
                            { label: t("title") },
                        ]}
                    />
                </div>
                <FloatingBackButton />
            </section>

            <section className="mx-auto w-full max-w-7xl px-6 py-12 lg:px-10">
                <div className="flex flex-col lg:flex-row gap-10">
                    {/* Sidebar */}
                    <aside className="w-full lg:w-72 flex-shrink-0">
                        <div className="sticky top-24 space-y-4">
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                                <div className="p-4 bg-slate-50 border-b border-slate-200">
                                    <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Categories</h3>
                                </div>
                                <div className="p-2 space-y-1">
                                    {CATEGORIES_CONFIG.map((category) => (
                                        <button
                                            key={category.id}
                                            onClick={() => setActiveCategory(category.id)}
                                            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-semibold transition-all group ${activeCategory === category.id
                                                ? "bg-[#35622F] text-white shadow-md shadow-[#35622F]/20"
                                                : "text-slate-600 hover:bg-slate-50 hover:text-[#35622F]"
                                                }`}
                                        >
                                            <span>{isThai ? category.th : category.en}</span>
                                            <div className={`w-1.5 h-1.5 rounded-full transition-all ${activeCategory === category.id ? "bg-white" : "bg-transparent group-hover:bg-[#35622F]/30"
                                                }`} />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* Content Area */}
                    <div className="flex-grow space-y-8">
                        <div className="flex items-baseline justify-between border-b border-slate-200 pb-4">
                            <h2 className="text-2xl font-bold text-slate-800">
                                {isThai ? activeCategoryConfig?.th : activeCategoryConfig?.en}
                            </h2>
                            <span className="text-sm text-slate-500 font-medium">
                                {initialForms.filter(f => f.categoryId === activeCategory).length} Documents
                            </span>
                        </div>

                        <div className="space-y-6">
                            {activeSections.map((section) => {
                                const sectionForms = groupedData[activeCategory]?.[section.id] || [];
                                if (sectionForms.length === 0 && !expandedSections[section.id]) return null;

                                return (
                                    <div key={section.id} className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden transition-all hover:shadow-md">
                                        <button
                                            onClick={() => toggleSection(section.id)}
                                            className="w-full flex items-center justify-between px-6 py-5 bg-white hover:bg-slate-50/50 transition-colors group text-left"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all duration-300 ${expandedSections[section.id]
                                                    ? "bg-[#35622F] border-[#35622F] text-white shadow-lg shadow-[#35622F]/20"
                                                    : "bg-slate-50 border-slate-200 text-slate-400 group-hover:border-[#35622F]/30"
                                                    }`}>
                                                    <FontAwesomeIcon
                                                        icon={faChevronDown}
                                                        className={`w-3.5 h-3.5 transition-transform duration-300 ${expandedSections[section.id] ? "rotate-0" : "-rotate-90"}`}
                                                    />
                                                </div>
                                                <span className="font-bold text-slate-800 text-lg transition-colors group-hover:text-[#35622F]">
                                                    {isThai ? section.th : section.en}
                                                </span>
                                            </div>
                                            {sectionForms.length > 0 && (
                                                <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter">
                                                    {sectionForms.length} Files
                                                </span>
                                            )}
                                        </button>

                                        {expandedSections[section.id] && (
                                            <div className="px-6 pb-6 pt-0 border-t border-slate-50 animate-slide-down">
                                                {sectionForms.length > 0 ? (
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                                                        {sectionForms.map((item) => (
                                                            <a
                                                                key={item._id}
                                                                href={item.url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-[#35622F]/30 hover:shadow-md hover:translate-y-[-2px] transition-all group"
                                                            >
                                                                <div className="w-12 h-12 rounded-xl bg-white border border-slate-100 flex items-center justify-center shadow-sm group-hover:bg-[#35622F] group-hover:text-white transition-all">
                                                                    <FontAwesomeIcon icon={faFileArrowDown} className="w-5 h-5 text-slate-400 group-hover:text-white" />
                                                                </div>
                                                                <div className="flex-grow min-w-0">
                                                                    <div className="font-bold text-slate-700 truncate group-hover:text-[#35622F] transition-colors">
                                                                        {isThai ? item.th.name : item.en.name}
                                                                    </div>
                                                                    <div className="text-[10px] text-slate-400 font-medium uppercase tracking-widest mt-0.5">
                                                                        Download Resource
                                                                    </div>
                                                                </div>
                                                            </a>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="py-10 text-center">
                                                        <div className="text-slate-300 italic text-sm">{t("emptyCategory")}</div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}