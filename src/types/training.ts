export type TrainingSeed = {
    id: string;
    slug: string;
    href: string;
    date: string;
    imageSrc?: string;
    imageAlt?: string;
    tags?: string[];
    th: {
        title: string;
        summary: string;
        category: string;
    };
    en: {
        title: string;
        summary: string;
        category: string;
    };
};
