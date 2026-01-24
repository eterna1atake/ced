export interface FormRequestItem {
    url: string;
    th: { name: string };
    en: { name: string };
}

export interface FormRequestSection {
    id: string;
    items: FormRequestItem[];
}

export interface FormRequestCategory {
    id: string;
    sections: FormRequestSection[];
}
