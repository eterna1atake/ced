"use client";

import { notFound } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import FloatingBackButton from "@/components/common/FloatingBackButton";
import PersonnelSidebar from "@/components/personnel/detail/PersonnelSidebar";
import EducationList from "@/components/personnel/detail/EducationList";
import CourseList from "@/components/personnel/detail/CourseList";
import { Link } from "@/i18n/navigation";
import HeroBanner from "@/components/common/HeroBanner";
import { LocalizedString } from "@/types";
import type { IPersonnel } from "@/collections/Personnel";

export default function PersonnelDetailPageClient({ person }: { person: IPersonnel }) {
    const locale = useLocale();
    const lang = locale as keyof LocalizedString;
    const t = useTranslations("Personnel");
    const breadcrumb = useTranslations("Breadcrumbs");

    if (!person) {
        notFound();
    }


    return (
        <main className="flex-grow">
            <HeroBanner
                title={t("title")}
                description={t("description")}
                eyebrow="Latest Updates"
                imageAlt={t("title")}
            />
            <section className="mx-auto w-full max-w-7xl px-6 lg:px-10">
                <div className="border-b border-slate-200 bg-slate-50/80 py-4">
                    <Breadcrumbs
                        items={[
                            { href: `/${locale}`, label: breadcrumb("home") },
                            { href: `/${locale}/personnel`, label: breadcrumb("personnel") },
                            { label: person.name[lang] },
                        ]}
                    />
                </div>
                <FloatingBackButton />
            </section>

            <section className="mx-auto w-full max-w-6xl px-6 py-12 lg:px-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 lg:gap-8">
                    {/* Sidebar: Image & Contact (3 cols) */}
                    <div className="lg:col-span-4">
                        <PersonnelSidebar
                            imageSrc={person.imageSrc}
                            name={person.name[lang]}
                            position={person.position[lang]}
                            email={person.email}
                            room={person.room}
                            phone={person.phone}
                        />
                    </div>

                    {/* Main Content: Details (9 cols) */}
                    <div className="lg:col-span-8 space-y-12">
                        <div className="hidden lg:block border-b border-slate-200 pb-8">
                            <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl mb-3">
                                {person.name[lang]}
                            </h1>
                            <p className="text-xl font-medium text-primary-main">
                                {person.position[lang]}
                            </p>
                        </div>

                        {/* Education */}
                        <EducationList education={person.education} />

                        {/* Research Interests */}
                        {(person.researchProfileLink || person.scopusLink || person.googleScholarLink) && (
                            <div>
                                <div className="mb-6 flex items-center gap-4">
                                    <div className="w-1 h-8 bg-primary-main"></div>
                                    <h2 className="text-2xl font-bold text-slate-900">
                                        {lang === 'th' ? "งานวิจัย" : "Research"}
                                    </h2>
                                </div>
                                <div className="grid gap-4 md:grid-cols-2">
                                    {person.researchProfileLink && (
                                        <Link
                                            href={person.researchProfileLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="block group h-full"
                                        >
                                            <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50 border border-slate-200 transition-all duration-200 group-hover:border-primary-main/30 group-hover:bg-primary-main/5 group-hover:shadow-sm h-full">
                                                <div className="flex items-center gap-4">
                                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-primary-main shadow-sm ring-1 ring-slate-900/5 group-hover:scale-110 transition-transform duration-200">
                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
                                                        </svg>
                                                    </div>
                                                    <div>
                                                        <h3 className="font-semibold text-slate-900 group-hover:text-primary-main transition-colors">KMUTNB Research</h3>
                                                        <p className="text-sm text-slate-500">
                                                            {lang === 'th' ? "ฐานข้อมูลงานวิจัยมหาวิทยาลัย" : "University Research Database"}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-slate-400 group-hover:text-primary-main group-hover:translate-x-1 transition-all pl-2">
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </Link>
                                    )}

                                    {person.scopusLink && (
                                        <Link
                                            href={person.scopusLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="block group h-full"
                                        >
                                            <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50 border border-slate-200 transition-all duration-200 group-hover:border-[#007398]/30 group-hover:bg-[#007398]/5 group-hover:shadow-sm h-full">
                                                <div className="flex items-center gap-4">
                                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-[#007398] shadow-sm ring-1 ring-slate-900/5 group-hover:scale-110 transition-transform duration-200">
                                                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                                                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
                                                        </svg>
                                                    </div>
                                                    <div>
                                                        <h3 className="font-semibold text-slate-900 group-hover:text-[#007398] transition-colors">Scopus Profile</h3>
                                                        <p className="text-sm text-slate-500">
                                                            {lang === 'th' ? "ฐานข้อมูลการอ้างอิงวิชาการ" : "Academic Citation Database"}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-slate-400 group-hover:text-[#007398] group-hover:translate-x-1 transition-all pl-2">
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </Link>
                                    )}

                                    {person.googleScholarLink && (
                                        <Link
                                            href={person.googleScholarLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="block group h-full"
                                        >
                                            <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50 border border-slate-200 transition-all duration-200 group-hover:border-[#4285F4]/30 group-hover:bg-[#4285F4]/5 group-hover:shadow-sm h-full">
                                                <div className="flex items-center gap-4">
                                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-[#4285F4] shadow-sm ring-1 ring-slate-900/5 group-hover:scale-110 transition-transform duration-200">
                                                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                                                            <path d="M12 24a7 7 0 1 1 0-14 7 7 0 0 1 0 14zm0-24L0 9.5l4.838 3.94A8 8 0 0 1 12 9a8 8 0 0 1 7.162 4.44L24 9.5z" />
                                                        </svg>
                                                    </div>
                                                    <div>
                                                        <h3 className="font-semibold text-slate-900 group-hover:text-[#4285F4] transition-colors">Google Scholar</h3>
                                                        <p className="text-sm text-slate-500">
                                                            {lang === 'th' ? "ฐานข้อมูลงานวิจัยวิชาการ" : "Academic Research Database"}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-slate-400 group-hover:text-[#4285F4] group-hover:translate-x-1 transition-all pl-2">
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </Link>
                                    )}

                                    {/* Custom Links */}
                                    {person.customLinks?.map((link, idx) => (
                                        <Link
                                            key={idx}
                                            href={link.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="block group h-full"
                                        >
                                            <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50 border border-slate-200 transition-all duration-200 group-hover:border-slate-400/30 group-hover:bg-slate-400/5 group-hover:shadow-sm h-full">
                                                <div className="flex items-center gap-4">
                                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-slate-600 shadow-sm ring-1 ring-slate-900/5 group-hover:scale-110 transition-transform duration-200">
                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                                                        </svg>
                                                    </div>
                                                    <div>
                                                        <h3 className="font-semibold text-slate-900 group-hover:text-slate-700 transition-colors">{link.title}</h3>
                                                        <p className="text-sm text-slate-500">
                                                            {lang === 'th' ? "ลิงก์ภายนอก" : "External Link"}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-slate-400 group-hover:text-slate-600 group-hover:translate-x-1 transition-all pl-2">
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Courses */}
                        {/* Courses / Responsibilities */}
                        <CourseList
                            courses={person.courses}
                            title={
                                (person.position.en === "Staff" || person.position.th === "เจ้าหน้าที่")
                                    ? (lang === 'th' ? "งานที่รับผิดชอบ" : "Responsibilities")
                                    : undefined
                            }
                        />

                    </div>
                </div>
            </section>
        </main>


    );
}