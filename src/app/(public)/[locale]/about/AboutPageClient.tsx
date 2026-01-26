"use client";

import { useMemo, useState, useRef, useEffect } from "react";
import { faLocationDot, faDownload } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";

import Breadcrumbs from "@/components/common/Breadcrumbs";
import HeroBanner from "@/components/common/HeroBanner";
import FloatingBackButton from "@/components/common/FloatingBackButton";

export default function AboutPageClient() {
  const t = useTranslations("AboutPage");
  const philosophyT = useTranslations("AboutPage.philosophy");
  const symbolT = useTranslations("AboutPage.symbol");
  const breadcrumb = useTranslations("Breadcrumbs");
  const locale = useLocale();

  type TabKey = "history" | "philosophy" | "symbol";

  const [activeTab, setActiveTab] = useState<TabKey>("history");
  const [tabUnderlineLeft, setTabUnderlineLeft] = useState(0);
  const [tabUnderlineWidth, setTabUnderlineWidth] = useState(0);
  const tabsRef = useRef<(HTMLSpanElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const tabs = useMemo(
    () => [
      { key: "history" as const, label: t("tabs.history") },
      { key: "philosophy" as const, label: t("tabs.philosophy") },
      { key: "symbol" as const, label: t("tabs.symbol") },
    ],
    [t]
  );

  useEffect(() => {
    const activeTabIndex = tabs.findIndex((tab) => tab.key === activeTab);
    const currentTab = tabsRef.current[activeTabIndex];
    const container = containerRef.current;

    if (currentTab && container) {
      const tabRect = currentTab.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();

      setTabUnderlineLeft(tabRect.left - containerRect.left);
      setTabUnderlineWidth(tabRect.width);
    }
  }, [activeTab, tabs]);

  const historyT = useTranslations("AboutPage.history");

  const historyData = useMemo(() => {
    const timelineEvents = [];
    for (let i = 0; i <= 12; i++) {
      timelineEvents.push({
        year: historyT(`timeline.event${i}.year`),
        title: historyT(`timeline.event${i}.title`),
        description: historyT(`timeline.event${i}.description`),
      });
    }

    return {
      highlight: historyT("highlight"),
      title: historyT("title"),
      summary: historyT("summary"),
      description: historyT("description"),
      timeline: timelineEvents,
    };
  }, [historyT]);

  const galleryItems = [
    { id: 1, src: "/images/asset/ced_img.jpg", alt: "History Image 1", span: 2 }, // ใช้ 2 คอลัมน์
    { id: 2, src: "/images/asset/history_1.jpg", alt: "History Image 2", span: 1 },
    { id: 3, src: "/images/asset/history_2.jpg", alt: "History Image 3", span: 1 },
    { id: 4, src: "/images/asset/history_3.jpg", alt: "History Image 4", span: 2 }, // ใช้ 2 คอลัมน์
  ];

  const philosophySections = useMemo(
    () =>
      ["philosophy", "vision", "mission"].map((key) => ({
        title: philosophyT(`sections.${key}.title`),
        content: philosophyT(`sections.${key}.body`),
      })),
    [philosophyT]
  );

  const philosophyObjectives = useMemo(
    () =>
      ["item1", "item2", "item3", "item4"].map((key) =>
        philosophyT(`objectives.items.${key}`)
      ),
    [philosophyT]
  );
  const philosophyObjectivesTitle = philosophyT("objectives.title");


  const showHistory = activeTab === "history";

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
              { label: breadcrumb("about") },
            ]}
          />
        </div>
        <FloatingBackButton />
      </section>

      <section className="mx-auto w-full max-w-5xl px-6 py-6 text-center lg:px-10">
        <div className="flex flex-col items-center gap-10">
          <div ref={containerRef} className="relative grid grid-cols-3 text-sm md:text-lg font-semibold text-slate-500 gap-6 md:gap-10">
            {tabs.map((tab, index) => {
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`relative py-2 transition ${isActive ? "text-primary-main" : "hover:text-slate-700"
                    }`}
                >
                  <span ref={(el) => { tabsRef.current[index] = el; }}>{tab.label}</span>
                </button>
              );
            })}
            <span
              className="absolute bottom-0 block h-1 bg-primary-main rounded-full transition-all duration-300 ease-in-out"
              style={{ left: tabUnderlineLeft, width: tabUnderlineWidth }}
            />

          </div>

          <div className="space-y-4 text-left">
            {showHistory && (
              <div className="space-y-3" data-aos="fade-up">
                <div>
                  <h2 className="text-2xl md:text-3xl font-semibold text-slate-900 mb-2">
                    {historyData.title}
                  </h2>
                  <p className="text-base leading-7 text-slate-700">
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{historyData.summary}
                  </p>

                  <div>
                    <div className="relative my-8 grid grid-cols-1 gap-2 md:grid-cols-3">
                      {galleryItems.map((item) => (
                        <div
                          key={item.id} // ต้องมี Key เพื่อให้ React ระบุองค์ประกอบได้
                          // ใช้ Template Literal เพื่อกำหนด col-span ตามค่าใน Array
                          className={`
                            relative h-56 w-full overflow-hidden rounded-sm shadow-lg
                            ${item.span === 2 ? 'md:col-span-2' : ''}
                          `}
                        >
                          <Image
                            src={item.src}
                            alt={item.alt}
                            layout="fill"
                            objectFit="cover"
                            className="transition-transform duration-500 hover:scale-105"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-white/70 p-6 shadow-lg shadow-slate-100">
                  <div className="space-y-2 text-center" data-aos="fade-up">
                    <p className="text-base font-semibold uppercase tracking-[0.3em] text-primary-main/70">
                      {historyData.highlight ?? "ประวัติภาควิชา"}
                    </p>
                    <h3 className="text-2xl md:text-3xl font-semibold text-slate-900">
                      {historyT("timelineTitle")}
                    </h3>
                  </div>

                  <div className="mt-12 space-y-12">
                    <div className="relative">
                      <div className="pointer-events-none absolute left-5 top-0 h-full w-px bg-gradient-to-b from-primary-main/60 via-primary-main/20 to-transparent md:left-1/2" />
                      <div className="space-y-14 sticky">
                        {historyData.timeline.map((event, index) => {
                          const alignRight = index % 2 === 0;
                          const isStart = index === 0;
                          const aosAnimation = alignRight ? "fade-left" : "fade-right";

                          return (
                            <div
                              key={`${event.year}-${index}`}
                              className={`relative flex flex-col gap-8 md:flex-row ${alignRight ? "md:flex-row-reverse" : ""
                                }`}
                              data-aos={aosAnimation}
                              data-aos-delay={index * 120}
                            >
                              <div
                                className={`pl-16 md:w-1/2 ${alignRight ? "md:pl-14" : "md:pr-14 md:pl-0"
                                  }`}
                              >
                                <div className="bg-white/90">
                                  <div className="flex items-center gap-3 text-lg font-bold uppercase tracking-[0.1em] text-primary-main/70">
                                    <span className="hidden h-[2px] flex-1 bg-primary-main/40 md:block" />
                                    <span className="text-base">{event.year}</span>
                                  </div>
                                  <h4 className="mt-3 text-xl font-semibold text-slate-900">
                                    {event.title}
                                  </h4>
                                  <p className="mt-3 text-base leading-7 text-slate-700">
                                    {event.description}
                                  </p>
                                </div>
                              </div>
                              <div className="hidden md:flex md:w-1/2" />
                              <div className="absolute left-5 top-3 -translate-x-1/2 md:left-1/2">
                                {isStart ? (
                                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/80 bg-primary-main text-white shadow-lg shadow-primary-main/30">
                                    <FontAwesomeIcon icon={faLocationDot} className="h-4 w-4" />
                                  </span>
                                ) : (
                                  <span className="inline-flex h-4 w-4 items-center justify-center rounded-full border-4 border-white/80 bg-primary-main shadow-md shadow-primary-main/40"></span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "philosophy" && (
              <div className="space-y-10 text-left mb-6" data-aos="fade-up">
                {philosophySections.map((section, index) => (
                  <article key={section.title} className="space-y-4" data-aos="fade-up" data-aos-delay={index * 100}>
                    <div className="flex items-center gap-3">
                      <span className="h-10 w-2 bg-primary-main" aria-hidden />
                      <h2 className="text-2xl md:text-3xl font-bold text-slate-900">{section.title}</h2>
                    </div>
                    <p className="pl-6 text-base leading-relaxed text-slate-700">{section.content}</p>
                  </article>
                ))}

                <article className="space-y-4" data-aos="fade-up" data-aos-delay="300">
                  <div className="flex items-center gap-3">
                    <span className="h-10 w-2 bg-primary-main" aria-hidden />
                    <h2 className="text-2xl md:text-3xl font-bold text-slate-900">{philosophyObjectivesTitle}</h2>
                  </div>
                  <ul className="space-y-2 pl-10 text-base leading-relaxed text-slate-700 list-decimal">
                    {philosophyObjectives.map((objective, index) => (
                      <li key={`${objective}-${index}`} className="pl-2">
                        {objective}
                      </li>
                    ))}
                  </ul>
                </article>
              </div>
            )}

            {activeTab === "symbol" && (
              <div data-aos="fade-up" className="space-y-24 py-12">

                {/* CED Logo Section */}
                <section className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-20 items-center">
                  <div className="md:col-span-5 flex flex-col items-center">
                    <div className="relative w-full max-w-sm aspect-square mb-8">
                      <Image src="/images/logo/logo_1.png" alt={symbolT("title")} layout="fill" objectFit="contain" className="drop-shadow-lg" />
                    </div>

                    {/* CED Colors */}
                    <div className="flex gap-4 justify-center">
                      <div className="group relative">
                        <div className="w-8 h-8 rounded-full bg-[#35622F] ring-1 ring-slate-200 cursor-help"></div>
                        <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">#35622F</span>
                      </div>
                      <div className="group relative">
                        <div className="w-8 h-8 rounded-full bg-[#59B894] ring-1 ring-slate-200 cursor-help"></div>
                        <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">#59B894</span>
                      </div>
                      <div className="group relative">
                        <div className="w-8 h-8 rounded-full bg-[#36ACCE] ring-1 ring-slate-200 cursor-help"></div>
                        <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">#36ACCE</span>
                      </div>
                      <div className="group relative">
                        <div className="w-8 h-8 rounded-full bg-[#FA702A] ring-1 ring-slate-200 cursor-help"></div>
                        <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">#FA702A</span>
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-7 space-y-8 text-left">
                    <div>
                      <h2 className="text-3xl font-bold text-slate-900 mb-2">{symbolT("title")}</h2>
                      <div className="h-1 w-20 bg-primary-main/20"></div>
                    </div>

                    <p className="text-lg leading-relaxed text-slate-600 font-light">
                      {symbolT("description")}
                    </p>

                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold text-slate-800">{symbolT("meaningTitle")}</h3>
                      <ul className="space-y-4 text-slate-600 list-none pl-0">
                        <li className="flex gap-4">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-2.5 flex-shrink-0"></span>
                          <span><strong className="text-slate-800">{symbolT("meanings.circle.title")}</strong> — {symbolT("meanings.circle.desc")}</span>
                        </li>
                        <li className="flex gap-4">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-2.5 flex-shrink-0"></span>
                          <span><strong className="text-slate-800">{symbolT("meanings.circuit.title")}</strong> — {symbolT("meanings.circuit.desc")}</span>
                        </li>
                        <li className="flex gap-4">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-2.5 flex-shrink-0"></span>
                          <span><strong className="text-slate-800">{symbolT("meanings.ced.title")}</strong> — {symbolT("meanings.ced.desc")}</span>
                        </li>
                      </ul>
                    </div>

                    <a href="/images/logo/logo_1.png" download="CED_Logo.png" className="inline-flex items-center gap-2 rounded-lg bg-primary-main px-6 py-2.5 text-sm font-semibold text-white shadow-sm border-2 border-transparent hover:bg-transparent hover:text-primary-main hover:border-primary-main transition-all hover:-translate-y-0.5 mt-4">
                      <FontAwesomeIcon icon={faDownload} />
                      <span>{symbolT("download")}</span>
                    </a>
                  </div>
                </section>

                <div className="w-full h-px bg-slate-100"></div>

                {/* KMUTNB Logo Section */}
                <section className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-20 items-center">
                  <div className="md:col-span-5 flex flex-col items-center md:order-last">
                    <div className="relative w-64 h-64 mb-8">
                      <Image src="/images/logo/kmutnb.png" alt="KMUTNB Logo" layout="fill" objectFit="contain" className="drop-shadow-md" />
                    </div>

                    {/* KMUTNB Colors */}
                    <div className="flex gap-4 justify-center">
                      <div className="group relative">
                        <div className="w-8 h-8 rounded-full bg-[#A81E23] ring-1 ring-slate-200 cursor-help"></div>
                        <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">#A81E23</span>
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-7 space-y-8 text-left">
                    <div>
                      <h2 className="text-3xl font-bold text-slate-900 mb-2">ตราสัญลักษณ์มหาวิทยาลัย</h2>
                      <div className="h-1 w-20 bg-[#A81E23]/20"></div>
                    </div>

                    <p className="text-lg leading-relaxed text-slate-600 font-light">
                      มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าพระนครเหนือ<br />
                      <span className="text-base text-slate-500">King Mongkut&apos;s University of Technology North Bangkok</span>
                    </p>

                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold text-slate-800">ความหมาย</h3>
                      <p className="text-slate-600 leading-relaxed">
                        ประกอบด้วยลายพระมหามงกุฎสีแดงอยู่กลางบุษบกเหนือเลข ๔ ไทย มีความหมายถึง พระบาทสมเด็จพระจอมเกล้าเจ้าอยู่หัว รัชกาลที่ ๔ แห่งพระบรมราชจักรีวงศ์ ผู้ทรงเป็นบิดาแห่งวิทยาศาสตร์ไทย เป็นสัญลักษณ์แห่งความเป็นสิริมงคลและเกียรติยศสูงสุดของสถาบัน
                      </p>
                    </div>

                    <a href="/images/logo/kmutnb.png" download="KMUTNB_Logo.png" className="inline-flex items-center gap-2 rounded-lg bg-[#A81E23] px-6 py-2.5 text-sm font-semibold text-white shadow-sm border-2 border-transparent hover:bg-transparent hover:text-[#A81E23] hover:border-[#A81E23] transition-all hover:-translate-y-0.5 mt-4">
                      <FontAwesomeIcon icon={faDownload} />
                      <span>ดาวน์โหลดตราสัญลักษณ์</span>
                    </a>
                  </div>
                </section>

                <div className="w-full h-px bg-slate-100"></div>

                {/* FTE Logo Section */}
                <section className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-20 items-center">
                  <div className="md:col-span-5 flex flex-col items-center">
                    <div className="relative w-64 h-64 mb-8">
                      <Image src="/images/logo/fte.png" alt="FTE Logo" layout="fill" objectFit="contain" className="drop-shadow-md" />
                    </div>

                    {/* FTE Colors */}
                    <div className="flex gap-4 justify-center">
                      <div className="group relative">
                        <div className="w-8 h-8 rounded-full bg-[#128312] ring-1 ring-slate-200 cursor-help"></div>
                        <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Bilbao #128312</span>
                      </div>
                      <div className="group relative">
                        <div className="w-8 h-8 rounded-full bg-[#86BE89] ring-1 ring-slate-200 cursor-help"></div>
                        <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">De York #86BE89</span>
                      </div>
                      <div className="group relative">
                        <div className="w-8 h-8 rounded-full bg-[#E8F2E7] ring-1 ring-slate-200 cursor-help"></div>
                        <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Gin #E8F2E7</span>
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-7 space-y-8 text-left">
                    <div>
                      <h2 className="text-3xl font-bold text-slate-900 mb-2">ตราสัญลักษณ์คณะ</h2>
                      <div className="h-1 w-20 bg-[#128312]/20"></div>
                    </div>

                    <p className="text-lg leading-relaxed text-slate-600 font-light">
                      คณะครุศาสตร์อุตสาหกรรม<br />
                      <span className="text-base text-slate-500">Faculty of Technical Education</span>
                    </p>

                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold text-slate-800">ความหมาย</h3>
                      <p className="text-slate-600 leading-relaxed">
                        สัญลักษณ์รูปเฟืองล้อมรอบคบเพลิง สื่อถึงความเป็นเลิศทางวิชาการและทักษะช่างอุตสาหกรรม เฟืองหมายถึงพลังขับเคลื่อนทางเทคโนโลยีที่หมุนเวียนพัฒนาอย่างต่อเนื่อง ส่วนคบเพลิงหมายถึงแสงสว่างแห่งปัญญาที่นำพาความเจริญก้าวหน้า
                      </p>
                    </div>

                    <a href="/images/logo/fte.png" download="FTE_Logo.png" className="inline-flex items-center gap-2 rounded-lg bg-[#128312] px-6 py-2.5 text-sm font-semibold text-white shadow-sm border-2 border-transparent hover:bg-transparent hover:text-[#128312] hover:border-[#128312] transition-all hover:-translate-y-0.5 mt-4">
                      <FontAwesomeIcon icon={faDownload} />
                      <span>ดาวน์โหลดตราสัญลักษณ์</span>
                    </a>
                  </div>
                </section>

              </div>
            )}
          </div>
        </div>
      </section>

    </main>
  );
}
