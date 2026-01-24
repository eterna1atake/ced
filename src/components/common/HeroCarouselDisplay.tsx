'use client';
// ตัวคั่นสำหรับแสดง carousel ด้านหน้าบ้าน พร้อมเติม alt อัตโนมัติจากข้อความแปล

import { useMemo } from 'react';

import HeroCarousel from './HeroCarousel';
import { useHeroCarousel } from './HeroCarouselProvider';

export default function HeroCarouselDisplay() {
  const { images } = useHeroCarousel();

  // เติมข้อความ alt หากยังไม่ได้ระบุ เพื่อให้เข้าถึงได้และรองรับหลายภาษา
  const enrichedImages = useMemo(
    () =>
      images.map((image, index) => {
        const hasAlt = typeof image.alt === 'string'
          ? image.alt.trim().length > 0
          : (image.alt?.th?.trim().length || image.alt?.en?.trim().length);

        return {
          ...image,
          alt: hasAlt ? image.alt : `${"images"} ${index + 1}`,
        };
      }),
    [images],
  );


  return <HeroCarousel images={enrichedImages} />;
}
