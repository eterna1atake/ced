import { LocalizedString } from "./common";

export type Facility = {
    id: string;
    name: LocalizedString;
    image: string;
    description?: LocalizedString;
    gallery?: string[];
    capacity?: LocalizedString;
    equipment?: string[];
    building?: string;
};
