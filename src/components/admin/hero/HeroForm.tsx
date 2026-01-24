
"use client";

import { useState } from "react";
import SaveButton from '../common/SaveButton';

import type { HeroCarouselImage } from "@/types/hero";
import FileUpload from "@/components/admin/FileUpload";
import { BilingualInput } from "@/components/admin/common/BilingualInput";
import { useAutoTranslate } from "@/hooks/useAutoTranslate";
import { LocalizedString } from "@/types/common";
import { useTranslations } from "next-intl";


type HeroFormProps = {
    initialData?: Partial<HeroCarouselImage>;
    onSubmit: (data: HeroCarouselImage) => void;
    isLoading?: boolean;
};
export default function HeroForm({ initialData, onSubmit, isLoading }: HeroFormProps) {
    const t = useTranslations("Admin.forms");
    const { translate, isTranslating } = useAutoTranslate();

    // Ensure alt is an object if it comes as a string or is undefined
    const initialAlt = typeof initialData?.alt === 'string'
        ? { th: initialData.alt, en: "" }
        : initialData?.alt || { th: "", en: "" };

    const [formData, setFormData] = useState<Partial<HeroCarouselImage>>({
        src: "",
        ...initialData,
        alt: initialAlt,
    });

    const handleAltChange = (lang: 'th' | 'en', val: string) => {
        setFormData(prev => ({
            ...prev,
            alt: {
                ...(prev.alt as LocalizedString),
                [lang]: val
            }
        }));
    };

    const handleTranslate = () => {
        const altText = (formData.alt as LocalizedString)?.th || "";
        translate("alt", altText, (translated) => {
            handleAltChange("en", translated);
        });
    };


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const submissionData = {
            ...formData,
            id: formData.id || `hero-${Date.now()}`,
        } as HeroCarouselImage;

        onSubmit(submissionData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 bg-white dark:bg-slate-900 p-8 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{t("hero.details")}</h3>

            <div className="space-y-6">
                {/* Image URL */}
                <div>
                    <FileUpload
                        label={t("hero.heroImage")}
                        value={formData.src}
                        onChange={(url) => setFormData(prev => ({ ...prev, src: url }))}
                        accept="image/*"
                        folder="ced_web/hero"
                    />
                </div>

                {/* Alt Text */}
                <BilingualInput
                    label={t("hero.altText")}
                    value={(formData.alt as LocalizedString) || { th: "", en: "" }}
                    onChange={handleAltChange}
                    onTranslate={handleTranslate}
                    isTranslating={isTranslating.alt}
                    placeholder={{ th: t("hero.altTextPlaceholderTh"), en: t("hero.altTextPlaceholderEn") }}
                />

            </div>

            <div className="flex justify-end pt-6 border-t">
                <SaveButton
                    isLoading={isLoading}
                    label={t("hero.saveImage")}
                />
            </div>
        </form>
    );
}

