"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";

import { faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { useLocale } from "next-intl";

export default function ExploreMoreSection() {
  const t = useTranslations("Hero");

  const locale = useLocale();

  return (
    <section className="explore-more">
      <div className="mx-auto max-w-7xl mt-8 px-6 lg:px-24">
        <header className="mb-4 md:mb-6 lg:mb-8 text-center">
          <h2 className="text-2xl lg:text-3xl font-semibold text-primary-main" data-aos="fade-up" data-aos-delay="100" suppressHydrationWarning>{t("headerTitle")}</h2>
          <p className="mt-4 md:mt-6 lg:mt-8 text-base text-slate-700" data-aos="fade-up" data-aos-delay="200" suppressHydrationWarning>{t("headerDesc")}</p>
        </header>
        <div className="flex justify-center gap-6 md:gap-12 lg:gap-18 mb-16" data-aos="fade-up" data-aos-delay="300" suppressHydrationWarning>
          <Link href={`/${locale}/about`} target="_self" className="flex items-center gap-2">
            <span className="text-primary-main">{t("aboutDepartment")}</span>
            <FontAwesomeIcon icon={faChevronRight} className="w-3 h-3 text-white bg-primary-main p-0.5 rounded-full" />
          </Link>

          <Link href={`/${locale}/contact-us`} target="_self" className="flex items-center gap-2">
            <span className="text-primary-main">{t("contactUs")}</span>
            <FontAwesomeIcon icon={faChevronRight} className="w-3 h-3 text-white bg-primary-main p-0.5 rounded-full" />
          </Link>
        </div>
      </div>
    </section>
  );
}