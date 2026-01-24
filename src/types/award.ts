import { LocalizedString } from "./common";

export interface Award {
    _id?: string;
    id: string;
    title: LocalizedString;
    project: LocalizedString;
    team: LocalizedString[];
    advisors: LocalizedString[];
    image: string;
    gallery?: string[];
    year: string;
    date?: string;
}
