'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { useParams } from 'next/navigation';

import type { HeroCarouselImage } from "@/types/hero";


type HeroCarouselProps = {
  images: HeroCarouselImage[];
  intervalMs?: number;
  className?: string;
};

export default function HeroCarousel({
  images,
  intervalMs = 5000,
  className,
}: HeroCarouselProps) {
  const params = useParams();
  const locale = (params?.locale as "en" | "th") || "th";

  // กรองรูปที่ไม่สมบูรณ์
  const slides = useMemo(
    () => images.filter((image) => image.src && image.src.trim().length > 0),
    [images],
  );

  const [activeIndex, setActiveIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const prefersReducedMotion = useRef<boolean>(false);

  useEffect(() => {
    // ตรวจค่า prefers-reduced-motion เพื่อลดการเคลื่อนไหวอัตโนมัติ
    if (typeof window !== 'undefined' && 'matchMedia' in window) {
      prefersReducedMotion.current = window
        .matchMedia('(prefers-reduced-motion: reduce)')
        .matches;
    }
  }, []);

  // หมุนสไลด์อัตโนมัติ (ถ้ามีหลายภาพและผู้ใช้ไม่ได้ตั้งลดแอนิเมชัน)
  useEffect(() => {
    if (slides.length <= 1) return;
    if (prefersReducedMotion.current) return;

    const handle = setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, intervalMs);

    return () => clearInterval(handle);
  }, [intervalMs, slides.length]);

  // รีเซ็ต index ถ้าจำนวนสไลด์เปลี่ยน
  useEffect(() => {
    if (activeIndex >= slides.length) setActiveIndex(0);
  }, [activeIndex, slides.length]);

  if (slides.length === 0) return null;

  const jumpToSlide = (index: number) => setActiveIndex(index);
  const prev = () =>
    setActiveIndex((i) => (i - 1 + slides.length) % slides.length);
  const next = () => setActiveIndex((i) => (i + 1) % slides.length);

  // Gesture: swipe บนมือถือ
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current == null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    const threshold = 40; // px
    if (Math.abs(deltaX) > threshold) {
      if (deltaX > 0) prev();
      else next();
    }
    touchStartX.current = null;
  };

  const getAltText = (alt: HeroCarouselImage['alt']) => {
    if (!alt) return '';
    if (typeof alt === 'string') return alt;
    return alt[locale] || alt.th;
  };

  return (
    <div
      className={[
        'relative w-full overflow-hidden',
        // ความสูงตอบสนองตาม breakpoint (ปรับได้ตามดีไซน์)
        // ถ้า caller ส่ง className มา จะ override ตรงนี้ได้
        className ?? 'h-[280px] sm:h-[360px] md:h-[480px] lg:h-[580px]',
      ].join(' ')}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      aria-roledescription="carousel"
    >
      {/* รูปภาพแบบเฟด */}
      {slides.map((image, index) => (
        <Image
          key={image.id}
          src={image.src}
          alt={getAltText(image.alt)}
          priority={index === 0}
          fill
          // กำหนด sizes ให้เหมาะกับแต่ละ breakpoint เพื่อลด bandwidth
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 100vw"
          className={[
            'absolute inset-0 h-full w-full object-cover',
            'transition-opacity duration-700',
            index === activeIndex ? 'opacity-100' : 'opacity-0',
          ].join(' ')}
        />
      ))}

      {/* ปุ่มลูกศรซ้าย/ขวา (แสดงเมื่อมีหลายสไลด์) */}
      {slides.length > 1 && (
        <>
          <button
            type="button"
            onClick={prev}
            aria-label="Previous slide"
            className={[
              'absolute left-2 top-1/2 -translate-y-1/2',
              // ปุ่มใหญ่พอสำหรับนิ้ว
              'h-10 w-10 md:h-11 md:w-11 rounded-full',
              'bg-black/35 hover:bg-black/50 backdrop-blur',
              'text-white flex items-center justify-center',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70',
            ].join(' ')}
          >
            <span aria-hidden="true">‹</span>
          </button>

          <button
            type="button"
            onClick={next}
            aria-label="Next slide"
            className={[
              'absolute right-2 top-1/2 -translate-y-1/2',
              'h-10 w-10 md:h-11 md:w-11 rounded-full',
              'bg-black/35 hover:bg-black/50 backdrop-blur',
              'text-white flex items-center justify-center',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70',
            ].join(' ')}
          >
            <span aria-hidden="true">›</span>
          </button>
        </>
      )}

      {/* จุดนำทาง (dots) */}
      {slides.length > 1 && (
        <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 flex gap-2 sm:gap-2.5">
          {slides.map((_, index) => (
            <button
              key={slides[index]?.id ?? index}
              type="button"
              aria-label={`Go to slide ${index + 1}`}
              onClick={() => jumpToSlide(index)}
              className={[
                // ขนาดใหญ่ขึ้นเล็กน้อยบนมือถือเพื่อแตะง่าย
                'h-2.5 w-2.5 sm:h-2.5 sm:w-2.5 rounded-full',
                index === activeIndex
                  ? 'bg-white'
                  : 'bg-white/50 hover:bg-white/80',
                'transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70',
              ].join(' ')}
            />
          ))}
        </div>
      )}
    </div>
  );
}
