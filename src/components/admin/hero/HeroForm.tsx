
"use client";

import { useState } from "react";
import SaveButton from '../common/SaveButton';

import type { HeroCarouselImage } from "@/types/hero";
import FileUpload from "@/components/admin/FileUpload";
import { BilingualInput } from "@/components/admin/common/BilingualInput";
import { useAutoTranslate } from "@/hooks/useAutoTranslate";
import { LocalizedString } from "@/types/common";
import { useTranslations } from "next-intl";
import Swal from "sweetalert2";


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

    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleAltChange = (lang: 'th' | 'en', val: string) => {
        setFormData(prev => ({
            ...prev,
            alt: {
                ...(prev.alt as LocalizedString),
                [lang]: val
            }
        }));

        if (errors[`alt.${lang}`]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[`alt.${lang}`];
                return newErrors;
            });
        }
    };

    const handleTranslate = () => {
        const altText = (formData.alt as LocalizedString)?.th || "";
        translate("alt", altText, (translated) => {
            handleAltChange("en", translated);
        });
    };

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.src) newErrors.src = t("common.required");
        if (!(formData.alt as LocalizedString)?.th) newErrors['alt.th'] = t("common.required");
        if (!(formData.alt as LocalizedString)?.en) newErrors['alt.en'] = t("common.required");

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) {
            Swal.fire({
                title: t("common.missingInfoTitle"),
                text: t("common.missingInfoText"),
                icon: "error",
                confirmButtonColor: "#f43f5e",
            });
            return;
        }

        const result = await Swal.fire({
            title: t("common.saveConfirmTitle") || "Are you sure?",
            text: t("common.saveConfirmText") || "Do you want to save these changes?",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: t("common.save") || "Save",
            cancelButtonText: t("common.cancel") || "Cancel",
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
        });

        if (result.isConfirmed) {
            const submissionData = {
                ...formData,
                id: formData.id || `hero-${Date.now()}`,
            } as HeroCarouselImage;

            onSubmit(submissionData);
        }
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
                        onChange={(url) => {
                            setFormData(prev => ({ ...prev, src: url }));
                            if (errors.src) {
                                setErrors(prev => {
                                    const newErrors = { ...prev };
                                    delete newErrors.src;
                                    return newErrors;
                                });
                            }
                        }}
                        accept="image/*"
                        folder="ced_web/hero"
                        required
                        error={errors.src}
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
                    required
                    error={{ th: errors['alt.th'], en: errors['alt.en'] }}
                    onFocus={(lang) => {
                        if (errors[`alt.${lang}`]) {
                            setErrors(prev => {
                                const newErrors = { ...prev };
                                delete newErrors[`alt.${lang}`];
                                return newErrors;
                            });
                        }
                    }}
                />

            </div>

            <div className="flex justify-end pt-6 border-t">
                <SaveButton
                    isLoading={isLoading}
                    label={t("hero.saveImage")}
                    loadingLabel={t("common.saving")}
                />
            </div>
        </form>
    );
}

