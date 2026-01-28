"use client";

import Link from "next/link";
import NewsCard from "@/components/common/NewsCard";
import { useTranslations } from "next-intl";

import type { NewsSeedItem } from "@/types/news";

type LatestNewsSectionProps = {
  title: string;
  locale: string;
  loadingLabel?: string;
  emptyLabel: string;
  readMoreLabel: string;
  seeMoreLabel: string;
  seeMoreHref: string;
  items: NewsSeedItem[]; // Passed from parent
};

export default function LatestNewsSection({
  title,
  locale,
  emptyLabel,
  readMoreLabel,
  seeMoreLabel,
  seeMoreHref,
  items = [],
}: LatestNewsSectionProps) {
  const tNews = useTranslations("News");

  // Use passed items
  const displayItems = items.slice(0, 6);


  return (
    <section className="p-8 md:px-6 lg:px-32">
      <h2 className="text-center lg:text-start text-2xl lg:text-3xl font-medium text-black">{title}</h2>

      {displayItems.length === 0 ? (
        <p className="mt-4 text-center text-sm text-slate-500">{emptyLabel}</p>
      ) : null}

      <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {displayItems.map((item) => (
          <NewsCard
            key={item.slug || item.id}
            title={item.title[locale as "en" | "th"]}
            summary={item.content[locale as "en" | "th"]}
            imageSrc={item.imageSrc}
            galleryImages={item.galleryImages}
            category={item.category ? tNews(`categories.${item.category}`) : undefined}
            date={item.date}
            author={item.author[locale as "en" | "th"]}
            href={`/news/${item.slug ?? item.id}`}
            locale={locale}
            readMoreLabel={readMoreLabel}
            makeWholeCardClickable
          />
        ))}
      </div>

      <div className="mt-8 flex justify-center">
        <Link
          href={seeMoreHref}
          className="inline-flex items-center gap-2 rounded-md border border-primary-main px-6 py-2 text-sm font-semibold text-white bg-primary-main transition-colors duration-200 hover:bg-white hover:text-primary-main"
        >
          {seeMoreLabel}
        </Link>
      </div>
    </section>
  );
}
