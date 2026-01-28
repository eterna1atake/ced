"use client";

import HeroBanner from "@/components/common/HeroBanner";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import FloatingBackButton from "@/components/common/FloatingBackButton";
import Loading from "@/components/common/Loading";
import { useLocale, useTranslations } from "next-intl";
import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import type { IClassroom } from "@/collections/Classroom";

export default function ClassroomPageClient() {
  const t = useTranslations("ClassroomPage");
  const breadcrumb = useTranslations("Breadcrumbs");
  const locale = useLocale();

  // State
  const [classrooms, setClassrooms] = useState<IClassroom[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeBuilding, setActiveBuilding] = useState<"52" | "44">("44");
  const [activeRoomId, setActiveRoomId] = useState<string>("");
  const [tabUnderlineLeft, setTabUnderlineLeft] = useState(0);
  const [tabUnderlineWidth, setTabUnderlineWidth] = useState(0);

  const tabsRef = useRef<(HTMLButtonElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch Classrooms
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/public/classrooms', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          setClassrooms(data);
        }
      } catch (error) {
        console.error("Failed to fetch classrooms", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filter classrooms based on building
  const filteredClassrooms = classrooms.filter(c => c.id.startsWith(activeBuilding + "-"));

  // Get active classroom data
  const activeClassroom = filteredClassrooms.find((c) => c.id === activeRoomId) || filteredClassrooms[0];

  // Set default room when building/data changes
  useEffect(() => {
    if (filteredClassrooms.length > 0) {
      // If activeRoomId is not in the current filtered list, switch to the first one
      const exists = filteredClassrooms.some(c => c.id === activeRoomId);
      if (!exists && filteredClassrooms[0]) {
        setActiveRoomId(filteredClassrooms[0].id);
      }
    } else {
      setActiveRoomId("");
    }
  }, [activeBuilding, filteredClassrooms, activeRoomId]);

  useEffect(() => {
    const buildings = ["52", "44"];
    const activeTabIndex = buildings.indexOf(activeBuilding);
    const currentTab = tabsRef.current[activeTabIndex];
    const container = containerRef.current;

    if (currentTab && container) {
      const textSpan = currentTab.querySelector("span");
      if (textSpan && textSpan instanceof HTMLElement) {
        setTabUnderlineLeft(currentTab.offsetLeft + textSpan.offsetLeft);
        setTabUnderlineWidth(textSpan.offsetWidth);
      }
    }
  }, [activeBuilding]);

  // Lightbox State
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Helper to safely get gallery images
  const getGalleryImage = (index: number) => {
    if (activeClassroom?.gallery && activeClassroom.gallery.length > index) {
      return activeClassroom.gallery[index];
    }
    // Fallback if no gallery image at index, use main image or placeholder
    const image = activeClassroom?.image;
    return image || "/images/placeholder.jpg";
  };

  // Helper to safely get localized string
  const getLocalized = (obj: { en: string; th: string } | string | undefined | null) => {
    if (!obj) return "";
    if (typeof obj === "string") return obj;
    return obj[locale as "en" | "th"] || obj["en"] || "";
  };

  // Lightbox Handlers
  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setIsLightboxOpen(true);
    document.body.style.overflow = "hidden";
  };

  const closeLightbox = useCallback(() => {
    setIsLightboxOpen(false);
    document.body.style.overflow = "auto";
  }, []);

  // Ensure scroll is restored if component unmounts or lightbox closes externally
  useEffect(() => {
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  const nextLightboxImage = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    const totalImages = activeClassroom?.gallery?.length || 1;
    setLightboxIndex((prev) => (prev + 1) % totalImages);
  }, [activeClassroom]);

  const prevLightboxImage = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    const totalImages = activeClassroom?.gallery?.length || 1;
    setLightboxIndex((prev) => (prev - 1 + totalImages) % totalImages);
  }, [activeClassroom]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isLightboxOpen) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") nextLightboxImage();
      if (e.key === "ArrowLeft") prevLightboxImage();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLightboxOpen, activeClassroom, closeLightbox, nextLightboxImage, prevLightboxImage]);

  return (
    <>
      <main className="pb-20">
        <HeroBanner
          title={t("title")}
          description={t("description")}
          eyebrow={t("eyebrow")}
          imageAlt={t("title")}
        />

        {/* Breadcrumbs Navigation */}
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

        <div className="mx-auto w-full max-w-7xl px-6 py-10 lg:px-10">
          {/* Building Tabs */}
          <div className="flex justify-center border-b border-slate-200 mb-4">
            <div ref={containerRef} className="relative flex gap-16">
              <button
                ref={(el) => { tabsRef.current[0] = el; }}
                onClick={() => setActiveBuilding("52")}
                className={`pb-3 text-base md:text-lg font-medium transition-all duration-300 relative ${activeBuilding === "52"
                  ? "text-slate-900"
                  : "text-slate-400 hover:text-slate-600"
                  }`}
              >
                <span>{t("building52")}</span>
              </button>
              <button
                ref={(el) => { tabsRef.current[1] = el; }}
                onClick={() => setActiveBuilding("44")}
                className={`pb-3 text-base md:text-lg font-medium transition-all duration-300 relative ${activeBuilding === "44"
                  ? "text-slate-900"
                  : "text-slate-400 hover:text-slate-600"
                  }`}
              >
                <span>{t("building44")}</span>
              </button>
              <span
                className="absolute bottom-0 block h-1 bg-[#35622F] rounded-t-sm transition-all duration-300 ease-in-out"
                style={{ left: tabUnderlineLeft, width: tabUnderlineWidth }}
              />
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loading />
            </div>
          ) : (
            <>
              {/* Room List Selector */}
              <div data-aos="fade-right">
                <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-4 md:mb-10 mb-8">
                  {filteredClassrooms.length > 0 ? (
                    filteredClassrooms.map((room, index) => (
                      <div key={room.id} className="flex items-center">
                        <button
                          onClick={() => setActiveRoomId(room.id)}
                          className={`text-sm md:text-base font-medium transition-all duration-200 relative px-2 py-1 ${activeRoomId === room.id
                            ? "text-slate-900 font-bold"
                            : "text-slate-400 hover:text-slate-600"
                            }`}
                        >
                          {room.id}
                          <span
                            className={`absolute bottom-0 left-0 h-[3px] bg-[#35622F] transition-all duration-300 ${activeRoomId === room.id ? "w-full" : "w-0"}`}
                          />
                        </button>
                        {/* Vertical Divider (don't show after last item) */}
                        {index < filteredClassrooms.length - 1 && (
                          <div className="h-6 w-[1px] bg-slate-200 ml-6" />
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-slate-500 py-10">{t("noClassroomsFound")}</div>
                  )}
                </div>
              </div>

              {/* Gallery and Detail Container */}
              {activeClassroom && (
                <div key={activeRoomId}>
                  {/* Gallery Grid */}
                  <div data-aos="fade-left" data-aos-anchor="#example-anchor" data-aos-offset="500" data-aos-duration="500">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 h-auto md:h-[500px] lg:h-[600px]">
                      {/* Main Large Image (Left) */}
                      <div
                        className="lg:col-span-2 relative w-full overflow-hidden rounded-lg shadow-sm group cursor-pointer h-[250px] md:h-full"
                        onClick={() => openLightbox(0)}
                      >
                        <Image
                          src={getGalleryImage(0)}
                          alt={`${getLocalized(activeClassroom.name)} Main View`}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                          priority
                        />
                        <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10" />
                      </div>

                      {/* Side Images (Right Column) */}
                      <div className="flex flex-col gap-2 h-auto md:h-full">
                        {/* Top Right Image */}
                        <div
                          className="relative w-full overflow-hidden rounded-lg shadow-sm group cursor-pointer h-[200px] md:h-1/2"
                          onClick={() => openLightbox(1)}
                        >
                          <Image
                            src={getGalleryImage(1)}
                            alt={`${getLocalized(activeClassroom.name)} View 2`}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                            priority
                          />
                          <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10" />
                        </div>

                        {/* Bottom Right Image */}
                        <div
                          className="relative w-full overflow-hidden rounded-lg shadow-sm group cursor-pointer h-[200px] md:h-1/2"
                          onClick={() => openLightbox(2)}
                        >
                          <Image
                            src={getGalleryImage(2)}
                            alt={`${getLocalized(activeClassroom.name)} View 3`}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Classroom Detail Section */}
                  <div className="mt-8">
                    {/* Detail Header with Green Border */}
                    <div className="border-l-4 border-[#35622F] pl-4 mb-6" data-aos="fade-up">
                      <h2 className="text-2xl font-bold text-slate-900">{t("roomDetail")}</h2>
                    </div>

                    {/* Detail Content */}
                    <div className="bg-slate-50 rounded-xl p-6 md:p-8">
                      {/* Description */}
                      {activeClassroom.description && (
                        <p className="text-slate-600 text-base leading-relaxed mb-6" data-aos="fade-up" data-aos-delay="100">
                          {getLocalized(activeClassroom.description)}
                        </p>
                      )}

                      {/* Specs Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        {/* Computer Specs */}
                        {activeClassroom.equipment && activeClassroom.equipment.length > 0 && (
                          <div className="bg-white rounded-lg p-5 shadow-sm" data-aos="fade-up" data-aos-delay="200">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="w-10 h-10 rounded-lg bg-[#35622F]/10 flex items-center justify-center">
                                <svg className="w-5 h-5 text-[#35622F]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                              </div>
                              <h3 className="text-lg font-semibold text-slate-900">{t("computerSpecs")}</h3>
                            </div>
                            <ul className="space-y-2">
                              {activeClassroom.equipment.map((item, index) => (
                                <li key={index} className="flex items-center gap-2 text-slate-600 text-sm">
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#35622F]"></span>
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Capacity */}
                        {activeClassroom.capacity && (
                          <div className="bg-white rounded-lg p-5 shadow-sm" data-aos="fade-up" data-aos-delay="300">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="w-10 h-10 rounded-lg bg-[#35622F]/10 flex items-center justify-center">
                                <svg className="w-5 h-5 text-[#35622F]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                              </div>
                              <h3 className="text-lg font-semibold text-slate-900">{t("machineCount")}</h3>
                            </div>
                            <p className="text-2xl font-bold text-[#35622F]">{activeClassroom.capacity}</p>
                          </div>
                        )}
                      </div>

                      {/* Booking Button */}
                      <div className="flex justify-center md:justify-start" data-aos="fade-up" data-aos-delay="400">
                        <button
                          className="inline-flex items-center gap-2 bg-[#35622F] hover:bg-[#2a4e26] text-white font-semibold px-8 py-3 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg"
                          onClick={() => window.open("https://kmutnb.link/ComEDUiLab?fbclid=IwY2xjawOxBZJleHRuA2FlbQIxMABicmlkETFtN09NTHRUbFB6S0ZoNVVpc3J0YwZhcHBfaWQQMjIyMDM5MTc4ODIwMDg5MgABHp_i0KRcPeMM6stfI7uwOZn1zhr2tYZfjP1xK41Zkd6dP4SWWjPFzqQ7k1Vh_aem_bSe8R5Umjb1DFGZwwBsnjQ", "_blank")}
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {t("bookRoom")}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

        </div>
      </main>



      {/* Lightbox Modal */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm animate-in fade-in duration-200"
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

          {/* Navigation Arrows */}
          <button
            onClick={prevLightboxImage}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors p-4 focus:outline-none z-10"
          >
            <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M15.41 7.41L14 6L8 12L14 18L15.41 16.59L10.83 12L15.41 7.41Z" />
            </svg>
          </button>

          <button
            onClick={nextLightboxImage}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors p-4 focus:outline-none z-10"
          >
            <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 6L8.59 7.41L13.17 12L8.59 16.59L10 18L16 12L10 6Z" />
            </svg>
          </button>

          {/* Main Image Container */}
          <div
            className="relative w-full h-full max-w-7xl max-h-[90vh] p-4 flex items-center justify-center"
          >
            <div className="relative w-full h-full">
              <Image
                src={getGalleryImage(lightboxIndex)}
                alt={`${getLocalized(activeClassroom.name)} Lightbox View`}
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>

          {/* Image Counter */}
          <div className="absolute bottom-6 right-8 translate-x-1/2 text-slate-400 text-sm font-medium">
            {lightboxIndex + 1} of {activeClassroom?.gallery?.length || 1}
          </div>
        </div>
      )}
    </>
  );
}