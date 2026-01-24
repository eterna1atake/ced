
"use client";

import { useState } from "react";
import SaveButton from '../common/SaveButton';
import FileUpload from "@/components/admin/FileUpload";
import { FormSelect } from "@/components/admin/common/FormInputs";
import { BilingualInput } from "@/components/admin/common/BilingualInput";
import { useAutoTranslate } from "@/hooks/useAutoTranslate";

// These matches FORM_REQUESTS_DATA structure but will be stored in and fetched from DB
const CATEGORIES = [
    { id: "academic", th: "งานบริการวิชาการ", en: "Academic Services" },
    { id: "coop", th: "สหกิจศึกษา", en: "Cooperative Education" }
];

const SECTIONS: Record<string, { id: string, th: string, en: string }[]> = {
    academic: [
        { id: "academic-forms", th: "ใบคำร้องภาควิชา", en: "Department Forms" },
        { id: "university-regulations", th: "ประกาศ ระเบียบมหาวิทยาลัย", en: "University Regulations" }
    ],
    coop: [
        { id: "coop-docs", th: "เอกสารสหกิจศึกษา", en: "Cooperative Education Documents" }
    ]
};

type FormRequestItem = {
    categoryId: string;
    sectionId: string;
    url: string;
    th: { name: string };
    en: { name: string };
};

type FormRequestFormProps = {
    initialData?: Partial<FormRequestItem>;
    onSubmit: (data: FormRequestItem) => Promise<void>;
    isLoading?: boolean;
};

import { useTranslations } from "next-intl";


export default function FormRequestForm({ initialData, onSubmit, isLoading = false }: FormRequestFormProps) {
    const t = useTranslations("Admin.forms");
    const [formData, setFormData] = useState<FormRequestItem>({
        categoryId: initialData?.categoryId || "academic",
        sectionId: initialData?.sectionId || "academic-forms",
        url: initialData?.url || "",
        th: { name: initialData?.th?.name || "" },
        en: { name: initialData?.en?.name || "" },
    });

    const { translate, isTranslating } = useAutoTranslate();

    const handleTranslate = () => {
        translate("name", formData.th.name, (translated) => {
            handleNameChange("en", translated);
        });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (name === "categoryId") {
            const firstSection = SECTIONS[value][0].id;
            setFormData(prev => ({ ...prev, categoryId: value, sectionId: firstSection }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleNameChange = (lang: 'th' | 'en', value: string) => {
        setFormData(prev => ({
            ...prev,
            [lang]: { name: value }
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 bg-white dark:bg-slate-900 p-6 rounded-lg dark:border dark:border-slate-800">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 border-b dark:border-slate-800 pb-4 mb-6">{t("formRequest.details")}</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormSelect
                    label={t("formRequest.category")}
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleChange}
                    options={CATEGORIES.map(c => ({ value: c.id, label: `${c.en} / ${c.th}` }))}
                />

                <FormSelect
                    label={t("formRequest.section")}
                    name="sectionId"
                    value={formData.sectionId}
                    onChange={handleChange}
                    options={(SECTIONS[formData.categoryId] || []).map(s => ({ value: s.id, label: `${s.en} / ${s.th}` }))}
                />
            </div>

            <div className="col-span-2">
                <FileUpload
                    label={t("formRequest.file")}
                    value={formData.url}
                    onChange={(url) => setFormData(prev => ({ ...prev, url: url }))}
                    accept=".pdf,.doc,.docx,.xls,.xlsx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,image/*"
                    folder="ced_web/forms"
                    helperText={t("formRequest.fileHint")}
                />
            </div>

            <div>
                <BilingualInput
                    label={t("formRequest.name")}
                    value={{ th: formData.th.name, en: formData.en.name }}
                    onChange={handleNameChange}
                    placeholder={{ th: t("formRequest.namePlaceholderTh"), en: t("formRequest.namePlaceholderEn") }}
                    onTranslate={handleTranslate}
                    isTranslating={isTranslating.name}
                />
            </div>

            <div className="flex justify-end pt-6 border-t border-slate-100">
                <SaveButton
                    isLoading={isLoading}
                    label={t("formRequest.save")}
                    disabled={!formData.url}
                />
            </div>
        </form>
    );
}
