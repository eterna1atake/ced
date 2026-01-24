"use client";

import Breadcrumbs from "@/components/common/Breadcrumbs";
import HeroBanner from "@/components/common/HeroBanner";
import { useState, useRef, useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import ProgramCard from "@/components/programs/ProgramCard";
export default function ProgramsPageClient({ initialPrograms }: { initialPrograms: any[] }) {
  const locale = useLocale();
  const t = useTranslations("ProgramsPage");
  const breadcrumb = useTranslations("Breadcrumbs");
  const [activeTab, setActiveTab] = useState<"bachelor" | "master" | "doctoral">("bachelor");
  const [tabUnderlineLeft, setTabUnderlineLeft] = useState(0);
  const [tabUnderlineWidth, setTabUnderlineWidth] = useState(0);

  const tabsRef = useRef<(HTMLButtonElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tabs = ["bachelor", "master", "doctoral"];
    const activeTabIndex = tabs.indexOf(activeTab);
    const currentTab = tabsRef.current[activeTabIndex];

    if (currentTab && containerRef.current) {
      setTabUnderlineLeft(currentTab.offsetLeft);
      setTabUnderlineWidth(currentTab.clientWidth);
    }
  }, [activeTab]);

  return (
    <main>
      <HeroBanner
        title={t("title")}
        description={t("description")}
        eyebrow={t("eyebrow")}
        //imageSrc="/images/news/featured-768x512-1.jpg"
        imageAlt={t("title")}
      />

      <section className="border-b border-slate-200 bg-slate-50/80">
        <div className="mx-auto w-full max-w-7xl px-6 py-4 lg:px-10">
          <Breadcrumbs
            items={[
              { href: `/${locale}`, label: breadcrumb("home") },
              { label: breadcrumb("programs") },
            ]}
          />
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-6 py-10 lg:px-10">
        {/* Tab Navigation */}
        <div className="relative mb-10 border-b border-slate-200">
          <div ref={containerRef} className="relative flex flex-wrap gap-0 md:gap-4">
            {["bachelor", "master", "doctoral"].map((tab, index) => (
              <button
                key={tab}
                ref={(el) => { tabsRef.current[index] = el; }}
                onClick={() => setActiveTab(tab as "bachelor" | "master" | "doctoral")}
                className={`relative mx-4 py-2 text-base md:text-lg font-semibold transition-colors ${activeTab === tab
                  ? "text-primary-main"
                  : "text-slate-500 hover:text-slate-700"
                  }`}
              >
                {tab === "bachelor" && "ปริญญาตรี"}
                {tab === "master" && "ปริญญาโท"}
                {tab === "doctoral" && "ปริญญาเอก"}
              </button>
            ))}
            <span
              className="absolute bottom-0 block h-1 bg-primary-main rounded-full transition-all duration-300 ease-in-out"
              style={{ left: tabUnderlineLeft, width: tabUnderlineWidth }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col gap-8">
          {initialPrograms
            .filter((program: any) => program.level === activeTab)
            .map((program: any, index: number) => (
              <ProgramCard
                key={index}
                degree={program.degree}
                title={program.title}
                subtitle={program.subtitle}
                description={program.description}
                imageSrc={program.imageSrc}
                imageAlt={program.imageAlt}
                buttonLink={program.buttonLink}
              />
            ))}
        </div>
      </section>
    </main>


  );
}
