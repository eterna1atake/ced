import Link from "next/link";
import type { NewsSeedItem as NewsItem } from "@/types/news";

type TrainingEventsSectionProps = {
  title: string;
  subtitle?: string;
  items?: NewsItem[];
  locale?: string;
  readMoreLabel?: string;
  emptyLabel?: string;
  seeAllLabel?: string;
};

type FacebookEmbedItem = {
  embedUrl: string;
  width?: number;
  height?: number;
};

const FACEBOOK_EMBED_DEFAULT_WIDTH = 400;
const FACEBOOK_EMBED_DEFAULT_HEIGHT = 600;

const FACEBOOK_EMBEDS: ReadonlyArray<FacebookEmbedItem> = [
  {
    embedUrl:
      "https://www.facebook.com/plugins/post.php?href=https%3A%2F%2Fwww.facebook.com%2FCEDTrainingCenter%2Fposts%2Fpfbid0RYZFd6L5ih2pbyCkMiaapxM7tYnvwKXh7oRZGWwPABntLRHZ9aJQimTrSF5rVFsCl&show_text=true&width=500",
    width: 350,
    height: 600,
  },
  {
    embedUrl:
      "https://www.facebook.com/plugins/post.php?href=https%3A%2F%2Fwww.facebook.com%2FCEDTrainingCenter%2Fposts%2Fpfbid02EKSmsZhbM9uJBgXA8ytizr8LfR6EKLZAiKYCvSdnBxdKoj8p5GySRZCbnkeUfNYzl&show_text=true&width=500",
    width: 350,
    height: 600,
  },
  {
    embedUrl:
      "https://www.facebook.com/plugins/post.php?href=https%3A%2F%2Fwww.facebook.com%2FCEDTrainingCenter%2Fposts%2Fpfbid032gCTxUv1eMrM2KwmgsZHUMVsCdBNZToHKWwoV3rAx1BkQ7kvmojASQ6Kwc7MbEsgl&show_text=true&width=500",
    width: 350,
    height: 600,
  },
] as const;

function FacebookPostEmbed({
  embedUrl,
  width = FACEBOOK_EMBED_DEFAULT_WIDTH,
  height = FACEBOOK_EMBED_DEFAULT_HEIGHT,
}: FacebookEmbedItem) {
  let resolvedUrl = embedUrl;
  const resolvedWidth = width ?? FACEBOOK_EMBED_DEFAULT_WIDTH;
  const resolvedHeight = height ?? Math.round(resolvedWidth * (FACEBOOK_EMBED_DEFAULT_HEIGHT / FACEBOOK_EMBED_DEFAULT_WIDTH));

  try {
    const url = new URL(embedUrl);
    url.searchParams.set("width", String(resolvedWidth));
    resolvedUrl = url.toString();
  } catch {
    // ignore invalid URLs and use the original string
  }

  return (
    <iframe
      title="Facebook post embed"
      src={resolvedUrl}
      width="100%"
      height={resolvedHeight}
      style={{
        border: "none",
        overflow: "hidden",
        maxWidth: `${resolvedWidth}px`,
        display: "block",
        margin: "0 auto",
      }}
      scrolling="no"
      frameBorder={0}
      allowFullScreen
      allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
    />
  );
}

/**
 * Static embed section for the KMUTNB Training Facebook post.
 * Renders the same embed across a three-column grid layout.
 */
export default function TrainingEventsSection({
  title,
  subtitle,
  seeAllLabel,
}: TrainingEventsSectionProps) {
  return (
    <section className="bg-slate-50 px-6 py-12 lg:px-24">
      <div className="mx-auto max-w-7xl">
        <header className="mb-12 text-center">
          <h2 className="text-2xl lg:text-3xl font-semibold text-slate-900">{title}</h2>
          {subtitle ? <p className="mt-3 text-base text-slate-600">{subtitle}</p> : null}
        </header>

        <div className="grid grid-cols-1 justify-items-center gap-4 lg:gap-0 sm:grid-cols-2 md:grid-cols-3">
          {FACEBOOK_EMBEDS.map((embed, index) => {
            const targetWidth = embed.width ?? FACEBOOK_EMBED_DEFAULT_WIDTH;
            const cardMaxWidth = Math.max(targetWidth, 280);

            return (
              <article
                key={`training-facebook-${index}`}
                className="flex h-full w-full flex-col rounded-lg border border-slate-200 bg-white shadow-sm"
                style={{ width: "100%", maxWidth: `${cardMaxWidth + 24}px` }}
              >
                <div className="w-full overflow-hidden rounded-t-lg bg-slate-100">
                  <FacebookPostEmbed {...embed} />
                </div>
              </article>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <Link
            href="https://www.facebook.com/CEDTrainingCenter"
            className="inline-flex items-center gap-2 rounded-md border border-primary-main px-6 py-2 text-sm font-semibold text-white bg-primary-main transition-colors duration-200 hover:bg-white hover:text-primary-main"
          >
            {seeAllLabel}
          </Link>
        </div>
      </div>
    </section>
  );
}
