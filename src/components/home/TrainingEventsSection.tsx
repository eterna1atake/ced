"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { NewsSeedItem as NewsItem } from "@/types/news";

type OGData = {
  title: string;
  description: string;
  image: string;
  url: string;
} | null;

type TrainingEventsSectionProps = {
  title: string;
  subtitle?: string;
  items?: NewsItem[];
  locale?: string;
  readMoreLabel?: string;
  emptyLabel?: string;
  seeAllLabel?: string;
  embedUrls?: string[];
  embedOgData?: OGData[];
};

/**
 * Renders a Facebook post preview card using cached OG data (fetched at admin save time).
 * Falls back to a live OG fetch if no cached data is available.
 */
function FacebookPreviewCard({
  embedUrl,
  cachedOg,
}: {
  embedUrl: string;
  cachedOg: OGData;
}) {
  const [og, setOg] = useState<OGData>(cachedOg);
  const [loading, setLoading] = useState(!cachedOg);

  useEffect(() => {
    // Only fetch live if no cached data exists
    if (cachedOg) return;

    const controller = new AbortController();
    fetch(`/cedweb/api/public/og-preview?url=${encodeURIComponent(embedUrl)}`, {
      signal: controller.signal,
    })
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data: OGData) => {
        setOg(data);
        setLoading(false);
      })
      .catch((err) => {
        if (err?.name !== "AbortError") setLoading(false);
      });

    return () => controller.abort();
  }, [embedUrl, cachedOg]);

  if (loading) {
    return (
      <div className="flex h-full w-full animate-pulse flex-col rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="h-48 w-full bg-slate-200" />
        <div className="p-4 space-y-3">
          <div className="h-4 w-3/4 rounded bg-slate-200" />
          <div className="h-3 w-full rounded bg-slate-200" />
          <div className="h-3 w-5/6 rounded bg-slate-200" />
        </div>
      </div>
    );
  }

  if (!og || !og.title) {
    return (
      <Link
        href={embedUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex h-full w-full flex-col items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#1877F2]/10">
          <svg viewBox="0 0 24 24" className="h-8 w-8 fill-[#1877F2]">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
        </div>
        <span className="text-sm font-semibold text-slate-700 group-hover:text-primary-main transition-colors">
          ดูกิจกรรมการอบรมบน Facebook
        </span>
      </Link>
    );
  }

  return (
    <Link
      href={og.url || embedUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex h-full w-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
    >
      {/* OG Image — loaded via server proxy to bypass Facebook hotlink protection */}
      {og.image ? (
        <div className="relative h-64 w-full overflow-hidden bg-slate-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/cedweb/api/public/og-image?url=${encodeURIComponent(og.image)}`}
            alt={og.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {/* Facebook badge overlay */}
          <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 backdrop-blur-sm shadow-sm">
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-[#1877F2]">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            <span className="text-xs font-bold text-slate-700">Facebook</span>
          </div>
        </div>
      ) : (
        <div className="flex h-44 w-full items-center justify-center bg-gradient-to-br from-[#1877F2] to-[#0d65d9]">
          <svg viewBox="0 0 24 24" className="h-12 w-12 fill-white/80">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
        </div>
      )}

      {/* Text content */}
      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
          Facebook
        </p>
        <h3 className="text-md font-bold text-slate-900 line-clamp-2 leading-snug mb-2 group-hover:text-primary-main transition-colors">
          {og.title}
        </h3>
        {og.description && (
          <p className="text-sm text-slate-500 line-clamp-3 leading-relaxed">
            {og.description}
          </p>
        )}
        <div className="mt-auto pt-3 flex items-center gap-1.5 text-xs text-primary-main font-semibold">
          <span>ดูโพสต์เต็ม</span>
          <svg
            className="h-3 w-3 transition-transform group-hover:translate-x-0.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
            />
          </svg>
        </div>
      </div>
    </Link>
  );
}

export default function TrainingEventsSection({
  title,
  subtitle,
  seeAllLabel,
  embedUrls = [],
  embedOgData = [],
}: TrainingEventsSectionProps) {
  const validEmbeds = embedUrls.filter((url) => url && url.trim() !== "");
  const hasEmbeds = validEmbeds.length > 0;

  return (
    <section className="bg-slate-50 px-6 py-12 lg:px-24">
      <div className="mx-auto max-w-7xl">
        <header className="mb-12 text-center">
          <h2 className="text-2xl lg:text-3xl font-semibold text-slate-900">{title}</h2>
          {subtitle ? <p className="mt-3 text-base text-slate-600">{subtitle}</p> : null}
        </header>

        {hasEmbeds ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
            {validEmbeds.map((url, index) => (
              <FacebookPreviewCard
                key={`training-og-${index}`}
                embedUrl={url}
                cachedOg={embedOgData[index] ?? null}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-slate-500 bg-slate-100 rounded-lg border border-dashed border-slate-300">
            <p className="text-lg font-medium">No training events available at the moment.</p>
            <p className="text-sm mt-2 opacity-75">
              Please configure Facebook Embed URLs in Admin Dashboard.
            </p>
          </div>
        )}

        <div className="mt-12 text-center">
          <Link
            href="https://www.facebook.com/CEDTrainingCenter"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-md border border-primary-main px-6 py-2 text-sm font-semibold text-white bg-primary-main transition-colors duration-200 hover:bg-white hover:text-primary-main"
          >
            {seeAllLabel}
          </Link>
        </div>
      </div>
    </section>
  );
}
