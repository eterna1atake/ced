"use client";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import HeroBanner from "@/components/common/HeroBanner";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChalkboardTeacher,
  faBook,
  faGraduationCap,
  faExternalLinkAlt,
} from "@fortawesome/free-solid-svg-icons";
import {
  faMicrosoft,
  faGoogle,
  faWindows,
  faYoutube,
} from "@fortawesome/free-brands-svg-icons";
import { useMemo } from "react";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";

// Map string keys to actual IconWrapper/Component
const ICON_MAP: Record<string, IconDefinition> = {
  "chalkboard-teacher": faChalkboardTeacher,
  "microsoft": faMicrosoft,
  "graduation-cap": faGraduationCap,
  "book": faBook,
  "windows": faWindows,
  "google": faGoogle,
  "youtube": faYoutube,
};

interface OnlineResourceItem {
  _id: string;
  key: string;
  link: string;
  iconName: string;
  imagePath?: string;
  colorClass: string;
  categoryKey: string;
  th: { title: string; description: string };
  en: { title: string; description: string };
}

export default function OnlineLearningPageClient({ initialResources }: { initialResources: OnlineResourceItem[] }) {
  const t = useTranslations("OnlineLearningPage");
  const breadcrumb = useTranslations("Breadcrumbs");
  const locale = useLocale();

  const groupedResources = useMemo(() => {
    const lang = locale === "th" ? "th" : "en";

    // Define structural categories similar to the static data
    const categories = [
      {
        key: "learning_resources",
        title: lang === "th" ? "แหล่งเรียนรู้และสื่อออนไลน์" : "Learning Resources & Media"
      },
      {
        key: "systems_tools",
        title: lang === "th" ? "ระบบและเครื่องมือสนับสนุนการเรียนรู้" : "Systems & Support Tools"
      }
    ];

    return categories.map(cat => ({
      ...cat,
      items: initialResources
        .filter(item => item.categoryKey === cat.key)
        .map(item => ({
          key: item.key,
          link: item.link,
          iconName: item.iconName,
          imagePath: item.imagePath,
          colorClass: item.colorClass,
          title: lang === "th" ? item.th.title : item.en.title,
          description: lang === "th" ? item.th.description : item.en.description,
        }))
    }));
  }, [initialResources, locale]);

  return (
    <main className="flex-grow">
      <HeroBanner
        title={t("title")}
        description={t("description")}
        eyebrow={t("eyebrow")}
        imageAlt={t("title")}
      />
      <section className="border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto w-full max-w-7xl px-6 py-4 lg:px-10">
          <Breadcrumbs
            items={[
              { href: `/${locale}`, label: breadcrumb("home") },
              { label: breadcrumb("onlineLearning") },
            ]}
          />
        </div>
      </section>

      <div className="mx-auto w-full max-w-7xl px-6 py-12 lg:px-10 space-y-16">
        {groupedResources.map((category, index) => (
          <section key={category.key} data-aos="fade-up" data-aos-delay={index * 100}>
            <div className="flex items-center gap-4 mb-8">
              <div className="h-8 w-1.5 bg-primary-main rounded-full"></div>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-800">
                {category.title}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {category.items.map((item) => {
                const Icon = ICON_MAP[item.iconName];

                return (
                  <Link
                    href={item.link}
                    key={item.key}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group bg-white rounded-xl p-6 shadow-sm border border-slate-100 hover:shadow-md hover:border-primary-main/30 transition-all duration-300 flex flex-col h-full"
                  >
                    <div className={`h-16 w-16 rounded-lg mb-6 flex items-center justify-center ${item.colorClass} group-hover:scale-110 transition-transform duration-300`}>
                      {item.imagePath ? (
                        <div className="relative h-12 w-12">
                          <Image
                            src={item.imagePath}
                            alt={item.title}
                            fill
                            className="object-contain"
                          />
                        </div>
                      ) : (
                        Icon && <FontAwesomeIcon icon={Icon} className="h-8 w-8" />
                      )}
                    </div>

                    <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-2 group-hover:text-primary-main transition-colors">
                      {item.title}
                    </h3>

                    <p className="text-slate-600 text-base mb-6 flex-grow leading-relaxed">
                      {item.description}
                    </p>

                    <div className="flex items-center text-primary-main font-semibold text-sm mt-auto group-hover:translate-x-1 transition-transform">
                      {t("items.visit")}
                      <FontAwesomeIcon icon={faExternalLinkAlt} className="ml-2 h-3 w-3" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
