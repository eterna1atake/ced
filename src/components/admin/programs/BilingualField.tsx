"use client";

import { createContext, useContext, ReactNode, useMemo } from "react";
import { BilingualInput } from "@/components/admin/common/BilingualInput";

type BilingualFieldContextType = {
    formData: any; // eslint-disable-line @typescript-eslint/no-explicit-any
    onChange: (path: string[], value: any) => void; // eslint-disable-line @typescript-eslint/no-explicit-any
    onTranslate: (path: string[]) => void;
    isPathTranslating: (path: string[]) => boolean;
    t: (key: string) => string;
};

const BilingualFieldContext = createContext<BilingualFieldContextType | null>(null);

export function BilingualFieldProvider({
    children,
    formData,
    onChange,
    onTranslate,
    isPathTranslating,
    t
}: BilingualFieldContextType & { children: ReactNode }) {
    const value = useMemo(() => ({
        formData,
        onChange,
        onTranslate,
        isPathTranslating,
        t
    }), [formData, onChange, onTranslate, isPathTranslating, t]);

    return (
        <BilingualFieldContext.Provider value={value}>
            {children}
        </BilingualFieldContext.Provider>
    );
}

type BilingualFieldProps = {
    label: string;
    path: string[];
    multiline?: boolean;
    thPlaceholder?: string;
    enPlaceholder?: string;
};

export default function BilingualField({
    label,
    path,
    multiline = false,
    thPlaceholder,
    enPlaceholder
}: BilingualFieldProps) {
    const context = useContext(BilingualFieldContext);
    if (!context) {
        throw new Error("BilingualField must be used within a BilingualFieldProvider");
    }

    const { formData, onChange, onTranslate, isPathTranslating, t } = context;

    const getVal = (lang: 'th' | 'en') => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const val = path.reduce((acc: any, key) => acc?.[key], formData);
        return val?.[lang] || "";
    };

    const value = {
        th: getVal('th'),
        en: getVal('en')
    };

    const thPath = [...path, 'th'];

    return (
        <BilingualInput
            label={label}
            value={value}
            onChange={(lang, val) => onChange([...path, lang], val)}
            multiline={multiline}
            onTranslate={() => onTranslate(thPath)}
            isTranslating={isPathTranslating(thPath)}
            placeholder={{ th: thPlaceholder || t("common.thai"), en: enPlaceholder || t("common.english") }}
        />
    );
}
