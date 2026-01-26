import type { Metadata } from "next";
import { notFound } from "next/navigation";

import Breadcrumbs from "@/components/common/Breadcrumbs";
import FloatingBackButton from "@/components/common/FloatingBackButton";
import NewsGallery from "@/components/news/NewsGallery";
// import { getNewsBySlug } from "@/data/newsData"; // Removed
import { getTranslations } from "next-intl/server";
import HeroBanner from "@/components/common/HeroBanner";
import { getApiBaseUrl } from "@/lib/api-config";

type NewsDetailPageProps = {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
};

async function getNewsItem(slug: string) {
  const baseUrl = getApiBaseUrl();
  try {
    const res = await fetch(`${baseUrl}/api/public/news/${slug}`, {
      cache: 'no-store'
    });
    if (!res.ok) return null;
    return res.json();
  } catch (error) {
    console.error("Failed to fetch news item:", error);
    return null;
  }
}

export async function generateMetadata({ params }: NewsDetailPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const tMeta = await getTranslations({ locale, namespace: "Meta" });
  const baseTitle = tMeta("newsDetailTitle");
  const newsItem = await getNewsItem(slug);

  const title = newsItem ? newsItem.title[locale as "en" | "th"] : baseTitle;

  return {
    title: newsItem ? `${title} | ${baseTitle}` : baseTitle,
  };
}

const formatDate = (value: string | Date, locale: string) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return String(value);
  }

  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(parsed);
};

export default async function NewsDetailPage({ params }: NewsDetailPageProps) {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: "News" });
  const breadcrumb = await getTranslations({ locale, namespace: "Breadcrumbs" });
  const newsItem = await getNewsItem(slug);

  if (!newsItem) {
    notFound();
  }

  const gallery = [
    newsItem.imageSrc,
    ...(newsItem.galleryImages ?? []),
  ].filter((value): value is string => Boolean(value));

  const formattedDate = formatDate(newsItem.date, locale);

  const content = newsItem.content[locale as "en" | "th"];
  const contentBlocks = (content ?? "")
    .split(/\n{2,}/) // Split by double newlines for paragraphs
    .map((block: string) => block.trim())
    .filter((block: string) => block.length > 0);

  return (

    <main>
      <HeroBanner
        title={t("title")}
        description={t("description")}
        eyebrow="Latest Updates"
        imageAlt={t("title")}
      />
      <section className="mx-auto w-full max-w-7xl px-6 lg:px-10">
        <div className="border-b border-slate-200 bg-slate-50/80 py-4">
          <Breadcrumbs
            items={[
              { href: `/${locale}`, label: breadcrumb("home") },
              { href: `/${locale}/newsandevents`, label: breadcrumb("newsEvents") },
              { label: newsItem.title[locale as "en" | "th"] },
            ]}
          />
        </div>
        <FloatingBackButton />
      </section>
      <div className="mx-auto w-full max-w-5xl px-6 py-10 lg:px-8">
        <article className="space-y-8">
          <header className="space-y-2 md:space-y-4">
            <span className="inline-flex items-center rounded-full bg-primary-main/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary-main">
              {newsItem.category ? t(`categories.${newsItem.category}`) : t("categoryLabel")}
            </span>
            <h1 className="text-2xl md:text-3xl font-semibold text-slate-900 sm:text-4xl">
              {newsItem.title[locale as "en" | "th"]}
            </h1>
            <div className="flex flex-wrap items-center gap-2 md:gap-3 text-sm text-slate-500">
              <span>{t("publishedOn", { date: formattedDate })}</span>
              {newsItem.author ? (
                <>
                  <span aria-hidden>•</span>
                  <span>
                    {t("authorLabel")}: {newsItem.author[locale as "en" | "th"]}
                  </span>
                </>
              ) : null}
            </div>
          </header>

          {gallery.length > 0 ? (
            <NewsGallery
              images={gallery}
              title={newsItem.title[locale as "en" | "th"]}
              mainAlt={newsItem.imageAlt}
              heading={t("galleryHeading")}
            />
          ) : null}

          <section className="space-y-5 text-base leading-relaxed text-slate-700">
            <p className="text-lg font-medium text-slate-800">{newsItem.summary[locale as "en" | "th"]}</p>
            {contentBlocks.length > 0 ? (
              contentBlocks.map((block: string, index: number) => (
                <p key={index} className="whitespace-pre-line">
                  {block}
                </p>
              ))
            ) : (
              <p className="text-sm text-slate-500">{t("noContent")}</p>
            )}
          </section>
        </article>
      </div>
    </main>


  );
}
