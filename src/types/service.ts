import { LocalizedString } from "./common";

export type ServiceCategory = "software" | "account" | "network" | "information-system" | "service-area" | "other";

export type Service = {
    id: string;
    _id?: string;
    title: LocalizedString;
    icon: string;
    link?: string;
    category: ServiceCategory;
};
