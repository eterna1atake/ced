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
  embedUrls?: string[];
};

type FacebookEmbedItem = {
  embedUrl: string;
  width?: number;
  height?: number;
};

const FACEBOOK_EMBED_DEFAULT_WIDTH = 350;
const FACEBOOK_EMBED_DEFAULT_HEIGHT = 620;

function FacebookPostEmbed({
  embedUrl,
  width = FACEBOOK_EMBED_DEFAULT_WIDTH,
  height = FACEBOOK_EMBED_DEFAULT_HEIGHT,
}: FacebookEmbedItem) {
  let resolvedUrl = embedUrl;
  const resolvedWidth = width ?? FACEBOOK_EMBED_DEFAULT_WIDTH;
  const resolvedHeight = height ?? Math.round(resolvedWidth * (FACEBOOK_EMBED_DEFAULT_HEIGHT / FACEBOOK_EMBED_DEFAULT_WIDTH));

  try {
    // Normalize web.facebook.com to www.facebook.com for consistency
    let normalizedEmbedUrl = embedUrl;
    if (embedUrl.includes("web.facebook.com")) {
      normalizedEmbedUrl = embedUrl.replace("web.facebook.com", "www.facebook.com");
    }

    const url = new URL(normalizedEmbedUrl);

    // Check if it's already the plugin URL
    if (url.pathname.includes("plugins/post.php")) {
      if (!url.searchParams.has("width")) {
        url.searchParams.set("width", String(resolvedWidth));
      }
      if (!url.searchParams.has("show_text")) {
        url.searchParams.set("show_text", "true");
      }
      resolvedUrl = url.toString();
    } else {
      // Assume it's a direct post link, convert to embed plugin URL
      const pluginUrl = new URL("https://www.facebook.com/plugins/post.php");
      pluginUrl.searchParams.set("href", normalizedEmbedUrl);
      pluginUrl.searchParams.set("width", String(resolvedWidth));
      pluginUrl.searchParams.set("show_text", "true");
      resolvedUrl = pluginUrl.toString();
    }
  } catch {
    // ignore invalid URLs
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
  embedUrls = [],
}: TrainingEventsSectionProps) {
  const validEmbeds = embedUrls.filter(url => url && url.trim() !== "");

  // Section now always renders title. If no embeds, show placeholder.
  const hasEmbeds = validEmbeds.length > 0;

  return (
    <section className="bg-slate-50 px-6 py-12 lg:px-24">
      <div className="mx-auto max-w-7xl">
        <header className="mb-12 text-center">
          <h2 className="text-2xl lg:text-3xl font-semibold text-slate-900">{title}</h2>
          {subtitle ? <p className="mt-3 text-base text-slate-600">{subtitle}</p> : null}
        </header>

        {hasEmbeds ? (
          <div className="grid grid-cols-1 justify-items-center gap-4 lg:gap-0 sm:grid-cols-2 md:grid-cols-3">
            {validEmbeds.map((url, index) => {
              return (
                <article
                  key={`training-facebook-${index}`}
                  className="flex h-full w-full flex-col rounded-lg border border-slate-200 bg-white shadow-sm"
                  style={{ width: "100%", maxWidth: `374px` }}
                >
                  <div className="w-full overflow-hidden rounded-t-lg bg-slate-100 flex justify-center">
                    <FacebookPostEmbed embedUrl={url} />
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 text-slate-500 bg-slate-100 rounded-lg border border-dashed border-slate-300">
            <p className="text-lg font-medium">No training events available at the moment.</p>
            <p className="text-sm mt-2 opacity-75">Please configure Facebook Embed URLs in Admin Dashboard.</p>
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

