"use client"

import Breadcrumbs from "@/components/common/Breadcrumbs";
import FloatingBackButton from "@/components/common/FloatingBackButton";
import HeroBanner from "@/components/common/HeroBanner";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import Image from "next/image";
import { useState, useRef } from "react";

export default function ApplyPageClient() {
    const t = useTranslations("ApplyPage");
    const breadcrumb = useTranslations("Breadcrumbs");
    const locale = useLocale();

    const campusImages = [
        "/cedweb/images/campus_life/497586809_1270188235112576_5298471838325821564_n.jpg",
        "/cedweb/images/campus_life/496110213_1270189001779166_5405669053124816187_n.jpg",
        "/cedweb/images/campus_life/497828689_1273505201447546_926467867702818451_n.jpg",
        "/cedweb/images/campus_life/519674896_1327690619362337_5062624978607031600_n.jpg",
        "/cedweb/images/campus_life/577586806_1432996295498435_5748516379346975421_n.jpg",
        "/cedweb/images/campus_life/625058775_1503247405139990_906752219406923140_n.jpg",
        "/cedweb/images/campus_life/577853776_1432998402164891_4074800774306067892_n.jpg",
        "/cedweb/images/campus_life/Backdrop-429.JPG",
    ];

    const baseLength = campusImages.length;
    // Duplicate multiple times to create an endless illusion
    const extendedImages = [...campusImages, ...campusImages, ...campusImages, ...campusImages, ...campusImages];

    const [currentIndex, setCurrentIndex] = useState(baseLength * 2);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const trackRef = useRef<HTMLDivElement>(null);

    const nextImage = () => {
        setIsTransitioning(true);
        setCurrentIndex(prev => prev + 1);
    };

    const prevImage = () => {
        setIsTransitioning(true);
        setCurrentIndex(prev => prev - 1);
    };

    const handleTransitionEnd = () => {
        if (currentIndex >= baseLength * 3) {
            setIsTransitioning(false);
            setCurrentIndex(prev => prev - baseLength);
        } else if (currentIndex <= baseLength) {
            setIsTransitioning(false);
            setCurrentIndex(prev => prev + baseLength);
        }
    };

    const goToDot = (index: number) => {
        setIsTransitioning(true);
        const currentBlockStart = Math.floor(currentIndex / baseLength) * baseLength;
        setCurrentIndex(currentBlockStart + index);
    };
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
                            { label: breadcrumb("apply") },
                        ]}
                    />
                </div>
                <FloatingBackButton />
            </section>

            <section className="mx-auto w-full max-w-7xl px-6 py-6 lg:px-10">
                {/* Video Presentation */}
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6">{t('eyebrow')}</h1>
                <div className="mb-12 w-full mx-auto overflow-hidden">
                    <div className="relative w-full aspect-video">
                        <iframe
                            className="absolute top-0 left-0 w-full h-full"
                            src="https://www.youtube.com/embed/liemR76IG7c"
                            title="แนะนำภาควิชาคอมพิวเตอร์ศึกษา KMUTNB"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                        ></iframe>
                    </div>
                </div>

                <div className="mt-14">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10">
                        <div className="relative h-full">
                            <div className="bg-gray-200 py-10 px-6 md:px-10 lg:px-16 h-full flex flex-col space-y-6">
                                <h2 className="font-bold text-2xl">{t('bachelorsLevel')}</h2>
                                <p className="text-base">{t('bachelorsDesc')}</p>
                                <Link href={"https://admission.kmutnb.ac.th"} className="w-fit items-center gap-2 rounded-md border border-primary-main px-6 py-2 text-sm font-semibold text-white bg-primary-main transition-colors duration-200 hover:bg-transparent hover:text-primary-main">{t('applyNow')}</Link>
                            </div>
                        </div>
                        <div className="relative h-full">
                            <div className="bg-gray-200 py-10 px-6 md:px-10 lg:px-16 h-full flex flex-col space-y-6">
                                <h2 className="font-bold text-2xl">{t('graduateLevel')}</h2>
                                <p className="text-base">{t('graduateDesc')}</p>
                                <Link href={"https://grad.admission.kmutnb.ac.th/ApplyLogin"} className="w-fit items-center gap-2 rounded-md border border-primary-main px-6 py-2 text-sm font-semibold text-white bg-primary-main transition-colors duration-200 hover:bg-transparent hover:text-primary-main">{t('applyNow')}</Link>
                            </div>
                        </div>
                    </div>

                    <div className="mt-16 w-full pb-10">
                        <div className="mb-6 flex flex-col items-start">
                            <div className="flex items-center gap-3 mb-4">
                                <h1 className="text-2xl md:text-3xl font-bold text-slate-900">{t('campusLife')}</h1>
                                <span className="text-xl md:text-2xl text-slate-800 font-bold">|</span>
                            </div>
                            <div className="h-[4px] w-24 bg-primary-main/30"></div>
                        </div>

                        {/* Image Carousel */}
                        <div className="relative w-full group overflow-hidden [--items:1] md:[--items:2] lg:[--items:4]">
                            {/* Scroll Container */}
                            <div
                                className={`flex pb-4 -mx-2 ${isTransitioning ? 'transition-transform duration-500 ease-in-out' : ''}`}
                                ref={trackRef}
                                onTransitionEnd={handleTransitionEnd}
                                style={{ transform: `translateX(calc(-100% * ${currentIndex} / var(--items)))` }}
                            >
                                {extendedImages.map((src, idx) => (
                                    <div
                                        key={idx}
                                        className="w-full md:w-1/2 lg:w-1/4 flex-shrink-0 px-2"
                                    >
                                        <div className="relative w-full aspect-[4/3] overflow-hidden bg-slate-100">
                                            <Image
                                                src={src}
                                                alt={`Campus Life ${(idx % baseLength) + 1}`}
                                                fill
                                                className="object-cover"
                                                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Navigation Buttons (Floating over images) */}
                            <button
                                onClick={prevImage}
                                className="absolute top-1/2 left-4 md:left-6 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-white hover:text-primary-main z-10"
                                aria-label="Previous Image"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-8 h-8 ml-auto mr-auto">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                                </svg>
                            </button>
                            <button
                                onClick={nextImage}
                                className="absolute top-1/2 right-4 md:right-6 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-white hover:text-primary-main z-10"
                                aria-label="Next Image"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-8 h-8 ml-auto mr-auto">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                                </svg>
                            </button>

                            {/* Dots Indicator */}
                            <div className="flex items-center justify-center gap-2 mt-2">
                                {campusImages.map((_, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => goToDot(idx)}
                                        className={`h-2 rounded-full transition-all duration-300 ${(currentIndex % baseLength) === idx ? 'bg-slate-800 w-2' : 'bg-slate-300 w-2 hover:bg-slate-400'}`}
                                        aria-label={`Go to slide ${idx + 1}`}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

        </main>
    );
}