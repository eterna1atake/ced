"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import type { Service } from "@/types/service";
import FileUpload from "@/components/admin/FileUpload";
import { FormInput, FormSelect } from "@/components/admin/common/FormInputs";
import { BilingualInput } from "@/components/admin/common/BilingualInput";
import SaveButton from '../common/SaveButton';
import { useAutoTranslate } from "@/hooks/useAutoTranslate";

type ServiceFormProps = {
    initialData?: Partial<Service>;
    onSubmit: (data: Service) => void;
    isLoading?: boolean;
};

export default function ServiceForm({ initialData, onSubmit, isLoading = false }: ServiceFormProps) {
    const t = useTranslations("Admin.forms");

    const categories = [
        { value: "software", label: t("services.categories.software") },
        { value: "account", label: t("services.categories.account") },
        { value: "network", label: t("services.categories.network") },
        { value: "information-system", label: t("services.categories.informationSystem") },
        { value: "service-area", label: t("services.categories.serviceArea") },
        { value: "other", label: t("services.categories.other") },
    ];

    const [formData, setFormData] = useState<Partial<Service>>({
        title: { th: "", en: "" },
        icon: "",
        link: "",
        category: "other",
        ...initialData,
    });

    const { translate, isTranslating } = useAutoTranslate();

    const handleTranslate = () => {
        translate("title", formData.title?.th || "", (translated) => {
            handleTitleChange("en", translated);
        });
    };

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    }, []);

    const handleTitleChange = useCallback((lang: 'th' | 'en', value: string) => {
        setFormData(prev => ({
            ...prev,
            title: {
                ...(prev.title || { th: "", en: "" }),
                [lang]: value
            }
        }));
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const submissionData = {
            ...formData,
            id: formData.id || `service-${Date.now()}`,
        } as Service;

        onSubmit(submissionData);
    };

    const handleIconChange = useCallback((url: string) => {
        setFormData(prev => ({ ...prev, icon: url }));
    }, []);

    return (
        <form onSubmit={handleSubmit} className="space-y-8 bg-white dark:bg-slate-900 p-8 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 border-b dark:border-slate-800 pb-4">{t("services.details")}</h3>

            <div className="space-y-6">
                {/* Title */}
                <BilingualInput
                    label={t("services.serviceTitle")}
                    value={formData.title || { th: "", en: "" }}
                    onChange={handleTitleChange}
                    placeholder={{
                        th: t("services.titlePlaceholderTh"),
                        en: t("services.titlePlaceholderEn")
                    }}
                    onTranslate={handleTranslate}
                    isTranslating={isTranslating.title}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Category */}
                    <FormSelect
                        label={t("services.category")}
                        name="category"
                        value={formData.category || "other"}
                        onChange={handleChange}
                        options={categories}
                    />

                    {/* Link */}
                    <FormInput
                        label={t("services.linkUrl")}
                        name="link"
                        value={formData.link || ""}
                        onChange={handleChange}
                        placeholder="https://..."
                    />
                </div>

                {/* Icon URL */}
                <div>
                    <FileUpload
                        label={t("services.serviceIcon")}
                        value={formData.icon || ""}
                        onChange={handleIconChange}
                        accept="image/*"
                        folder="ced_web/services"
                    />
                    <p className="mt-1 text-[10px] text-slate-400 dark:text-slate-500">{t("services.iconHint")}</p>
                </div>
            </div>

            <div className="flex justify-end pt-6 border-t dark:border-slate-800 mt-6 sticky bottom-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur pb-4">
                <SaveButton
                    isLoading={isLoading}
                    label={t("services.saveService")}
                />
            </div>
        </form>
    );
}
