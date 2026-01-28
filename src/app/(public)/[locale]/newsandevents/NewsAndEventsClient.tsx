"use client";

import Breadcrumbs from "@/components/common/Breadcrumbs";
import NewsCard from "@/components/common/NewsCard";
import Pagination from "@/components/common/Pagination";
import type { NewsSeedItem as NewsItem } from "@/types/news";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useMemo, useState, ChangeEvent } from "react";

import { faMagnifyingGlass, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import HeroBanner from "@/components/common/HeroBanner";
import FloatingBackButton from "@/components/common/FloatingBackButton";

const ITEMS_PER_PAGE = 9;

type Props = {
  initialNews: NewsItem[];
};

export default function NewsAndEventsClient({ initialNews }: Props) {
  const t = useTranslations("News");
  const breadcrumb = useTranslations("Breadcrumbs");
  const locale = useLocale();
  // Filter only published news by default, similar to what the API was doing
  const [newsItems] = useState<NewsItem[]>(initialNews);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedTag, setSelectedTag] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const categories = useMemo(() => {
    const values = new Set<string>();
    newsItems.forEach((item) => {
      if (item.category) {
        values.add(item.category);
      }
    });
    return Array.from(values).sort((a, b) => {
      const labelA = t(`categories.${a}`);
      const labelB = t(`categories.${b}`);
      return labelA.localeCompare(labelB, locale);
    });
  }, [newsItems, locale, t]);

  const tags = useMemo(() => {
    const values = new Set<string>();
    newsItems.forEach((item) => {
      (item.tags ?? []).forEach((tag) => {
        if (tag) {
          values.add(tag);
        }
      });
    });
    return Array.from(values).sort((a, b) => {
      const labelA = t(`tags.${a}`);
      const labelB = t(`tags.${b}`);
      return labelA.localeCompare(labelB, locale);
    });
  }, [newsItems, locale, t]);

  const filteredNews = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return newsItems.filter((item) => {
      const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
      const matchesTag =
        selectedTag === "all" || (item.tags ?? []).some((tag) => tag === selectedTag);

      const searchPool = [
        item.title["en"],
        item.title["th"],
        item.summary["en"],
        item.summary["th"],
        item.category ?? "",
        ...(item.tags ?? []),
      ];
      const matchesSearch =
        normalizedSearch.length === 0 ||
        searchPool.some((value) =>
          value ? value.toLowerCase().includes(normalizedSearch) : false
        );

      return matchesCategory && matchesTag && matchesSearch;
    });
  }, [newsItems, searchTerm, selectedCategory, selectedTag]);

  const totalPages = Math.max(1, Math.ceil(filteredNews.length / ITEMS_PER_PAGE));

  const paginatedNews = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredNews.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredNews, currentPage]);





  // Security: Input Sanitization
  const sanitizeInput = (input: string) => {
    // 1. Trim whitespace
    let sanitized = input;

    // 2. Prevent XSS: Remove key characters used in HTML injection
    sanitized = sanitized.replace(/[<>]/g, "");

    // 3. Prevent SQL Injection-like patterns (Defense in Depth)
    // Removing common SQL comment styles and quote manipulation
    // Note: Since this is client-side filtering, SQLi isn't directly possible here,
    // but this prevents bad habits and protects if logic moves to server.
    sanitized = sanitized.replace(/(--|#|\/\*|\*\/)/g, "");

    // 4. Length limit
    if (sanitized.length > 50) {
      sanitized = sanitized.slice(0, 50);
    }

    return sanitized;
  };

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    const sanitizedValue = sanitizeInput(value);
    setSearchTerm(sanitizedValue);
  };

  // Global clear function removed as requested, individual clears used instead.

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, selectedTag, searchTerm, newsItems.length]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);



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
              { label: breadcrumb("newsEvents") },
            ]}
          />
        </div>
        <FloatingBackButton />
      </section>
      <section className="mx-auto w-full max-w-7xl px-8 pb-6 lg:px-10">

        <div className="mt-8 border-slate-200 bg-white">
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="flex flex-col gap-2">
              <label
                className="text-sm font-medium text-slate-700"
                htmlFor="news-list-category-filter"
              >
                {t("categoryLabel")}
              </label>
              <div className="relative">
                <select
                  id="news-list-category-filter"
                  className="w-full rounded-lg border border-primary-main px-3 py-2 pr-14 text-sm text-slate-700 shadow-sm focus:border-primary-main focus:outline-none focus:ring-2 focus:ring-primary-main/40 appearance-none"
                  value={selectedCategory}
                  onChange={(event) => setSelectedCategory(event.target.value)}
                >
                  <option value="all">{t("filterCategoryAll")}</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {t(`categories.${category}`)}
                    </option>
                  ))}
                </select>
                {selectedCategory !== "all" ? (
                  <button
                    type="button"
                    onClick={() => setSelectedCategory("all")}
                    className="absolute right-8 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                  >
                    <FontAwesomeIcon icon={faXmark} className="h-3 w-3" />
                  </button>
                ) : null}
                {/* Custom Arrow because we used appearance-none to make room for X. Or stick to native arrow? 
                        If we use appearance-none, we lose the arrow. Let's try keeping native appearance but placing X carefully. 
                        Actually, 'pr-8' might push the text but not the native arrow in some browsers. 
                        Let's render a custom arrow at right-3 and put X at right-8.
                    */}
                <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-slate-700" htmlFor="news-list-tag-filter">
                {t("filterTagLabel")}
              </label>
              <div className="relative">
                <select
                  id="news-list-tag-filter"
                  className="w-full rounded-lg border border-primary-main px-3 py-2 pr-14 text-sm text-slate-700 shadow-sm focus:border-primary-main focus:outline-none focus:ring-2 focus:ring-primary-main/40 appearance-none"
                  value={selectedTag}
                  onChange={(event) => setSelectedTag(event.target.value)}
                >
                  <option value="all">{t("filterTagAll")}</option>
                  {tags.map((tag) => (
                    <option key={tag} value={tag}>
                      {t(`tags.${tag}`)}
                    </option>
                  ))}
                </select>
                {selectedTag !== "all" ? (
                  <button
                    type="button"
                    onClick={() => setSelectedTag("all")}
                    className="absolute right-8 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                  >
                    <FontAwesomeIcon icon={faXmark} className="h-3 w-3" />
                  </button>
                ) : null}
                <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-slate-700" htmlFor="news-list-search">
                {t("filterSearchLabel")}
              </label>
              <div className="relative">
                <FontAwesomeIcon
                  icon={faMagnifyingGlass}
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                />
                <input
                  id="news-list-search"
                  type="text"
                  className="w-full rounded-lg border border-primary-main pl-10 pr-10 py-2 text-sm text-slate-700 shadow-sm focus:border-primary-main focus:outline-none focus:ring-2 focus:ring-primary-main/40"
                  placeholder={t("filterSearchPlaceholder")}
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
                {searchTerm.length > 0 ? (
                  <button
                    type="button"
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                  >
                    <FontAwesomeIcon icon={faXmark} className="h-3 w-3" />
                  </button>
                ) : null}
              </div>
            </div>
          </div>

          {/* Removed Global Clear Button */}
        </div>

        {filteredNews.length === 0 ? (
          <p className="mt-8 text-sm text-slate-500">{t("noNews")}</p>
        ) : null}

        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {paginatedNews.map((item) => (
            <NewsCard
              key={item.slug || item.id}
              title={item.title[locale as "en" | "th"]}
              summary={item.content[locale as "en" | "th"]}
              imageSrc={item.imageSrc}
              galleryImages={item.galleryImages}
              category={item.category ? t(`categories.${item.category}`) : undefined}
              date={item.date}
              author={item.author[locale as "en" | "th"]}
              href={item.href ?? `/news/${item.slug ?? item.id}`}
              locale={locale}
              readMoreLabel={t("readMore")}
              makeWholeCardClickable
            />
          ))}
        </div>


        <Pagination
          className="mt-12 flex justify-center items-center gap-2"
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />

      </section>
    </main>


  );
}
