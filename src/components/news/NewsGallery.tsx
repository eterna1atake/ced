"use client";
import { faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Image from "next/image";
import { useMemo, useState, useCallback } from "react";


type NewsGalleryProps = {
  images: string[];
  title: string;
  mainAlt?: string;
  heading?: string;
};
export default function NewsGallery({ images, title, mainAlt, heading }: NewsGalleryProps) {
  const sanitizedImages = useMemo(
    () => images.filter((value) => Boolean(value && value.trim().length > 0)),
    [images]
  );
  const [activeIndex, setActiveIndex] = useState(0);
  const totalImages = sanitizedImages.length;
  const goToIndex = useCallback(
    (index: number) => {
      if (totalImages === 0) return;
      const nextIndex = (index + totalImages) % totalImages;
      setActiveIndex(nextIndex);
    },
    [totalImages]
  );
  const handlePrev = useCallback(() => {
    goToIndex(activeIndex - 1);
  }, [activeIndex, goToIndex]);
  const handleNext = useCallback(() => {
    goToIndex(activeIndex + 1);
  }, [activeIndex, goToIndex]);
  if (totalImages === 0) {
    return null;
  }
  const activeImage = sanitizedImages[Math.min(activeIndex, totalImages - 1)];
  return (
    <div className="space-y-6">
      <div className="relative w-full overflow-hidden rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center min-h-[300px] max-h-[650px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={activeImage}
          src={activeImage}
          alt={mainAlt ?? title}
          className="w-full h-auto max-h-[650px] object-contain transition duration-300"
        />
        {totalImages > 1 ? (
          <>
            <button
              type="button"
              onClick={handlePrev}
              className="absolute left-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center bg-black/30 hover:bg-black/50 text-white rounded-full transition-all duration-200 backdrop-blur-sm"
              aria-label="Previous image"
            >
              <FontAwesomeIcon icon={faChevronLeft} />
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="absolute right-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center bg-black/30 hover:bg-black/50 text-white rounded-full transition-all duration-200 backdrop-blur-sm"
              aria-label="Next image"
            >
              <FontAwesomeIcon icon={faChevronRight} />
            </button>
          </>
        ) : null}
      </div>
      {totalImages > 1 ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">{heading ?? "Gallery"}</h2>
            <span className="text-xs font-medium text-slate-500">
              {activeIndex + 1} / {totalImages}
            </span>
          </div>
          <div className="-mx-1 flex overflow-x-auto pb-2">
            {sanitizedImages.map((image, index) => {
              const isActive = index === activeIndex;
              return (
                <button
                  key={image + index}
                  type="button"
                  onClick={() => goToIndex(index)}
                  className={`relative mx-1 h-24 w-36 flex-shrink-0 overflow-hidden rounded-lg border transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-main/40 ${isActive
                    ? "border-primary-main ring-2 ring-primary-main/40"
                    : "border-slate-200 hover:border-primary-main/60"
                    }`}
                  aria-label={`Preview image ${index + 1} for ${title}`}
                >
                  <Image
                    src={image}
                    alt={`${title} - preview ${index + 1}`}
                    fill
                    sizes="96px"
                    className="object-contain transition duration-300"
                  />

                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}