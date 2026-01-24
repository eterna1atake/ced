'use client';

import { createContext, ReactNode, useContext, useEffect, useMemo, useRef, useState } from 'react';

// import { HERO_CAROUSEL_SEED } from '@/data/heroData';
import type { HeroCarouselImage } from '@/types/hero';

type HeroCarouselContextValue = {
  images: HeroCarouselImage[];
  addImage: (image: Omit<HeroCarouselImage, 'id'> & Partial<Pick<HeroCarouselImage, 'id'>>) => void;
  removeImage: (id: string) => void;
  resetImages: () => void;
};

const STORAGE_KEY = 'hero-carousel-images';

const defaultImages: HeroCarouselImage[] = [];

const HeroCarouselContext = createContext<HeroCarouselContextValue | undefined>(undefined);

const safeParseImages = (value: string | null): HeroCarouselImage[] | null => {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(value) as HeroCarouselImage[];
    if (!Array.isArray(parsed)) {
      return null;
    }

    return parsed
      .filter((item) => typeof item?.src === 'string' && item.src.trim().length > 0)
      .map((item, index) => ({
        id: typeof item.id === 'string' && item.id.length > 0 ? item.id : `restored-${index}`,
        src: item.src.trim(),
        alt: item.alt,
      }));

  } catch {
    return null;
  }
};

const getId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `hero-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
};

export function HeroCarouselProvider({ children, initialImages = defaultImages }: { children: ReactNode, initialImages?: HeroCarouselImage[] }) {
  const [images, setImages] = useState<HeroCarouselImage[]>(initialImages);
  const isMountedRef = useRef(false);

  // Sync images if initialData from server changes
  const [lastInitial, setLastInitial] = useState(initialImages);
  if (initialImages !== lastInitial) {
    setLastInitial(initialImages);
    setImages(initialImages);
  }


  useEffect(() => {
    if (!isMountedRef.current || typeof window === 'undefined') {
      return;
    }
    // Only save to local storage if needed. 
    // Since we now prioritize DB, this local cache might be less relevant for "master" data, 
    // but useful if user adds items locally via addImage (though that function is now less used if we are fully DB driven).
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(images));
  }, [images]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const handleStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY) {
        return;
      }

      const parsed = safeParseImages(event.newValue);
      if (parsed) {
        setImages(parsed);
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const value = useMemo<HeroCarouselContextValue>(
    () => ({
      images,
      addImage: (image) => {
        const trimmedSrc = image.src?.trim();
        if (!trimmedSrc) {
          return;
        }

        const normalized: HeroCarouselImage = {
          id: image.id ?? getId(),
          src: trimmedSrc,
          alt: typeof image.alt === 'string' ? image.alt.trim() : image.alt,
        };


        setImages((prev) => [...prev, normalized]);
      },
      removeImage: (id) => {
        setImages((prev) => prev.filter((item) => item.id !== id));
      },
      resetImages: () => {
        setImages(defaultImages);
      },
    }),
    [images],
  );

  return <HeroCarouselContext.Provider value={value}>{children}</HeroCarouselContext.Provider>;
}

export function useHeroCarousel() {
  const context = useContext(HeroCarouselContext);
  if (!context) {
    throw new Error('useHeroCarousel must be used within a HeroCarouselProvider');
  }

  return context;
}

export function getDefaultHeroCarouselImages(): HeroCarouselImage[] {
  return defaultImages;
}
