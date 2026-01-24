
import type { ReactNode } from "react";

export type HeroBannerProps = {
  title: string;
  description?: string;
  eyebrow?: string;
  imageSrc?: string;
  imageAlt?: string;
  actions?: ReactNode;
};

export default function HeroBanner({
  title,
  description,
  eyebrow,
  imageSrc = "/images/bg_ced.jpg",
  imageAlt = title,
  actions,
}: HeroBannerProps) {
  return (
    <section className="relative h-[200px] md:h-[250px] lg:h-[300px] w-full overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-fixed bg-no-repeat"
        style={{ backgroundImage: `url(${imageSrc})` }}
        role="img"
        aria-label={imageAlt}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-black/20" />

      <div className="relative z-10 mx-auto flex h-full w-full max-w-7xl flex-col justify-center px-6 lg:px-10">
        {eyebrow ? (
          <span className="inline-flex items-center gap-2 self-start rounded-full bg-white/20 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-white backdrop-blur-md">
            {eyebrow}
          </span>
        ) : null}
        <h1 className="mt-4 max-w-2xl text-4xl font-bold text-white md:text-5xl">{title}</h1>
        {description ? (
          <p className="mt-4 max-w-xl text-base text-slate-100 md:text-lg">{description}</p>
        ) : null}
        {actions ? <div className="mt-6 flex flex-wrap items-center gap-3">{actions}</div> : null}
      </div>
    </section>
  );
}
