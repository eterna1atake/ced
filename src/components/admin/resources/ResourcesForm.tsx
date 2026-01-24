
"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { RESOURCE_CATEGORIES } from "@/constants/resources";
import FileUpload from "@/components/admin/FileUpload";
import SaveButton from '../common/SaveButton';
import { FormInput, FormSelect } from "@/components/admin/common/FormInputs";
import { BilingualInput } from "@/components/admin/common/BilingualInput";
import { useAutoTranslate } from "@/hooks/useAutoTranslate";

// Types for the form
type ResourceItemSeed = {
    key: string;
    categoryKey: string; // Added to Flatten logic
    link: string;
    iconName: string;
    imagePath?: string;
    colorClass: string;
    th: { title: string; description: string };
    en: { title: string; description: string };
};

type ResourcesFormProps = {
    initialData?: Partial<ResourceItemSeed>;
    onSubmit: (data: ResourceItemSeed) => void;
    isLoading?: boolean;
};

export default function ResourcesForm({ initialData, onSubmit, isLoading = false }: ResourcesFormProps) {
    const t = useTranslations("Admin.forms");
    // Flatten categories options
    const categories = RESOURCE_CATEGORIES.map(c => ({ key: c.key, title: c.title.en + " / " + c.title.th }));

    const [formData, setFormData] = useState<Partial<ResourceItemSeed>>({
        key: "",
        categoryKey: categories[0]?.key || "",
        link: "",
        iconName: "book",
        colorClass: "bg-white",
        th: { title: "", description: "" },
        en: { title: "", description: "" },
        ...initialData,
    });

    const { translate, isTranslating } = useAutoTranslate();

    const handleTranslate = (field: 'title' | 'description') => {
        const text = formData.th?.[field] || "";
        translate(field, text, (translated) => {
            handleFieldChange(field, "en", translated);
        });
    };



    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFieldChange = (field: 'title' | 'description', lang: 'th' | 'en', value: string) => {
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
            key: formData.key || `res-${Date.now()}`,
        } as ResourceItemSeed;

        onSubmit(submissionData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 bg-white p-8 rounded-lg shadow-sm border border-slate-200">

            <div className="space-y-8">
                <h3 className="text-2xl font-bold text-slate-900 border-b pb-4">{t("resources.details")}</h3>

                {/* Settings */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormSelect
                        label={t("resources.category")}
                        name="categoryKey"
                        value={formData.categoryKey || categories[0]?.key || ""}
                        onChange={handleChange}
                        options={categories.map(c => ({ value: c.key, label: c.title }))}
                    />
                    <FormInput
                        label={t("resources.uniqueKey")}
                        name="key"
                        value={formData.key || ""}
                        onChange={handleChange}
                        required
                        placeholder={t("resources.keyPlaceholder")}
                    />

                    <div className="col-span-1 md:col-span-2">
                        <FormInput
                            label={t("resources.linkUrl")}
                            name="link"
                            value={formData.link || ""}
                            onChange={handleChange}
                            required
                            placeholder="https://"
                        />
                    </div>

                    <FormInput
                        label={t("resources.colorClass")}
                        name="colorClass"
                        value={formData.colorClass || ""}
                        onChange={handleChange}
                        placeholder="bg-red-100 text-red-600"
                    />
                    <FormSelect
                        label={t("resources.iconName")}
                        name="iconName"
                        value={formData.iconName || "book"}
                        onChange={handleChange}
                        options={[
                            { value: "book", label: t("resources.icons.book") },
                            { value: "graduation-cap", label: t("resources.icons.graduationCap") },
                            { value: "chalkboard-teacher", label: t("resources.icons.teacher") },
                            { value: "microsoft", label: "Microsoft" },
                            { value: "google", label: "Google" },
                            { value: "youtube", label: "YouTube" },
                            { value: "windows", label: "Windows" },
                            { value: "image", label: t("resources.icons.custom") },
                        ]}
                    />
                </div>

                {/* Custom Image Upload */}
                {formData.iconName === 'image' && (
                    <div>
                        <FileUpload
                            label={t("resources.customIcon")}
                            value={formData.imagePath}
                            onChange={(url) => setFormData(prev => ({ ...prev, imagePath: url }))}
                            accept="image/*"
                        />
                    </div>
                )}

                {/* Bilingual Fields */}
                <BilingualInput
                    label={t("resources.resourceName")}
                    value={{ th: formData.th?.title || "", en: formData.en?.title || "" }}
                    onChange={(lang, val) => handleFieldChange("title", lang, val)}
                    placeholder={{
                        th: t("resources.namePlaceholderTh"),
                        en: t("resources.namePlaceholderEn")
                    }}
                    onTranslate={() => handleTranslate("title")}
                    isTranslating={isTranslating.title}
                />

                <BilingualInput
                    label={t("resources.description")}
                    value={{ th: formData.th?.description || "", en: formData.en?.description || "" }}
                    onChange={(lang, val) => handleFieldChange("description", lang, val)}
                    multiline
                    rows={3}
                    placeholder={{
                        th: t("resources.descriptionPlaceholderTh"),
                        en: t("resources.descriptionPlaceholderEn")
                    }}
                    onTranslate={() => handleTranslate("description")}
                    isTranslating={isTranslating.description}
                />
            </div>

            <div className="flex justify-end pt-6 border-t mt-6 sticky bottom-0 bg-white/90 backdrop-blur pb-4">
                <SaveButton
                    isLoading={isLoading}
                    label={t("resources.saveResource")}
                />
            </div>
        </form>
    );
}
