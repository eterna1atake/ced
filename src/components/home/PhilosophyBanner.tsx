"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMinus } from "@fortawesome/free-solid-svg-icons";

type PhilosophyBannerProps = {
  title: string;
  quote: string;
};

export default function PhilosophyBanner({ title, quote }: PhilosophyBannerProps) {
  return (
    <section className="bg-primary-main py-0 lg:py-2 overflow-hidden">
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center justify-center gap-3 px-4 py-6 text-center text-white lg:flex-row lg:gap-4 lg:px-6 lg:text-left">
        <span className="text-base font-semibold sm:text-lg lg:text-xl" data-aos="fade-right" suppressHydrationWarning>{title}</span>
        <FontAwesomeIcon icon={faMinus} className="hidden text-white lg:inline-block" aria-hidden />
        <span className="text-base font-semibold sm:text-lg lg:text-xl" data-aos="fade-left" suppressHydrationWarning>&ldquo;{quote}&rdquo;</span>
      </div>
    </section>
  );
}
