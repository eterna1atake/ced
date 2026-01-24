import { LocalizedString } from "./common";

export type ProgramLevel = "bachelor" | "master" | "doctoral";

export interface ProgramItem {
    id: string; // Unique identifier for routing
    level: ProgramLevel;
    imageSrc: string;
    imageAlt: string;
    link: string; // The suffix path, e.g. "/programs/bachelor/ced"
    th: {
        degree: string;
        title: string;
        subtitle: string;
        description: string;
    };
    en: {
        degree: string;
        title: string;
        subtitle: string; // Usually same as English Title, but we keep structure
        description: string;
    };
}

export interface CurriculumItem {
    id: string;
    title: LocalizedString;
    credits: string;
    isBold?: boolean;
    subItems?: CurriculumItem[];
}

export interface CurriculumSection {
    title: LocalizedString;
    credits: string;
    items: CurriculumItem[];
}

export interface ProgramDocument {
    name: LocalizedString;
    url: string;
}

export interface ProgramDetailData {
    id: string;
    name: LocalizedString;
    degree: {
        full: LocalizedString;
        short: LocalizedString;
    };
    programFormat?: {
        title: LocalizedString;
        items: {
            title: LocalizedString;
            subItems?: LocalizedString[];
        }[];
    };
    gradAttribute?: {
        title: LocalizedString;
        items: {
            title: LocalizedString;
            subItems?: LocalizedString[];
        }[];
    };
    major?: {
        title: LocalizedString;
        description: LocalizedString;
    };
    highlights?: {
        title: LocalizedString;
        items: {
            title: LocalizedString;
            description: LocalizedString;
        }[];
    };
    suitableFor?: {
        title: LocalizedString;
        items: {
            title: LocalizedString;
            subItems?: LocalizedString[];
        }[];
    };
    curriculum: CurriculumSection[];
    documents: ProgramDocument[];
    language?: LocalizedString;
    admission?: LocalizedString;
    careers?: {
        title: LocalizedString;
        items: LocalizedString[];
    };
}
