import type { NewsSeedItem as NewsItem } from "@/types/news";
import type { TrainingSeed } from "@/types/training";

export const TRAINING_SEED: ReadonlyArray<TrainingSeed> = [
  {
    id: "ai-bootcamp",
    slug: "ai-bootcamp",
    href: "/training/ai-bootcamp",
    date: "2024-06-20",
    imageSrc: "",
    imageAlt: "",
    th: {
      title: "บูทแคมป์ AI สำหรับครูผู้สอน",
      summary: "ฝึกใช้เครื่องมือปัญญาประดิษฐ์เพื่อออกแบบบทเรียนที่น่าสนใจ",
      category: "เวิร์กชอป",
    },
    en: {
      title: "AI Bootcamp for Educators",
      summary: "Practice using AI tools to design engaging classroom experiences.",
      category: "Workshop",
    },
  },
  {
    id: "stem-lab-series",
    slug: "stem-lab-series",
    href: "/training/stem-lab-series",
    date: "2024-07-05",
    imageSrc: "",
    imageAlt: "",
    th: {
      title: "ชุดอบรมห้องปฏิบัติการ STEM สำหรับครู",
      summary: "อบรมเชิงปฏิบัติการ 3 วันสำหรับพัฒนาทักษะการจัดกิจกรรมทดลอง",
      category: "การพัฒนาวิชาชีพ",
    },
    en: {
      title: "STEM Lab Series for Teachers",
      summary: "Three-day workshop focused on delivering hands-on STEM experiments.",
      category: "Professional Development",
    },
  },
  {
    id: "digital-learning-design",
    slug: "digital-learning-design",
    href: "/training/digital-learning-design",
    date: "2024-08-01",
    imageSrc: "",
    imageAlt: "",
    th: {
      title: "ออกแบบการเรียนรู้ออนไลน์เชิงสร้างสรรค์",
      summary: "เรียนรู้การออกแบบเนื้อหาออนไลน์แบบโต้ตอบสำหรับผู้เรียนยุคใหม่",
      category: "เสวนา",
    },
    en: {
      title: "Creative Digital Learning Design",
      summary: "Learn to craft interactive online content tailored for modern learners.",
      category: "Seminar",
    },
  },
] as const;

export function getTrainingItems(): NewsItem[] {
  return TRAINING_SEED.map((item) => {
    return {
      id: item.id,
      slug: item.slug,
      href: item.href,
      title: {
        en: item.en.title,
        th: item.th.title,
      },
      summary: {
        en: item.en.summary,
        th: item.th.summary,
      },
      content: {
        en: "",
        th: "",
      },
      imageSrc: item.imageSrc ?? "",
      imageAlt: item.imageAlt ?? item.en.title, // Default to EN title for alt
      galleryImages: [],
      category: item.en.category, // Category is usually an ID/Code, keeping EN for consistency or needs mapping? News uses EN keys like "Workshop".
      date: item.date,
      author: {
        en: "",
        th: "",
      },
      status: "published",
      createdAt: "",
      updatedAt: "",
      tags: item.tags ?? [],
    };
  });
}
