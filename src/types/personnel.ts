import { LocalizedString } from "./common";

export interface EducationEntry {
    level: LocalizedString;
    major: LocalizedString;
    university: LocalizedString;
}

export interface Personnel {
    id?: string;
    _id?: string;
    name: LocalizedString;
    position: LocalizedString;
    email: string;
    imageSrc: string;
    education: EducationEntry[];
    courses: { courseId?: string; th: string; en: string }[];
    room?: string;
    phone?: string;
    scopusLink?: string;
    researchProfileLink?: string;
    googleScholarLink?: string;
    updatedAt?: Date;
    slug?: string;
    customLinks?: ICustomLink[];
}

export interface ICustomLink {
    title: string;
    url: string;
}
