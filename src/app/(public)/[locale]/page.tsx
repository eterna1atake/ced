import HeroCarouselDisplay from "@/components/common/HeroCarouselDisplay";

import LatestNewsSection from "@/components/home/LatestNewsSection";
import PhilosophyBanner from "@/components/home/PhilosophyBanner";
import TrainingEventsSection from "@/components/home/TrainingEventsSection";
import ServicesSection from "@/components/home/OnlineServicesSection";
import ExploreMore from "@/components/home/ExploreMoreSection";

import { getTranslations } from "next-intl/server";
import Image from "next/image";
import Link from "next/link";
import { getApiBaseUrl } from "@/lib/api-config";

import PipeIcon from "@/components/icons/PipeIcon";
import { getTrainingItems } from "@/data/training";

async function getLatestNews() {
  const baseUrl = getApiBaseUrl();
  try {
    const res = await fetch(`${baseUrl}/api/public/news`, { cache: 'no-store' }); // or revalidate
    if (!res.ok) return [];
    return res.json();
  } catch (error) {
    console.error("Failed to fetch news:", error);
    return [];
  }
}

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function Home({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Hero" });
  const tNews = await getTranslations({ locale, namespace: "News" });
  const tTraining = await getTranslations({ locale, namespace: "Training" });
  // const locale = useLocale(); // We get locale from params in server component

  const itemsA = [
    { id: "admissions", label: t("admissions"), href: "https://admission.kmutnb.ac.th" },
    { id: "programs", label: t("programs"), href: `/${locale}/programs` },
    { id: "Department Information", label: t("deptinfo"), href: `/${locale}/about` },
    { id: "CLASSROOM", label: t("classroom"), href: `/${locale}/classroom` },
    { id: "olr", label: t("olr"), href: `/${locale}/online-learning-resources` },
    { id: "research", label: t("research"), href: "https://research.kmutnb.ac.th" },
  ];

  const itemsB = [
    { id: "Majors, Minors AND Programs", label: t("major"), href: `/${locale}/programs` },
    { id: "Student Services", label: t("studentservices"), href: `/${locale}/student-services` },
    { id: "Awards", label: t("awards"), href: `/${locale}/awards` },
    { id: "Form Requests", label: t("formRequests"), href: `/${locale}/form-requests` },
  ];

  const newsItems = await getLatestNews();
  const trainingItems = getTrainingItems();

  return (
    <div className="relative bg-white w-full">
      <main>
        {/* Hero */}
        <section>
          <HeroCarouselDisplay />
        </section>
        {/* Main quick links (responsive) */}
        <div className="bg-primary-main py-2">
          <nav
            aria-label="Main quick links"
            className="mx-auto w-full max-w-7xl px-3 md:px-6"
          >
            <ul
              className={[
                // layout
                "flex items-center md:justify-center md:flex-wrap",
                // spacing
                "gap-2 md:gap-0",
                // mobile horizontal scroll
                "overflow-x-auto snap-x snap-mandatory md:overflow-visible",
                // hide scrollbars (cross-browser)
                "[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]",
                // text
                "text-white",
              ].join(" ")}
            >
              {itemsA.map((item, index) => (
                <li key={item.id} className="flex items-center shrink-0 snap-start">
                  <Link
                    href={item.href}
                    className={[
                      // mobile chip style
                      "px-3 py-2 rounded-full bg-white/10 hover:bg-white/15 transition-colors",
                      // desktop link style (no chip, underline on hover)
                      "md:rounded-none md:bg-transparent md:hover:bg-transparent md:px-0 md:py-2 hover:text-",
                      // type scale
                      "text-sm md:text-base",
                      // focus visible
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-primary-main md:focus-visible:ring-offset-0",
                      // touch target
                      "min-h-9",
                    ].join(" ")}
                  >
                    {item.label}
                  </Link>

                  {/* separator on desktop only */}
                  {index !== itemsA.length - 1 && (
                    <span className="hidden md:flex items-center px-1 lg:px-3">
                      <PipeIcon className="h-7 w-5 text-white" strokeWidth={6} />
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="bg-white py-4 border border-b-2 shadow-xl">
          <nav
            aria-label="Main quick links"
            className="mx-auto w-full max-w-7xl px-3 md:px-6"
          >
            <ul
              className={[
                // layout
                "flex items-center md:justify-center md:flex-wrap",
                // spacing
                "gap-2 md:gap-0",
                // mobile horizontal scroll
                "overflow-x-auto snap-x snap-mandatory md:overflow-visible",
                // hide scrollbars (cross-browser)
                "[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]",
                // text
                "text-white",
              ].join(" ")}
            >
              {itemsB.map((item, index) => (
                <li key={item.id} className="flex items-center shrink-0 snap-start">
                  <Link
                    href={item.href}
                    className={[
                      // mobile chip style
                      "px-3 py-2 rounded-full bg-white/10 hover:bg-white/15 transition-colors",
                      // desktop link style (no chip, color change on hover)
                      "md:rounded-none md:bg-transparent md:hover:bg-transparent md:px-0 md:py-2 hover:text-primary-main",
                      // type scale
                      "text-base md:text-base lg:text-lg text-black",
                      // focus visible
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-primary-main md:focus-visible:ring-offset-0",
                      // touch target
                      "min-h-9",
                    ].join(" ")}
                  >
                    {item.label}
                  </Link>

                  {/* separator on desktop only */}
                  {index !== itemsB.length - 1 && (
                    <span className="hidden md:flex items-center px-1 lg:px-3">
                      <PipeIcon className="h-10 w-5 text-zinc-700" strokeWidth={6} />
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <LatestNewsSection
          title={t("lastNew")}
          locale={locale}
          emptyLabel={tNews("noNews")}
          readMoreLabel={tNews("readMore")}
          seeMoreLabel={t("seeMore")}
          seeMoreHref={`/${locale}/newsandevents`}
          items={newsItems}
        />

        <PhilosophyBanner title={t("philosophy")} quote={t("philosophyDesc")} />

        <TrainingEventsSection
          title={tTraining("title")}
          subtitle={tTraining("subtitle")}
          items={trainingItems}
          locale={locale}
          readMoreLabel={tTraining("readMore")}
          emptyLabel={tTraining("empty")}
          seeAllLabel={tTraining("seeAll")}
        />

        <ServicesSection />

        <ExploreMore />

        <div className="relative overflow-hidden">
          <div className="absolute inset-0 z-10 bg-slate-900/40"></div>
          <div className="grid grid-cols-2 md:grid-cols-4">
            <div className="relative w-full overflow-hidden [aspect-ratio:16/9]">
              <Image
                src="/images/asset/497676733_1274546954676704_6633121732924987748_n.jpg"
                alt=""
                fill
                sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
                className="object-cover"
                priority={false}
              />
            </div>
            <div className="relative w-full overflow-hidden [aspect-ratio:16/9]">
              <Image
                src="/images/asset/499148888_1274746041323462_2720566343854152454_n.jpg"
                alt=""
                fill
                sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
                className="object-cover"
              />
            </div>
            <div className="relative hidden w-full overflow-hidden [aspect-ratio:16/9] md:block">
              <Image
                src="/images/asset/496269302_1270188171779249_2285773000223975626_n.jpg"
                alt=""
                fill
                sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
                className="object-cover"
              />
            </div>
            <div className="relative hidden w-full overflow-hidden [aspect-ratio:16/9] md:block">
              <Image
                src="/images/asset/496941514_1274616998003033_6495109133619884695_n.jpg"
                alt=""
                fill
                sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
