import { LocalizedString } from "./common";

export interface NewsSeedItem {
    slug: string;
    href: string;
    imageSrc: string;
    galleryImages: string[];
    id: string;
    title: LocalizedString;
    summary: LocalizedString;
    content: LocalizedString;
    imageAlt: string;
    category: string;
    date: string;
    author: LocalizedString;
    status: 'published' | 'draft' | 'archived';
    isPinned?: boolean;
    pinnedAt?: string | null;
    createdAt: string;
    updatedAt: string;
    tags?: string[];
}
