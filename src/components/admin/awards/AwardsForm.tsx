"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import type { Award } from "@/types/award";
import FileUpload from "@/components/admin/FileUpload";
import { LocalizedString } from "@/types/common";
import { FormInput } from "@/components/admin/common/FormInputs";
import { BilingualInput } from "@/components/admin/common/BilingualInput";
import SaveButton from '../common/SaveButton';
import { useAutoTranslate } from "@/hooks/useAutoTranslate";

// --- Types & Interfaces ---

type AwardsFormProps = {
    initialData?: Partial<Award>;
    onSubmit: (data: Award) => void;
    isLoading?: boolean;
};

// --- Utils ---

const parseLines = (text: string): string[] => text.split('\n').map(line => line.trim()).filter(Boolean);

const extractLangText = (arr: LocalizedString[] | undefined, lang: 'th' | 'en'): string => {
    return arr?.map(item => item[lang]).join('\n') || "";
};

const mergeLocalizedArrays = (thLines: string[], enLines: string[]): LocalizedString[] => {
    const maxLength = Math.max(thLines.length, enLines.length);
    return Array.from({ length: maxLength }, (_, i) => ({
        th: thLines[i] || enLines[i] || "",
        en: enLines[i] || thLines[i] || ""
    }));
};

// --- Main Component ---

export default function AwardsForm({ initialData, onSubmit, isLoading = false }: AwardsFormProps) {
    const t = useTranslations("Admin.forms");
    const [formData, setFormData] = useState({
        title: { th: initialData?.title?.th || "", en: initialData?.title?.en || "" },
        project: { th: initialData?.project?.th || "", en: initialData?.project?.en || "" },
        team: { th: extractLangText(initialData?.team, 'th'), en: extractLangText(initialData?.team, 'en') },
        advisors: { th: extractLangText(initialData?.advisors, 'th'), en: extractLangText(initialData?.advisors, 'en') },
        image: initialData?.image || "",
        gallery: initialData?.gallery || [],
        year: initialData?.year || "",
        date: initialData?.date || "",
    });

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    }, []);

    const { translate, isTranslating } = useAutoTranslate();

    const handleFieldChange = (field: 'title' | 'project' | 'team' | 'advisors', lang: 'th' | 'en', value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: {
                ...prev[field],
                [lang]: value
            }
        }));
    };

    const handleTranslate = (field: 'title' | 'project' | 'team' | 'advisors') => {
        translate(field, formData[field].th, (translated) => {
            handleFieldChange(field, "en", translated);
        });
    };

    const handleImageChange = useCallback((url: string) => {
        setFormData(prev => ({ ...prev, image: url }));
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const team = mergeLocalizedArrays(
            parseLines(formData.team.th),
            parseLines(formData.team.en)
        );

        const advisors = mergeLocalizedArrays(
            parseLines(formData.advisors.th),
            parseLines(formData.advisors.en)
        );

        const submissionData: Award = {
            id: initialData?.id || `award-${Date.now()}`,
            title: formData.title,
            project: formData.project,
            team,
            advisors,
            image: formData.image,
            gallery: (formData.gallery || []).filter(Boolean),
            year: formData.year,
            date: formData.date
        };

        onSubmit(submissionData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 bg-white dark:bg-slate-900 p-8 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6">{t("awards.details")}</h3>

            {/* Basic Info */}
            <div className="space-y-6">
                <BilingualInput
                    label={t("awards.awardTitle")}
                    value={formData.title}
                    onChange={(lang, val) => handleFieldChange("title", lang, val)}
                    placeholder={{ th: t("awards.awardTitlePlaceholderTh"), en: t("awards.awardTitlePlaceholderEn") }}
                    onTranslate={() => handleTranslate("title")}
                    isTranslating={isTranslating.title}
                />

                <BilingualInput
                    label={t("awards.projectName")}
                    value={formData.project}
                    onChange={(lang, val) => handleFieldChange("project", lang, val)}
                    placeholder={{ th: t("awards.projectNamePlaceholderTh"), en: t("awards.projectNamePlaceholderEn") }}
                    onTranslate={() => handleTranslate("project")}
                    isTranslating={isTranslating.project}
                />
            </div>

            {/* People */}
            <div className="space-y-6">
                <h4 className="text-xl font-bold text-slate-700">{t("awards.participants")}</h4>
                <BilingualInput
                    label={t("awards.teamMembers")}
                    value={formData.team}
                    onChange={(lang, val) => handleFieldChange("team", lang, val)}
                    multiline
                    rows={4}
                    placeholder={{ th: t("awards.teamMembersPlaceholderTh"), en: t("awards.teamMembersPlaceholderEn") }}
                    onTranslate={() => handleTranslate("team")}
                    isTranslating={isTranslating.team}
                />

                <BilingualInput
                    label={t("awards.advisors")}
                    value={formData.advisors}
                    onChange={(lang, val) => handleFieldChange("advisors", lang, val)}
                    multiline
                    rows={3}
                    placeholder={{ th: t("awards.advisorsPlaceholderTh"), en: t("awards.advisorsPlaceholderEn") }}
                    onTranslate={() => handleTranslate("advisors")}
                    isTranslating={isTranslating.advisors}
                />
            </div>

            {/* Metadata */}
            <div className="space-y-6">
                <h4 className="text-xl font-bold text-slate-700">{t("awards.additionalInfo")}</h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormInput
                        label={t("awards.year")}
                        name="year"
                        value={formData.year}
                        onChange={handleChange}
                        required
                        placeholder={t("awards.yearPlaceholder")}
                    />
                    <FormInput
                        label={t("awards.fullDate")}
                        name="date"
                        value={formData.date}
                        onChange={handleChange}
                        placeholder={t("awards.fullDatePlaceholder")}
                    />
                </div>

                <div className="max-w-md">
                    <FileUpload
                        label={t("awards.awardImage")}
                        value={formData.image}
                        onChange={handleImageChange}
                        accept="image/*"
                        folder="ced_web/awards"
                    />
                </div>

                {/* Gallery Images */}
                {/* Gallery Images */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                            {t("common.galleryImages")} (Optional)
                        </label>
                        <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, gallery: [...(prev.gallery || []), ""] }))}
                            className="text-sm text-indigo-600 hover:text-indigo-500 font-medium flex items-center gap-1"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            {t("common.addGalleryImage")}
                        </button>
                    </div>

                    {formData.gallery && formData.gallery.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {formData.gallery.map((url, index) => (
                                <div key={`gallery-${index}-${url}`} className="relative group">
                                    <FileUpload
                                        label={`${t("common.media")} ${index + 1}`}
                                        value={url}
                                        onChange={(newUrl) => {
                                            setFormData(prev => {
                                                const newGallery = [...(prev.gallery || [])];
                                                newGallery[index] = newUrl;
                                                return { ...prev, gallery: newGallery };
                                            });
                                        }}
                                        accept="image/*"
                                        helperText="Support JPG, PNG, WebP"
                                        folder="ced_web/awards"
                                    />
                                    {/* Remove Slot Button - positioned next to the label */}
                                    <button
                                        type="button"
                                        onClick={() => setFormData(prev => ({
                                            ...prev,
                                            gallery: (prev.gallery || []).filter((_, i) => i !== index)
                                        }))}
                                        className="absolute top-0 right-0 text-red-500 hover:text-red-700 transition-colors p-1 z-30 flex items-center gap-1 text-[10px] font-bold uppercase"
                                        title="Delete slot"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                        Delete
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end pt-6 border-t mt-8">
                <SaveButton
                    isLoading={isLoading}
                    label={t("awards.saveAward")}
                />
            </div>
        </form>
    );
}
