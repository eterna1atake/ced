import type { Metadata, ResolvingMetadata } from "next";
import { ReactNode } from "react";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { unstable_cache } from "next/cache";

import "../../globals.css";

import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";

import { HeroCarouselProvider } from "@/components/common/HeroCarouselProvider";
import AOSInitializer from "@/components/common/AOSInitializer";
import DynamicThemeProvider from "@/components/providers/DynamicThemeProvider"; // [New]
import { Inter, Kanit } from "next/font/google";
import dbConnect from "@/lib/mongoose";
import HeroCarousel from "@/collections/HeroCarousel";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const kanit = Kanit({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["thai", "latin"],
  variable: "--font-kanit",
  display: "swap",
});



// Cache the hero fetching to prevent DB hits on every request
const getHeroes = unstable_cache(
  async () => {
    await dbConnect();
    const rawHeroes = await HeroCarousel.find({ isActive: true }).sort({ order: 1, createdAt: -1 }).lean();
    return (rawHeroes as unknown as Array<{ _id: { toString: () => string }; src: string; alt?: string }>).map((hero) => ({
      id: hero._id.toString(),
      src: hero.src,
      alt: hero.alt
    }));
  },
  ['hero-carousel-public'],
  { revalidate: 3600, tags: ['hero-carousel'] } // Cache for 1 hour
);

type LayoutParams = Promise<{ locale: string }>;

export async function generateMetadata(
  // Parameter ที่รับเข้ามา 2 ตัว
  { params }: { params: LayoutParams }, // 1. params: ดึงค่าจาก URL แบบไดนามิก เช่น /[locale]/about
  parent: ResolvingMetadata // 2. Metadata จาก Layout ที่ครอบอยู่
): Promise<Metadata> {

  const { locale } = await params;
  const tMeta = await getTranslations({ locale, namespace: "Meta" });

  const parentMetadata = await parent;

  return {
    // ...parentMetadata: ใช้ Spread Operator (...) เพื่อคัดลอกค่าทั้งหมด
    // จาก Metadata ของแม่มาเป็นค่าเริ่มต้น
    ...parentMetadata,
    title: parentMetadata.title ?? tMeta("homeTitle"),
    icons: {
      icon: "/images/logo/logo_2.png",
      shortcut: "/images/logo/logo_2.png",
      apple: "/images/logo/logo_2.png",
    },
    formatDetection: {
      telephone: false,
    },
  } as any; // eslint-disable-line @typescript-eslint/no-explicit-any
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: ReactNode;
  params: LayoutParams;
}) {
  const { locale } = await params;

  // ✅ ผูก locale จาก URL ให้ให้กับ context ของ next-intl
  setRequestLocale(locale);

  // ✅ โหลดไฟล์ข้อความตามภาษาจาก URL (จะชัวร์ที่สุดถ้าระบุชัด)
  const messages = await getMessages({ locale });

  // ✅ Use cached data fetching
  const initialImages = await getHeroes();

  // suppressHydrationWarning: จำเป็นต้องใส่เพื่อป้องกัน Error "Hydration Mismatch" 
  // ที่เกิดจาก Browser Extension (เช่น Grammarly, Password Manager) 
  // แอบฉีด Attribute เข้ามาใน tag <html> ซึ่งทำให้ HTML ไม่ตรงกับฝั่ง Server
  return (
    <html lang={locale} suppressHydrationWarning className={`${inter.variable} ${kanit.variable}`}>
      <body className="font-sans" suppressHydrationWarning={true}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <DynamicThemeProvider>
            <HeroCarouselProvider initialImages={initialImages}>
              <AOSInitializer />
              <div className="relative bg-white w-full">
                <header className="sticky top-0 z-20">
                  <Navbar />
                </header>

                <div className="overflow-x-hidden w-full">
                  {children}

                  <footer>
                    <Footer />
                  </footer>
                </div>
              </div>
            </HeroCarouselProvider>
          </DynamicThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html >
  );
}
