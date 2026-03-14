"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import type { Service } from "@/types/service";
import FileUpload from "@/components/admin/FileUpload";
import { FormInput, FormSelect } from "@/components/admin/common/FormInputs";
import { BilingualInput } from "@/components/admin/common/BilingualInput";
import SaveButton from '../common/SaveButton';
import { useAutoTranslate } from "@/hooks/useAutoTranslate";
import Swal from "sweetalert2";
import { useUnsavedChanges } from "@/contexts/UnsavedChangesContext";

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

    const [errors, setErrors] = useState<Record<string, string>>({});
    const { setIsDirty } = useUnsavedChanges();
    const { translate, isTranslating } = useAutoTranslate();

    const handleTranslate = () => {
        translate("title", formData.title?.th || "", (translated) => {
            handleTitleChange("en", translated);
        });
    };

    const handleClearError = (name: string) => {
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setIsDirty(true);
        setFormData((prev) => ({ ...prev, [name]: value }));

        handleClearError(name);
    }, [errors]);

    const handleTitleChange = useCallback((lang: 'th' | 'en', value: string) => {
        setIsDirty(true);
        setFormData(prev => ({
            ...prev,
            title: {
                ...(prev.title || { th: "", en: "" }),
                [lang]: value
            }
        }));

        const errorKey = lang === 'th' ? 'titleTh' : 'titleEn';
        handleClearError(errorKey);
    }, [errors]);

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.title?.th) newErrors.titleTh = t("common.required");
        if (!formData.title?.en) newErrors.titleEn = t("common.required");
        if (!formData.link) newErrors.link = t("common.required");
        if (!formData.icon) newErrors.icon = t("common.required");

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
            text: t("common.saveConfirmText") || "Do you want to save this service?",
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
                id: formData.id || `service-${Date.now()}`,
            } as Service;
            setIsDirty(false);
            onSubmit(submissionData);
        }
    };

    const handleIconChange = useCallback((url: string) => {
        setIsDirty(true);
        setFormData(prev => ({ ...prev, icon: url }));
        handleClearError("icon");
    }, [errors.icon, setIsDirty]);

    return (
        <form onSubmit={handleSubmit} noValidate className="space-y-8 bg-white dark:bg-slate-900 p-8 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800">
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
                    required
                    error={{ th: errors.titleTh, en: errors.titleEn }}
                    onFocus={(lang) => handleClearError(lang === 'th' ? "titleTh" : "titleEn")}
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
                        required
                        error={errors.link}
                        onFocus={() => handleClearError("link")}
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
                        required
                        error={errors.icon}
                        onFocus={() => handleClearError("icon")}
                        helperText={t("services.iconHint")}
                    />
                </div>
            </div>

            <div className="flex justify-end pt-6 border-t dark:border-slate-800 mt-6 sticky bottom-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur pb-4">
                <SaveButton
                    isLoading={isLoading}
                    label={t("services.saveService")}
                    loadingLabel={t("common.saving")}
                />
            </div>
        </form>
    );
}
