// Define the Icon Type String to ensure type safety in the component
export type ResourceIconName =
    | "chalkboard-teacher"
    | "microsoft"
    | "graduation-cap"
    | "book"
    | "windows"
    | "google"
    | "youtube"
    | "image"; // Special case for when using an image path

export type OnlineResourceItem = {
    key: string;
    link: string;
    iconName: ResourceIconName;
    imagePath?: string; // Optional, used if iconName is 'image' or as a fallback/override
    colorClass: string;
    title: string;
    description: string;
};

export type OnlineResourceCategory = {
    key: string;
    title: string;
    items: OnlineResourceItem[];
};

// Seed data with bilingual support
export type ResourceItemSeed = {
    key: string;
    link: string;
    iconName: ResourceIconName;
    imagePath?: string;
    colorClass: string;
    th: { title: string; description: string };
    en: { title: string; description: string };
};

export type ResourceCategorySeed = {
    key: string;
    th: { title: string };
    en: { title: string };
    items: ResourceItemSeed[];
};
