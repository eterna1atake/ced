
"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import SaveButton from '../common/SaveButton';
import { FormInput } from "@/components/admin/common/FormInputs";
import { BilingualInput } from "@/components/admin/common/BilingualInput";
import FileUpload from "@/components/admin/FileUpload";
import { useAutoTranslate } from "@/hooks/useAutoTranslate";

// We need a partial type that matches the structure of TrainingSeed but relaxed for the form
type TrainingSeed = {
    id?: string;
    slug: string;
    href?: string; // Derived usually
    date: string;
    imageSrc?: string;
    tags?: string[];
    th: {
        title: string;
        summary: string;
        category: string;
    };
    en: {
        title: string;
        summary: string;
        category: string;
    };
};

type TrainingFormProps = {
    initialData?: Partial<TrainingSeed>;
    onSubmit: (data: TrainingSeed) => void;
    isLoading?: boolean;
};

export default function TrainingForm({ initialData, onSubmit, isLoading = false }: TrainingFormProps) {
    const t = useTranslations("Admin.forms");
    const [formData, setFormData] = useState<Partial<TrainingSeed>>({
        slug: "",
        date: new Date().toISOString().split('T')[0],
        imageSrc: "",
        tags: [],
        th: { title: "", summary: "", category: "เวิร์กชอป" },
        en: { title: "", summary: "", category: "Workshop" },
        ...initialData,
    });

    const { translate, isTranslating } = useAutoTranslate();

    const handleTranslate = (field: 'title' | 'summary' | 'category') => {
        const text = formData.th?.[field] || "";
        translate(field, text, (translated) => {
            handleFieldChange(field, "en", translated);
        });
    };



    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFieldChange = (field: 'title' | 'summary' | 'category', lang: 'th' | 'en', value: string) => {
        setFormData(prev => ({
            ...prev,
            [lang]: {
                ...prev[lang]!,
                [field]: value
            }
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const submissionData = {
            ...formData,
            id: formData.id || `training-${Date.now()}`,
            href: formData.href || `/training/${formData.slug}`,
        } as TrainingSeed;

        onSubmit(submissionData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 bg-white dark:bg-slate-900 p-6 rounded-lg dark:border dark:border-slate-800">

            <div className="space-y-8">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 border-b dark:border-slate-800 pb-4">
                    {t("training.details")}
                </h3>

                {/* Common Data */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormInput
                        label={t("training.slug")}
                        name="slug"
                        value={formData.slug || ""}
                        onChange={handleChange}
                        required
                        placeholder="training-slug"
                    />
                    <FormInput
                        label={t("training.date")}
                        name="date"
                        type="date"
                        value={formData.date || ""}
                        onChange={handleChange}
                        required
                    />
                </div>

                {/* Title */}
                <BilingualInput
                    label={t("training.trainingTitle")}
                    value={{ th: formData.th?.title || "", en: formData.en?.title || "" }}
                    onChange={(lang, val) => handleFieldChange("title", lang, val)}
                    placeholder={{
                        th: t("training.titlePlaceholderTh"),
                        en: t("training.titlePlaceholderEn")
                    }}
                    onTranslate={() => handleTranslate("title")}
                    isTranslating={isTranslating.title}
                />

                {/* Category */}
                <BilingualInput
                    label={t("training.category")}
                    value={{ th: formData.th?.category || "", en: formData.en?.category || "" }}
                    onChange={(lang, val) => handleFieldChange("category", lang, val)}
                    placeholder={{
                        th: t("training.categoryPlaceholderTh"),
                        en: t("training.categoryPlaceholderEn")
                    }}
                    onTranslate={() => handleTranslate("category")}
                    isTranslating={isTranslating.category}
                />

                {/* Summary */}
                <BilingualInput
                    label={t("training.summary")}
                    value={{ th: formData.th?.summary || "", en: formData.en?.summary || "" }}
                    onChange={(lang, val) => handleFieldChange("summary", lang, val)}
                    multiline
                    rows={4}
                    placeholder={{
                        th: t("training.summaryPlaceholderTh"),
                        en: t("training.summaryPlaceholderEn")
                    }}
                    onTranslate={() => handleTranslate("summary")}
                    isTranslating={isTranslating.summary}
                />

                {/* Image */}
                <div>
                    <FileUpload
                        label={t("training.coverImage")}
                        value={formData.imageSrc}
                        onChange={(url) => setFormData(prev => ({ ...prev, imageSrc: url }))}
                        accept="image/*"
                    />
                </div>
            </div>

            <div className="flex justify-end pt-6 border-t mt-6 sticky bottom-0 bg-white/90 backdrop-blur pb-4">
                <SaveButton
                    isLoading={isLoading}
                    label={t("training.saveTraining")}
                />
            </div>
        </form>
    );
}
