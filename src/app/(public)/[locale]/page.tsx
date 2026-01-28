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
    const res = await fetch(`${baseUrl}/api/public/news`, { next: { revalidate: 3600 } }); // or revalidate
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
            className="mx-auto w-full max-w-7xl px-4"
          >
            <ul className="flex items-center gap-2 sm:gap-3 overflow-x-auto py-1 md:justify-center md:gap-0 md:overflow-visible">
              {itemsA.map((item, index) => (
                <li key={item.id} className="flex shrink-0 items-center">
                  <Link
                    href={item.href}
                    className="rounded-full bg-white/10 px-3 py-1.5 text-sm sm:text-base font-normal text-white transition-colors hover:bg-white/20 md:rounded-md md:bg-transparent md:px-2 md:py-2 md:text-lg md:hover:bg-white/10"
                  >
                    {item.label}
                  </Link>

                  {/* Separator on desktop only */}
                  {index !== itemsA.length - 1 && (
                    <span className="hidden px-1 text-white/50 md:flex lg:px-2">
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
            <ul className="flex items-center gap-2 sm:gap-2 overflow-x-auto py-1 md:justify-center md:gap-0 md:overflow-visible">
              {itemsB.map((item, index) => (
                <li key={item.id} className="flex shrink-0 items-center">
                  <Link
                    href={item.href}
                    className="rounded-full bg-slate-100 px-3 py-2 text-sm sm:text-base font-normal text-slate-700 transition-colors hover:bg-slate-200 md:rounded-none md:bg-transparent md:px-2 md:py-2 md:text-lg md:text-slate-800 md:hover:bg-transparent md:hover:text-primary-main"
                  >
                    {item.label}
                  </Link>

                  {/* Separator on desktop only */}
                  {index !== itemsB.length - 1 && (
                    <span className="hidden px-0 text-slate-300 md:flex lg:px-1">
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
