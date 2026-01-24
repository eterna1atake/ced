"use client";

import { Fragment } from "react";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import HeroBanner from "@/components/common/HeroBanner";
import { useLocale, useTranslations } from "next-intl";

import type { ProgramDetailData } from "@/types/program";

interface Props {
    data: ProgramDetailData;
    breadcrumbLabel: string;
}

export default function ProgramDetailTemplate({ data, breadcrumbLabel }: Props) {
    const locale = useLocale();
    const t = useTranslations("ProgramsPage");
    const breadcrumb = useTranslations("Breadcrumbs");
    const lang = locale === "th" ? "th" : "en";

    const totalCredits = data.curriculum.reduce(
        (acc, section) => acc + (parseInt(section.credits) || 0),
        0
    );

    return (
        <div className="relative">
            <main>
                <HeroBanner
                    title={t("title")}
                    description={t("description")}
                    eyebrow={t("eyebrow")}
                    imageAlt={t("title")}
                />

                <section className="border-b border-slate-200 bg-slate-50/80">
                    <div className="mx-auto w-full max-w-7xl px-6 py-4 lg:px-10">
                        <Breadcrumbs
                            items={[
                                { href: `/${locale}`, label: breadcrumb("home") },
                                { href: `/${locale}/programs`, label: breadcrumb("programs") },
                                { label: breadcrumbLabel },
                            ]}
                        />
                    </div>
                </section>

                <section className="mx-auto w-full max-w-7xl px-6 py-10 lg:px-10">
                    <h1 className="text-3xl font-bold text-black" data-aos="fade-up" suppressHydrationWarning>
                        {breadcrumbLabel}
                    </h1>
                    <div className="mt-10 w-full">
                        <section>
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                                <div className="relative h-full col-span-1 md:col-span-8 space-y-8">
                                    {/* Program Info */}
                                    <div data-aos="fade-up" suppressHydrationWarning>
                                        <h2 className="text-2xl font-bold text-slate-900">
                                            {lang === "th" ? "ข้อมูลหลักสูตร" : "Program Information"}
                                        </h2>
                                        <ul className="list-disc pl-5 md:pl-12 text-base font-normal text-slate-900 mt-4 space-y-1">
                                            <li>
                                                <strong>{lang === "th" ? "ชื่อเต็ม :" : "Full Name :"}</strong> {data.degree.full[lang]}
                                            </li>
                                            <li>
                                                <strong>{lang === "th" ? "ชื่อย่อ :" : "Abbreviation :"}</strong> {data.degree.short[lang]}
                                            </li>
                                        </ul>
                                    </div>

                                    {/* Program Format */}
                                    {data.programFormat?.items && data.programFormat.items.length > 0 && (
                                        <div data-aos="fade-up" suppressHydrationWarning className="mb-12">
                                            <h2 className="text-2xl font-bold text-slate-900 border-b-2 border-primary-main pb-2 mb-6">
                                                {data.programFormat.title[lang]}
                                            </h2>
                                            <div className="mt-4 space-y-6 pl-0 md:pl-2">
                                                {data.programFormat.items.map((item, index) => (
                                                    <div key={index} className="space-y-3">
                                                        <h3 className="text-lg font-bold text-slate-900 flex items-start gap-2">
                                                            <div className="w-2 h-2 rounded-full bg-primary-main mt-2.5 shrink-0" />
                                                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                                            {item.title ? (item.title as any)[lang] : (item as any)[lang]}
                                                        </h3>
                                                        {item.subItems && item.subItems.length > 0 && (
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 pl-6">
                                                                {item.subItems.map((sub, sIdx) => (
                                                                    <div key={sIdx} className="flex items-start gap-2 text-base font-normal text-slate-700">
                                                                        <span className="text-slate-400">•</span>
                                                                        {typeof sub === 'string' ? sub : sub[lang]}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Grad Attribute */}
                                    {data.gradAttribute?.items && data.gradAttribute.items.length > 0 && (
                                        <div data-aos="fade-up" suppressHydrationWarning>
                                            <h2 className="text-2xl font-bold text-slate-900">
                                                {data.gradAttribute.title[lang]}
                                            </h2>
                                            <div className="mt-4 space-y-4 pl-0 md:pl-10">
                                                {data.gradAttribute.items.map((item, index) => (
                                                    <div key={index} className="space-y-2">
                                                        <h3 className="text-base font-bold text-slate-900 flex items-start gap-2">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-primary-main mt-2 shrink-0"></span>
                                                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                                            {item.title ? (item.title as any)[lang] : (item as any)[lang]}
                                                        </h3>
                                                        {item.subItems && item.subItems.length > 0 && (
                                                            <ul className="list-disc pl-8 text-base font-normal text-slate-700 space-y-1">
                                                                {item.subItems.map((sub, sIdx) => (
                                                                    <li key={sIdx}>{typeof sub === 'string' ? sub : sub[lang]}</li>
                                                                ))}
                                                            </ul>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Major - Removed */}

                                    {/* Highlights - Removed */}

                                    {/* Career Opportunities (Suitable For) */}
                                    {data.suitableFor?.items && data.suitableFor.items.length > 0 && (
                                        <div data-aos="fade-up" suppressHydrationWarning>
                                            <h2 className="text-2xl font-bold text-slate-900">
                                                {data.suitableFor.title[lang]}
                                            </h2>
                                            <div className="mt-4 space-y-4 pl-0 md:pl-10">
                                                {data.suitableFor.items.map((item, index) => (
                                                    <div key={index} className="space-y-2">
                                                        <h3 className="text-base font-bold text-slate-900 flex items-start gap-2">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-primary-main mt-2 shrink-0"></span>
                                                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                                            {item.title ? (item.title as any)[lang] : (item as any)[lang]}
                                                        </h3>
                                                        {item.subItems && item.subItems.length > 0 && (
                                                            <ul className="list-disc pl-8 text-base font-normal text-slate-700 space-y-1">
                                                                {item.subItems.map((sub, sIdx) => (
                                                                    <li key={sIdx}>{typeof sub === 'string' ? sub : sub[lang]}</li>
                                                                ))}
                                                            </ul>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Sidebar Documents */}
                                <div
                                    className="h-full col-span-1 md:col-span-4 pl-0 md:pl-12 mt-8 md:mt-0"
                                    data-aos="fade-up"
                                    data-aos-delay="100"
                                    suppressHydrationWarning
                                >
                                    <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
                                        <h2 className="text-xl font-bold text-slate-900 mb-4">
                                            {lang === "th" ? "เอกสารหลักสูตร" : "Curriculum Documents"}
                                        </h2>
                                        <ul className="list-disc pl-5 text-base font-normal text-slate-900 space-y-2">
                                            {data.documents.map((doc, index) => (
                                                <li key={index}>
                                                    <a
                                                        href={doc.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-primary-main hover:underline break-words"
                                                    >
                                                        {doc.name[lang]}
                                                    </a>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Curriculum Structure */}
                        <section data-aos="fade-up" suppressHydrationWarning>
                            <div className="mt-12">
                                <h2 className="text-2xl font-bold text-slate-900">
                                    {lang === "th" ? "โครงสร้างหลักสูตร" : "Curriculum Structure"}
                                </h2>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200 mt-4 border">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th
                                                    scope="col"
                                                    className="px-2 md:px-5 py-3 text-left text-sm md:text-base font-semibold text-gray-700 uppercase tracking-wider"
                                                >
                                                    {lang === "th" ? "หมวดวิชา" : "Course Category"}
                                                </th>
                                                <th
                                                    scope="col"
                                                    className="border-l px-2 md:px-5 py-3 text-center text-sm md:text-base font-semibold text-gray-700 uppercase tracking-wider w-24 md:w-32"
                                                >
                                                    {lang === "th" ? "หน่วยกิต" : "Credits"}
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200 border-b">
                                            {data.curriculum.map((section, index) => (
                                                <Fragment key={index}>
                                                    <tr className="bg-slate-100/50">
                                                        <td className="px-2 md:px-3 py-3 whitespace-nowrap text-sm md:text-base font-bold text-slate-900">
                                                            {section.title[lang]}
                                                        </td>
                                                        <td className="border-l px-2 md:px-3 py-3 whitespace-nowrap text-sm md:text-base font-bold text-slate-900 text-center">
                                                            {section.credits}
                                                        </td>
                                                    </tr>
                                                    {section.items &&
                                                        section.items.map((item) => (
                                                            <Fragment key={item.id}>
                                                                <tr>
                                                                    <td
                                                                        className={`px-2 md:px-3 py-2 whitespace-normal text-sm md:text-base text-slate-700 pl-6 md:pl-10 ${item.isBold ? "font-bold" : "font-normal"
                                                                            }`}
                                                                    >
                                                                        {item.title[lang]}
                                                                    </td>
                                                                    <td
                                                                        className={`border-l px-2 md:px-3 py-2 whitespace-nowrap text-sm md:text-base text-slate-700 text-center ${item.isBold ? "font-bold" : "font-normal"
                                                                            }`}
                                                                    >
                                                                        {item.credits}
                                                                    </td>
                                                                </tr>

                                                                {item.subItems &&
                                                                    item.subItems.map((subItem) => (
                                                                        <tr key={subItem.id}>
                                                                            <td
                                                                                className={`px-2 md:px-3 py-2 whitespace-normal text-sm md:text-base text-slate-700 pl-10 md:pl-16 ${subItem.isBold
                                                                                    ? "font-bold"
                                                                                    : "font-normal"
                                                                                    }`}
                                                                            >
                                                                                {subItem.title[lang]}
                                                                            </td>
                                                                            <td
                                                                                className={`border-l px-2 md:px-3 py-2 whitespace-nowrap text-sm md:text-base text-slate-700 text-center ${subItem.isBold
                                                                                    ? "font-bold"
                                                                                    : "font-normal"
                                                                                    }`}
                                                                            >
                                                                                {subItem.credits}
                                                                            </td>
                                                                        </tr>
                                                                    ))}
                                                            </Fragment>
                                                        ))}
                                                </Fragment>
                                            ))}
                                            <tr className="bg-slate-50">
                                                <td className="px-2 md:px-3 py-3 whitespace-nowrap text-sm md:text-base font-bold text-slate-900 text-right pr-4 md:pr-10">
                                                    {lang === "th"
                                                        ? "รวมหน่วยกิตตลอดหลักสูตร"
                                                        : "Total Credits"}
                                                </td>
                                                <td className="border-l px-2 md:px-3 py-3 whitespace-nowrap text-sm md:text-base font-bold text-slate-900 text-center">
                                                    {totalCredits}
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </section>

                        {/* Additional Info */}
                        {data.language && (
                            <div className="mt-10 w-full" data-aos="fade-up" suppressHydrationWarning>
                                <h2 className="text-2xl font-bold text-slate-900">
                                    {lang === "th" ? "ภาษาที่ใช้" : "Language of Instruction"}
                                </h2>
                                <p className="text-base font-normal text-slate-900 mt-4 leading-relaxed">
                                    &nbsp;&nbsp;&nbsp;&nbsp;{data.language[lang]}
                                </p>
                            </div>
                        )}

                        {data.admission && (
                            <div className="mt-10 w-full" data-aos="fade-up" suppressHydrationWarning>
                                <h2 className="text-2xl font-bold text-slate-900">
                                    {lang === "th" ? "การรับเข้าศึกษา" : "Admission Requirements"}
                                </h2>
                                <p className="text-base font-normal text-slate-900 mt-4 leading-relaxed">
                                    &nbsp;&nbsp;&nbsp;&nbsp;{data.admission[lang]}
                                </p>
                            </div>
                        )}

                    </div>
                </section>
            </main>
        </div>
    );
}
