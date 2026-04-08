import HeroCarouselDisplay from "@/components/common/HeroCarouselDisplay";

import LatestNewsSection from "@/components/home/LatestNewsSection";
import PhilosophyBanner from "@/components/home/PhilosophyBanner";
import TrainingEventsSection from "@/components/home/TrainingEventsSection";
import ServicesSection from "@/components/home/OnlineServicesSection";
import ExploreMore from "@/components/home/ExploreMoreSection";

import { getTranslations, getLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { getApiBaseUrl } from "@/lib/api-config";

import PipeIcon from "@/components/icons/PipeIcon";
import { getTrainingItems } from "@/data/training";

async function getLatestNews() {
  const baseUrl = getApiBaseUrl();
  try {
    const res = await fetch(`${baseUrl}/api/public/news`, { cache: 'no-store' }); // Disable cache for real-time updates
    if (!res.ok) return [];
    return res.json();
  } catch (error) {
    console.error("Failed to fetch news:", error);
    return [];
  }
}

async function getPublicSettings() {
  const baseUrl = getApiBaseUrl();
  try {
    const res = await fetch(`${baseUrl}/api/public/settings`, { next: { revalidate: 0 } });
    if (!res.ok) return null;
    return res.json();
  } catch (error) {
    console.error("Failed to fetch settings:", error);
    return null;
  }
}

export default async function Home() {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: "Hero" });
  const tNews = await getTranslations({ locale, namespace: "News" });
  const tTraining = await getTranslations({ locale, namespace: "Training" });
  // const locale = useLocale(); // We get locale from params in server component

  const itemsA = [
    { id: "admissions", label: t("admissions"), href: `/apply` },
    { id: "programs", label: t("programs"), href: `/programs` },
    { id: "Department Information", label: t("deptinfo"), href: `/about` },
    { id: "olr", label: t("olr"), href: `/online-learning-resources` },
    { id: "research", label: t("research"), href: `/research` },
  ];

  const itemsB = [
    { id: "FACILITIES", label: t("facilities"), href: `/facilities` },
    { id: "Student Services", label: t("studentservices"), href: `/student-services` },
    { id: "Awards", label: t("awards"), href: `/awards` },
    { id: "Form Requests", label: t("formRequests"), href: `/form-requests` },
  ];

  const newsItems = await getLatestNews();
  const settings = await getPublicSettings();
  const trainingItems = getTrainingItems();

  const embedUrls = settings?.training ? [
    settings.training.embed1,
    settings.training.embed2,
    settings.training.embed3
  ].filter(Boolean) : [];

  const embedOgData = settings?.training ? [
    settings.training.og1,
    settings.training.og2,
    settings.training.og3
  ] : [];


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
            className="mx-auto w-full max-w-7xl px-4"
          >
            <ul className="flex items-center gap-2 sm:gap-3 overflow-x-auto py-1 md:justify-center lg:gap-0 lg:overflow-visible [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {itemsA.map((item, index) => (
                <li key={item.id} className="flex shrink-0 items-center">
                  <Link
                    href={item.href}
                    className="rounded-full bg-white/10 px-3 py-1.5 text-sm sm:text-base font-normal text-white transition-colors hover:bg-white/20 lg:rounded-md lg:bg-transparent lg:px-2 lg:py-2 lg:text-lg lg:hover:bg-white/10"
                  >
                    {item.label}
                  </Link>

                  {/* Separator on desktop only */}
                  {index !== itemsA.length - 1 && (
                    <span className="hidden px-1 text-white/50 lg:flex lg:px-2">
                      <PipeIcon className="h-6 w-4 sm:h-7 md:h-8" strokeWidth={4} />
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="border-b bg-white py-4 shadow-sm">
          <nav
            aria-label="Secondary quick links"
            className="mx-auto w-full max-w-7xl px-4"
          >
            <ul className="flex items-center gap-2 sm:gap-2 overflow-x-auto py-1 md:justify-center lg:gap-0 lg:overflow-visible [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {itemsB.map((item, index) => (
                <li key={item.id} className="flex shrink-0 items-center">
                  <Link
                    href={item.href}
                    className="rounded-full bg-slate-100 px-3 py-2 text-sm sm:text-base font-normal text-slate-700 transition-colors hover:bg-slate-200 lg:rounded-none lg:bg-transparent lg:px-2 lg:py-2 lg:text-lg lg:text-slate-800 lg:hover:bg-transparent lg:hover:text-primary-main"
                  >
                    {item.label}
                  </Link>

                  {/* Separator on desktop only */}
                  {index !== itemsB.length - 1 && (
                    <span className="hidden px-0 text-slate-300 lg:flex lg:px-1">
                      <PipeIcon className="h-6 w-4 sm:h-7 md:h-8" strokeWidth={4} />
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
          seeMoreHref={`/newsandevents`}
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
          embedUrls={embedUrls}
          embedOgData={embedOgData}
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
