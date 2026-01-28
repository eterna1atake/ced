"use client";

import Breadcrumbs from "@/components/common/Breadcrumbs";
import HeroBanner from "@/components/common/HeroBanner";
import Pagination from "@/components/common/Pagination";
import { useLocale, useTranslations } from "next-intl";
import FloatingBackButton from "@/components/common/FloatingBackButton";
import { awards } from "@/data/awardsData";
import Image from "next/image";
import { useState, useEffect, useCallback } from "react";
import { LocalizedString } from "@/types/common";
import { Award } from "@/types/award";

export default function AwardsPageClient() {
    const locale = useLocale();
    const lang = locale as keyof LocalizedString;
    const t = useTranslations("AwardsPage");
    const breadcrumb = useTranslations("Breadcrumbs");

    const content = {
        th: {
            team: "ผู้จัดทำ:",
            advisors: "ที่ปรึกษา:",
            dateUnknown: "ไม่ระบุ"
        },
        en: {
            team: "Team:",
            advisors: "Advisors:",
            dateUnknown: "Date not specified"
        }
    };

    const [awardsList, setAwardsList] = useState<Award[]>(awards);
    useEffect(() => {
        const fetchAwards = async () => {
            try {
                const res = await fetch("/api/public/awards");
                if (res.ok) {
                    const data = await res.json();
                    if (data && data.length > 0) {
                        setAwardsList(data);
                    }
                }
            } catch (error) {
                console.error("Error fetching public awards:", error);
            }
        };
        fetchAwards();
    }, []);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8; // Adjust based on grid layout preference

    // Sort awards from newest to oldest year
    const sortedAwards = [...awardsList].sort((a, b) => {
        const yearA = parseInt(a.year) || 0;
        const yearB = parseInt(b.year) || 0;
        return yearB - yearA;
    });

    const totalPages = Math.ceil(sortedAwards.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = sortedAwards.slice(indexOfFirstItem, indexOfLastItem);

    // Lightbox state
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);

    // Reset selected image when changing awards
    useEffect(() => {
        setSelectedImageIndex(0);
    }, [lightboxIndex]);

    const openLightbox = (globalIndex: number) => {
        setLightboxIndex(globalIndex);
        setIsLightboxOpen(true);
        document.body.style.overflow = "hidden";
    };

    const closeLightbox = useCallback(() => {
        setIsLightboxOpen(false);
        document.body.style.overflow = "auto";
    }, []);

    // Cleanup overflow style on unmount
    useEffect(() => {
        return () => {
            document.body.style.overflow = "auto";
        };
    }, []);

    const nextAward = useCallback((e?: React.MouseEvent) => {
        e?.stopPropagation();
        setLightboxIndex((prev) => (prev + 1) % sortedAwards.length);
    }, [sortedAwards.length]);

    const prevAward = useCallback((e?: React.MouseEvent) => {
        e?.stopPropagation();
        setLightboxIndex((prev) => (prev - 1 + sortedAwards.length) % sortedAwards.length);
    }, [sortedAwards.length]);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isLightboxOpen) return;
            if (e.key === "Escape") closeLightbox();
            if (e.key === "ArrowRight") nextAward();
            if (e.key === "ArrowLeft") prevAward();
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isLightboxOpen, closeLightbox, nextAward, prevAward]);

    const handlePageChange = (pageNumber: number) => {
        setCurrentPage(pageNumber);
        // Scroll to top of grid
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Function to determine grid span based on index to create a bento/masonry look
    const getGridSpan = (index: number) => {
        // Pattern: Big, Small, Small, Wide, Small, Small...
        // Reset pattern for each page to maintain consistency
        const pattern = [
            "md:col-span-2 md:row-span-2", // 0: Big Square
            "md:col-span-1 md:row-span-1", // 1: Small
            "md:col-span-1 md:row-span-1", // 2: Small
            "md:col-span-2 md:row-span-1", // 3: Wide
            "md:col-span-1 md:row-span-1", // 4: Small
            "md:col-span-1 md:row-span-1", // 5: Small (was Tall)
            "md:col-span-1 md:row-span-1", // 6: Small
            "md:col-span-1 md:row-span-1", // 7: Small
        ];
        return pattern[index % pattern.length];
    };

    return (
        <>
            <main>
                <HeroBanner
                    title={t("title")}
                    description={t("description")}
                    eyebrow={t("eyebrow")}
                    imageAlt="Awards"
                />

                <section className="mx-auto w-full max-w-7xl px-6 lg:px-10">
                    <div className="border-b border-slate-200 bg-slate-50/80 py-4">
                        <Breadcrumbs
                            items={[
                                { href: `/${locale}`, label: breadcrumb("home") },
                                { label: t("title") },
                            ]}
                        />
                    </div>
                    <FloatingBackButton />
                </section>

                <section className="mx-auto w-full max-w-7xl px-6 py-10 lg:px-10">
                    <div className="grid grid-cols-1 gap-2 lg:gap-4 md:grid-cols-3 lg:grid-cols-4 auto-rows-[300px]">
                        {currentItems.map((award, index) => {
                            const globalIndex = indexOfFirstItem + index;
                            const awardId = award._id || award.id;
                            return (
                                <div
                                    key={awardId}
                                    onClick={() => openLightbox(globalIndex)}
                                    className={`group relative overflow-hidden rounded-lg bg-slate-200 shadow-md transition-all duration-500 hover:shadow-xl cursor-pointer ${getGridSpan(index)}`}
                                >
                                    {/* Background Image */}
                                    <div className="absolute inset-0 h-full w-full">
                                        {/* Placeholder for actual image */}
                                        <div className="h-full w-full bg-slate-300 flex items-center justify-center text-slate-400">
                                            <svg className="h-16 w-16 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                        <Image
                                            src={award.image}
                                            alt={award.project[lang]}
                                            fill
                                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                    </div>

                                    {/* Grey Gradient Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-800/40 to-transparent opacity-80 transition-opacity duration-300 group-hover:opacity-90" />

                                    {/* Content */}
                                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                                        <h3 className="mb-2 text-xl font-bold leading-tight line-clamp-2 group-hover:text-primary-light transition-colors">
                                            {award.project[lang]}
                                        </h3>
                                        <p className="mb-3 text-sm font-medium text-slate-200 line-clamp-1">
                                            {award.title[lang]}
                                        </p>

                                        {/* Additional Info (Hidden by default, shown on hover or if space permits) */}
                                        <div className="mb-3 h-0 overflow-hidden opacity-0 transition-all duration-300 group-hover:h-auto group-hover:opacity-100">
                                            <p className="text-xs text-slate-300">
                                                <span className="font-semibold text-slate-200">{content[lang].team}</span> {award.team.map((t) => t[lang]).join(", ")}
                                            </p>
                                            <p className="text-xs text-slate-300 mt-1">
                                                <span className="font-semibold text-slate-200">{content[lang].advisors}</span> {award.advisors.map((a) => a[lang]).join(", ")}
                                            </p>
                                        </div>

                                        {/* Footer: Date/Time */}
                                        <div className="flex items-center gap-2 text-xs text-slate-400">
                                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <span>{award.date || content[lang].dateUnknown}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Pagination */}
                    <Pagination
                        className="mt-12 flex justify-center items-center gap-2"
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                    />
                </section>
            </main>

            {/* Lightbox Modal */}
            {isLightboxOpen && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
                    onClick={closeLightbox}
                >
                    {/* Close Button */}
                    <button
                        onClick={closeLightbox}
                        className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors p-2 z-10"
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>

                    {/* Navigation Arrows (Between Awards) */}
                    <button
                        onClick={prevAward}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors p-4 focus:outline-none z-10 hidden md:block"
                        title="Previous Award"
                    >
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                            <path d="M15.41 7.41L14 6L8 12L14 18L15.41 16.59L10.83 12L15.41 7.41Z" />
                        </svg>
                    </button>

                    <button
                        onClick={nextAward}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors p-4 focus:outline-none z-10 hidden md:block"
                        title="Next Award"
                    >
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                            <path d="M10 6L8.59 7.41L13.17 12L8.59 16.59L10 18L16 12L10 6Z" />
                        </svg>
                    </button>

                    {/* Main Content */}
                    <div
                        className="relative w-full h-full max-w-6xl max-h-[90vh] p-2 md:p-4 flex flex-col md:flex-row items-stretch justify-center gap-4 md:gap-6"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Image Section */}
                        <div className="relative w-full md:w-2/3 flex flex-col items-center justify-center min-h-0">
                            {/* Main Display Image */}
                            <div className="relative w-full h-64 md:h-0 flex-grow md:min-h-[40vh] min-h-0 shrink-0">
                                <Image
                                    src={[sortedAwards[lightboxIndex].image, ...(sortedAwards[lightboxIndex].gallery || [])][selectedImageIndex] || sortedAwards[lightboxIndex].image}
                                    alt={sortedAwards[lightboxIndex].project[lang]}
                                    fill
                                    quality={100}
                                    sizes="(max-width: 768px) 100vw, 66vw"
                                    className="object-contain"
                                    priority
                                />
                            </div>

                            {/* Thumbnails (If more than 1 image) */}
                            {([sortedAwards[lightboxIndex].image, ...(sortedAwards[lightboxIndex].gallery || [])].length > 1) && (
                                <div className="mt-4 w-full overflow-x-auto shrink-0">
                                    <div className="flex justify-center gap-2 p-1">
                                        {[sortedAwards[lightboxIndex].image, ...(sortedAwards[lightboxIndex].gallery || [])].map((img, idx) => (
                                            <button
                                                key={idx}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedImageIndex(idx);
                                                }}
                                                className={`relative h-12 w-12 md:h-20 md:w-20 flex-shrink-0 rounded-md overflow-hidden border-2 transition-all ${selectedImageIndex === idx ? "border-[#35622F] opacity-100" : "border-transparent opacity-60 hover:opacity-100"}`}
                                            >
                                                <Image
                                                    src={img}
                                                    alt={`Thumbnail ${idx + 1}`}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Award Details Side-Panel */}
                        <div className="w-full md:w-1/3 flex flex-col min-h-0 md:h-full flex-1 md:flex-auto">
                            <div className="flex-grow bg-slate-100/95 backdrop-blur-xl rounded-xl border border-slate-200 overflow-y-auto p-4 md:p-8 shadow-2xl custom-scrollbar">
                                {/* Category/Date Badge */}
                                <div className="flex items-center gap-2 mb-6">
                                    <div className="h-px flex-grow bg-gradient-to-r from-transparent to-primary-main/30" />
                                    <span className="px-3 py-1 bg-white border border-slate-300 text-primary-main text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] rounded-full shadow-sm">
                                        {sortedAwards[lightboxIndex].year}
                                    </span>
                                    <div className="h-px flex-grow bg-gradient-to-l from-transparent to-primary-main/30" />
                                </div>

                                {/* Title & Project */}
                                <div className="mb-8">
                                    <h3 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3 leading-tight tracking-tight">
                                        {sortedAwards[lightboxIndex].title[lang]}
                                    </h3>
                                    <div className="h-1.5 w-12 bg-primary-main rounded-full mb-4 shadow-sm" />
                                    <p className="text-slate-600 text-sm md:text-base font-medium leading-relaxed italic">
                                        &quot;{sortedAwards[lightboxIndex].project[lang]}&quot;
                                    </p>
                                </div>

                                {/* Details Sections */}
                                <div className="space-y-8">
                                    {/* Team Members */}
                                    <div className="group">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="p-2 bg-white rounded-lg text-primary-main border border-slate-200 group-hover:border-primary-main/50 transition-colors shadow-sm">
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                                            </div>
                                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">{content[lang].team}</h4>
                                        </div>
                                        <ul className="space-y-3 pl-2">
                                            {sortedAwards[lightboxIndex].team.map((t, i) => (
                                                <li key={i} className="flex items-center gap-3 text-slate-700 text-sm font-medium">
                                                    <span className="w-1.5 h-1.5 bg-primary-main rounded-full" />
                                                    {t[lang]}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Advisors */}
                                    <div className="group">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="p-2 bg-white rounded-lg text-primary-main border border-slate-200 group-hover:border-primary-main/50 transition-colors shadow-sm">
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                                            </div>
                                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">{content[lang].advisors}</h4>
                                        </div>
                                        <ul className="space-y-3 pl-2">
                                            {sortedAwards[lightboxIndex].advisors.map((a, i) => (
                                                <li key={i} className="flex items-center gap-3 text-slate-700 text-sm font-medium">
                                                    <span className="w-1.5 h-1.5 bg-primary-main rounded-full shadow-[0_0_3px_rgba(53,98,47,0.4)]" />
                                                    {a[lang]}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Achievement Date */}
                                    <div className="pt-6 border-t border-slate-200 flex items-center justify-between text-slate-400 text-[10px] md:text-xs">
                                        <span className="flex items-center gap-2 font-medium">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" /></svg>
                                            {sortedAwards[lightboxIndex].date || sortedAwards[lightboxIndex].year}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );

}