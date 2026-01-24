import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, type ReactNode } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons";


export interface NewsCardProps {
  title: string;
  summary: string | ReactNode;
  imageSrc?: string;
  galleryImages?: string[];
  imageAlt?: string;
  category?: string;
  date?: string | Date;
  author?: string;
  href?: string;
  className?: string;
  locale?: string;
  dateFormatOptions?: Intl.DateTimeFormatOptions;
  readMoreLabel?: string;
  makeWholeCardClickable?: boolean;
}

/**
 * Presentational card for highlighting a single news item.
 * Supports optional cover image, category tag, metadata, and a "read more" link.
 */
export default function NewsCard({
  title,
  summary,
  imageSrc,
  galleryImages,
  imageAlt,
  category,
  date,
  author,
  href,
  className,
  locale,
  dateFormatOptions,
  readMoreLabel = "Read more",
  makeWholeCardClickable = false,
}: NewsCardProps) {
  const cardClasses = [
    "group relative flex h-full w-full max-w-full flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg min-w-0",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const parsedDate =
    typeof date === "string" ? new Date(date) : date instanceof Date ? date : undefined;
  const hasValidDate = parsedDate && !Number.isNaN(parsedDate.getTime());

  const formatOptions: Intl.DateTimeFormatOptions = dateFormatOptions ?? {
    day: "numeric",
    month: "short",
    year: "numeric",
  };

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const formattedDate =
    hasValidDate && parsedDate && isMounted
      ? new Intl.DateTimeFormat(locale || undefined, formatOptions).format(parsedDate)
      : undefined;

  const machineDate = hasValidDate && parsedDate ? parsedDate.toISOString() : undefined;

  const coverImage = imageSrc ?? galleryImages?.[0];

  let targetHref = href;
  if (href && locale && href.startsWith("/")) {
    targetHref = href.startsWith(`/${locale}`) ? href : `/${locale}${href}`;
  }

  const cardContent = (
    <article
      className={cardClasses}
      aria-labelledby="news-card-title"
      data-aos="fade-up"
      suppressHydrationWarning
    >
      {coverImage ? (
        <div className="relative h-48 md:h-56 lg:h-64 w-full overflow-hidden bg-slate-50">
          <Image
            src={coverImage}
            alt={imageAlt ?? title}
            fill
            sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
            className="object-cover transition duration-300 group-hover:scale-105"
            priority={false}
          />

          {category && (
            <span className="absolute left-4 top-4 rounded-lg bg-primary-main/80 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white shadow-md">
              {category}
            </span>
          )}
        </div>
      ) : (
        category && (
          <div className="px-4 pt-4 md:px-6 md:pt-6">
            <span className="inline-flex items-center rounded-lg bg-primary-main/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary-main">
              {category}
            </span>
          </div>
        )
      )}

      <div className="flex flex-1 flex-col gap-3 md:gap-4 p-4 md:p-6 min-w-0">
        <h3 className="text-lg md:text-xl font-semibold text-slate-900 transition-colors duration-200 group-hover:text-primary-main line-clamp-2 min-h-[3.5rem] break-all">
          {title}
        </h3>


        {typeof summary === "string" ? (
          <p className="text-base leading-relaxed text-slate-600 line-clamp-3 flex-1 break-all">{summary}</p>
        ) : (
          <div className="line-clamp-3 flex-1 break-all">{summary}</div>
        )}


        <div className="mt-auto flex flex-wrap items-center gap-3 text-sm font-medium text-slate-500">
          {formattedDate && machineDate && <time dateTime={machineDate}>{formattedDate}</time>}
          {author && <span>{author}</span>}
        </div>

        {href && (
          <div>
            {makeWholeCardClickable ? (
              <span className="pointer-events-none inline-flex items-center text-sm font-semibold text-primary-main">
                {readMoreLabel}
                <span aria-hidden className="transition-transform duration-200 group-hover:translate-x-1">
                  <FontAwesomeIcon icon={faChevronRight} />
                </span>
              </span>
            ) : (
              <Link
                href={targetHref ?? href}
                className="inline-flex items-center gap-2 text-sm font-semibold text-primary-main transition-colors duration-200 hover:text-secondary-main focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-main/60 focus-visible:ring-offset-2"
              >
                {readMoreLabel}
                <span aria-hidden className="transition-transform duration-200 group-hover:translate-x-1">
                  <FontAwesomeIcon icon={faChevronRight} />
                </span>
              </Link>
            )}
          </div>
        )}
      </div>
    </article>
  );

  if (href && makeWholeCardClickable) {
    return (
      <Link
        href={targetHref ?? href}
        className="block h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-main/60 focus-visible:ring-offset-2"
      >

        {cardContent}
      </Link>
    );
  }

  return cardContent;
}
