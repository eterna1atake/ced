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
import { useUnsavedChanges } from "@/contexts/UnsavedChangesContext";

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
        date: initialData?.date && !isNaN(new Date(initialData.date).getTime())
            ? new Date(initialData.date).toISOString().split('T')[0]
            : (initialData?.year ? `${initialData.year}-01-01` : new Date().toISOString().split('T')[0]),
    });

    const { setIsDirty } = useUnsavedChanges();

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setIsDirty(true);
        setFormData(prev => ({ ...prev, [name]: value }));
    }, [setIsDirty]);

    const [errors, setErrors] = useState<Record<string, string>>({});
    const { translate, isTranslating } = useAutoTranslate();

    const handleClearError = (name: string) => {
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const handleFieldChange = (field: 'title' | 'project' | 'team' | 'advisors', lang: 'th' | 'en', value: string) => {
        setIsDirty(true);
        setFormData(prev => ({
            ...prev,
            [field]: {
                ...prev[field],
                [lang]: value
            }
        }));

        // Clear error as user types
        const errorKey = `${field}${lang.charAt(0).toUpperCase() + lang.slice(1)}`;
        handleClearError(errorKey);
    };

    const handleTranslate = (field: 'title' | 'project' | 'team' | 'advisors') => {
        translate(field, formData[field].th, (translated) => {
            handleFieldChange(field, "en", translated);
        });
    };

    const handleImageChange = useCallback((url: string) => {
        setIsDirty(true);
        setFormData(prev => ({ ...prev, image: url }));
        handleClearError("image");
    }, [errors.image, setIsDirty]);

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.title.th) newErrors.titleTh = t("common.required");
        if (!formData.title.en) newErrors.titleEn = t("common.required");
        if (!formData.project.th) newErrors.projectTh = t("common.required");
        if (!formData.project.en) newErrors.projectEn = t("common.required");
        if (!formData.team.th) newErrors.teamTh = t("common.required");
        if (!formData.team.en) newErrors.teamEn = t("common.required");
        if (!formData.advisors.th) newErrors.advisorsTh = t("common.required");
        if (!formData.advisors.en) newErrors.advisorsEn = t("common.required");
        if (!formData.date) newErrors.date = t("common.required");
        if (!formData.image) newErrors.image = t("common.required");

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) {
            import("sweetalert2").then((Swal) => {
                Swal.default.fire({
                    title: t("common.missingInfoTitle"),
                    text: t("common.missingInfoText"),
                    icon: "error",
                    confirmButtonColor: "#f43f5e",
                });
            });
            return;
        }

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
            year: formData.date.split('-')[0] || "", // Extract year from YYYY-MM-DD
            date: formData.date
        };

        setIsDirty(false);
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
                    required
                    error={{ th: errors.titleTh, en: errors.titleEn }}
                    onFocus={(lang) => handleClearError(lang === 'th' ? "titleTh" : "titleEn")}
                />

                <BilingualInput
                    label={t("awards.projectName")}
                    value={formData.project}
                    onChange={(lang, val) => handleFieldChange("project", lang, val)}
                    placeholder={{ th: t("awards.projectNamePlaceholderTh"), en: t("awards.projectNamePlaceholderEn") }}
                    onTranslate={() => handleTranslate("project")}
                    isTranslating={isTranslating.project}
                    required
                    error={{ th: errors.projectTh, en: errors.projectEn }}
                    onFocus={(lang) => handleClearError(lang === 'th' ? "projectTh" : "projectEn")}
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
                    required
                    error={{ th: errors.teamTh, en: errors.teamEn }}
                    onFocus={(lang) => handleClearError(lang === 'th' ? "teamTh" : "teamEn")}
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
                    required
                    error={{ th: errors.advisorsTh, en: errors.advisorsEn }}
                    onFocus={(lang) => handleClearError(lang === 'th' ? "advisorsTh" : "advisorsEn")}
                />
            </div>

            {/* Metadata */}
            <div className="space-y-6">
                <h4 className="text-xl font-bold text-slate-700">{t("awards.additionalInfo")}</h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormInput
                        label={t("awards.fullDate")}
                        name="date"
                        type="date"
                        value={formData.date}
                        onChange={handleChange}
                        required
                        placeholder={t("awards.fullDatePlaceholder")}
                        error={errors.date}
                        onFocus={() => handleClearError("date")}
                    />
                </div>

                <div className="max-w-md">
                    <FileUpload
                        label={t("awards.awardImage")}
                        value={formData.image}
                        onChange={handleImageChange}
                        accept="image/*"
                        folder="ced_web/awards"
                        error={errors.image}
                        required
                        onFocus={() => handleClearError("image")}
                    />
                </div>

                {/* Gallery Images */}
                <div className="space-y-4 pt-4 border-t">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                        {t("common.galleryImages")} ({formData.gallery?.length || 0}/5)
                    </label>

                    {/* Image Grid */}
                    {formData.gallery && formData.gallery.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                            {formData.gallery.map((img, index) => (
                                <div key={index} className="relative group aspect-video bg-slate-100 dark:bg-slate-800 rounded-md overflow-hidden border border-slate-200 dark:border-slate-700">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={img}
                                        alt={`Gallery ${index + 1}`}
                                        className="w-full h-full object-contain"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsDirty(true);
                                            setFormData(prev => ({
                                                ...prev,
                                                gallery: prev.gallery.filter((_, i) => i !== index)
                                            }));
                                        }}
                                        className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                            <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                                        </svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Add Image Button */}
                    {(formData.gallery?.length || 0) < 5 ? (
                        <FileUpload
                            label={t("common.addGalleryImage")}
                            onChange={(url) => {
                                if (url) {
                                    setIsDirty(true);
                                    setFormData(prev => ({
                                        ...prev,
                                        gallery: [...(prev.gallery || []), url]
                                    }));
                                }
                            }}
                            accept="image/*"
                            folder="ced_web/awards"
                        />
                    ) : (
                        <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded-md border border-amber-200 shadow-sm flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            {t("common.maxImagesReached", { max: 5 })}
                        </p>
                    )}
                </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end pt-6 border-t mt-8">
                <SaveButton
                    isLoading={isLoading}
                    label={t("awards.saveAward")}
                    loadingLabel={t("common.saving")}
                />
            </div>
        </form>
    );
}
