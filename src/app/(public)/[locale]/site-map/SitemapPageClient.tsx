"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";

import HeroBanner from "@/components/common/HeroBanner";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import FloatingBackButton from "@/components/common/FloatingBackButton";

type SiteNode = {
    label: string;
    url?: string;
    isExternal?: boolean;
    children?: SiteNode[];
};

export default function SitemapPageClient() {
    const t = useTranslations("Sitemap");
    const breadcrumb = useTranslations("Breadcrumbs");
    const locale = useLocale();

    // Detailed Hierarchical Sitemap Structure
    const siteTree: SiteNode[] = [
        {
            label: locale === 'th' ? "หน้าแรก (Home)" : "Home",
            url: `/${locale}`,
        },
        {
            label: locale === 'th' ? "เกี่ยวกับภาควิชา (About Department)" : "About Department",
            url: `/${locale}/about`,
        },
        {
            label: locale === 'th' ? "บุคลากร (Personnel)" : "Personnel",
            url: `/${locale}/personnel`,
        },
        {
            label: locale === 'th' ? "หลักสูตรการศึกษา (Academic Programs)" : "Academic Programs",
            children: [
                {
                    label: locale === 'th' ? "ระดับปริญญาตรี (Bachelor's Degree)" : "Bachelor's Degree",
                    children: [
                        { label: locale === 'th' ? "ค.อ.บ. เทคโนโลยีคอมพิวเตอร์ (CED)" : "B.S.Tech.Ed. Computer Technology (CED)", url: `/${locale}/programs/bachelor/ced` },
                        { label: locale === 'th' ? "ค.อ.บ. เทคโนโลยีคอมพิวเตอร์ (TCT - เทียบโอน)" : "B.S.Tech.Ed. Computer Technology (TCT - Regular)", url: `/${locale}/programs/bachelor/tct` },
                    ]
                },
                {
                    label: locale === 'th' ? "ระดับปริญญาโท (Master's Degree)" : "Master's Degree",
                    children: [
                        { label: locale === 'th' ? "ค.อ.ม. เทคโนโลยีคอมพิวเตอร์ - ภาคปกติ (MTCT)" : "M.S.Tech.Ed. Computer Technology - Regular (MTCT)", url: `/${locale}/programs/master/mtct` },
                        { label: locale === 'th' ? "ค.อ.ม. เทคโนโลยีคอมพิวเตอร์ - ภาคสมทบ (SMTCT)" : "M.S.Tech.Ed. Computer Technology - Special (SMTCT)", url: `/${locale}/programs/master/smtct` },
                    ]
                },
                {
                    label: locale === 'th' ? "ระดับปริญญาเอก (Doctoral Degree)" : "Doctoral Degree (Ph.D.)",
                    children: [
                        { label: locale === 'th' ? "ค.อ.ด. เทคโนโลยีคอมพิวเตอร์ (DTCT)" : "Ph.D. Computer Technology (DTCT)", url: `/${locale}/programs/phd/dtct` },
                    ]
                },
            ]
        },
        {
            label: locale === 'th' ? "บริการและระบบต่างๆ (Services & Systems)" : "Services & Systems",
            children: [
                { label: t("studentServices"), url: `/${locale}/student-services` },
                { label: t("formRequests"), url: `/${locale}/form-requests` },
                { label: t("facilities"), url: `/${locale}/facilities` },
                { label: t("onlineLearning"), url: `/${locale}/online-learning-resources` },
            ]
        },
        {
            label: locale === 'th' ? "การแนะแนวและรับสมัคร (Admissions)" : "Admissions",
            children: [
                { label: t("apply"), url: "https://admission.kmutnb.ac.th/", isExternal: true },
            ]
        },
        {
            label: locale === 'th' ? "งานวิจัยและนวัตกรรม (Research & Innovation)" : "Research & Innovation",
            children: [
                { label: t("research"), url: "https://research.kmutnb.ac.th", isExternal: true },
                { label: t("awards"), url: `/${locale}/awards` },
            ]
        },
        {
            label: t("news"),
            url: `/${locale}/newsandevents`,
        },
        {
            label: t("contact"),
            url: `/${locale}/contact-us`,
        }
    ];

    const renderTree = (nodes: SiteNode[], level = 0) => {
        return (
            <div className={`flex flex-col ${level > 0 ? "ml-6 md:ml-10 border-l border-slate-300 mt-1" : "space-y-3"}`}>
                {nodes.map((node, index) => {
                    const hasChildren = node.children && node.children.length > 0;
                    return (
                        <div key={index} className="relative">
                            {/* Horizontal line connector */}
                            {level > 0 && (
                                <div className="absolute -left-[1px] top-5 w-4 md:w-6 h-[1px] bg-slate-300"></div>
                            )}

                            <div className="flex flex-col py-1 pl-5 md:pl-8">
                                <div className="flex items-start gap-3">
                                    {level === 0 && (
                                        <div className="w-2 h-2 bg-primary-main mt-2.5 shrink-0"></div>
                                    )}
                                    {node.url ? (
                                        <Link
                                            href={node.url}
                                            target={node.isExternal ? "_blank" : undefined}
                                            rel={node.isExternal ? "noopener noreferrer" : undefined}
                                            className="inline-flex items-center gap-2.5"
                                        >
                                            <span className={`text-[#1F242D]hover:underline ${level === 0 ? "font-bold text-xl uppercase tracking-tight" : "text-base font-normal"}`}>
                                                {node.label}
                                            </span>
                                            {node.isExternal && (
                                                <span className="text-[10px] text-slate-400 font-mono italic">(external)</span>
                                            )}
                                        </Link>
                                    ) : (
                                        <span className={`${level === 0 ? "font-bold text-xl text-[#1F242D] uppercase tracking-tight" : "font-semibold text-primary-main"}`}>
                                            {node.label}
                                        </span>
                                    )}
                                </div>

                                {/* Recursive children */}
                                {hasChildren && renderTree(node.children!, level + 1)}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <main className="bg-white min-h-screen">
            <HeroBanner
                title={t("title")}
                description={t("description")}
            />

            <section className="mx-auto w-full max-w-7xl px-6 lg:px-10">
                <div className="border-b border-slate-100 py-4">
                    <Breadcrumbs
                        items={[
                            { href: `/${locale}`, label: breadcrumb("home") },
                            { label: breadcrumb("sitemap") },
                        ]}
                    />
                </div>
                <FloatingBackButton />
            </section>

            <section className="mx-auto w-full max-w-6xl px-6 py-10 lg:px-10">
                <div className="flex flex-col gap-2 mb-8">
                    <h2 className="text-3xl font-bold text-[#1F242D]">
                        {t("title")}
                    </h2>
                    <p className="text-slate-500 text-lg">
                        {t("description")}
                    </p>
                </div>
                {renderTree(siteTree)}
            </section>
        </main>
    );
}
