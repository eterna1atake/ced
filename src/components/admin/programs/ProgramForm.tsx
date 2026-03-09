import { useState } from "react";
import { useTranslations } from "next-intl";
import type { ProgramItem } from "@/types/program";
import FileUpload from "@/components/admin/FileUpload";
import { BilingualInput } from '../common/BilingualInput';
import SaveButton from '../common/SaveButton';
import { useAutoTranslate } from "@/hooks/useAutoTranslate";

type ProgramFormProps = {
    initialData?: Partial<ProgramItem>;
    onSubmit: (data: ProgramItem) => void;
    isLoading?: boolean;
};

export default function ProgramForm({ initialData, onSubmit, isLoading = false }: ProgramFormProps) {
    const t = useTranslations("Admin.forms");
    const [formData, setFormData] = useState<Partial<ProgramItem>>({
        id: "",
        level: "bachelor",
        imageSrc: "",
        imageAlt: "",
        link: "",
        th: {
            degree: "",
            title: "",
            subtitle: "",
            description: "",
        },
        en: {
            degree: "",
            title: "",
            subtitle: "",
            description: "",
        },
        ...initialData,
    });

    // Sync state when initialData changes (after server refresh)
    const [lastInitialData, setLastInitialData] = useState(initialData);
    if (initialData !== lastInitialData) {
        setLastInitialData(initialData);
        setFormData(prev => ({ ...prev, ...initialData }));
    }

    const [errors, setErrors] = useState<Record<string, string>>({});
    const { translate, isTranslating } = useAutoTranslate();

    const handleTranslate = (field: keyof ProgramItem['th']) => {
        const text = formData.th?.[field] || "";
        translate(field, text, (translated) => {
            handleNestedChange("en", field, translated);
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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));

        handleClearError(name);
    };

    const handleNestedChange = (
        lang: 'th' | 'en',
        field: keyof ProgramItem['th'],
        value: string
    ) => {
        setFormData((prev) => ({
            ...prev,
            [lang]: {
                ...prev[lang]!,
                [field]: value,
            },
        }));

        const errorKey = `${field}${lang.charAt(0).toUpperCase() + lang.slice(1)}`;
        handleClearError(errorKey);
    };

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.id) newErrors.id = t("common.required");
        if (!formData.link) newErrors.link = t("common.required");
        if (!formData.imageSrc) newErrors.imageSrc = t("common.required");
        if (!formData.th?.degree) newErrors.degreeTh = t("common.required");
        if (!formData.en?.degree) newErrors.degreeEn = t("common.required");
        if (!formData.th?.title) newErrors.titleTh = t("common.required");
        if (!formData.en?.title) newErrors.titleEn = t("common.required");
        if (!formData.th?.subtitle) newErrors.subtitleTh = t("common.required");
        if (!formData.en?.subtitle) newErrors.subtitleEn = t("common.required");
        if (!formData.th?.description) newErrors.descriptionTh = t("common.required");
        if (!formData.en?.description) newErrors.descriptionEn = t("common.required");

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

        onSubmit(formData as ProgramItem);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 bg-white dark:bg-slate-900 p-8 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800">
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 border-b dark:border-slate-800 pb-4 mb-6">{t("programs.generalInfo")}</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Program ID (ReadOnly if editing) */}
                <div>
                    <label className={`block text-sm font-medium mb-1 ${errors.id ? "text-red-500" : "text-slate-700 dark:text-slate-300"}`}>Program ID (Unique Identifier)</label>
                    <input
                        type="text"
                        name="id"
                        value={formData.id}
                        onChange={handleChange}
                        onFocus={() => handleClearError("id")}
                        readOnly={!!initialData?.id}
                        required
                        placeholder="e.g. ced, tct, mtct"
                        className={`w-full px-4 py-2 border rounded-md outline-none ${initialData?.id
                            ? "bg-slate-100 dark:bg-slate-800/50 text-slate-500 cursor-not-allowed border-slate-200 dark:border-slate-700"
                            : errors.id
                                ? "border-red-500 focus:ring-2 focus:ring-red-500/20 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                                : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
                            }`}
                    />
                    {errors.id && <p className="text-[10px] text-red-500 mt-1">{errors.id}</p>}
                    <p className="text-[10px] text-slate-400 mt-1">
                        {initialData?.id
                            ? "Unique ID for this program (cannot be changed after creation)"
                            : "Enter a unique short ID (lowercase, no spaces) used in URLs."}
                    </p>
                </div>

                {/* Level */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t("programs.level")}</label>
                    <select
                        name="level"
                        value={formData.level}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                    >
                        <option value="bachelor">{t("programs.levels.bachelor")}</option>
                        <option value="master">{t("programs.levels.master")}</option>
                        <option value="doctoral">{t("programs.levels.doctoral")}</option>
                    </select>
                </div>

                {/* Program Link (URL) */}
                <div className="col-span-2">
                    <label className={`block text-sm font-medium mb-1 ${errors.link ? "text-red-500" : "text-slate-700 dark:text-slate-300"}`}>Detail Page Path (e.g. /programs/bachelor/ced)</label>
                    <input
                        type="text"
                        name="link"
                        value={formData.link}
                        onChange={handleChange}
                        onFocus={() => handleClearError("link")}
                        placeholder="/programs/bachelor/ced"
                        required
                        className={`w-full px-4 py-2 border rounded-md outline-none focus:ring-2 ${errors.link
                            ? "border-red-500 focus:ring-red-500/20"
                            : "border-slate-200 dark:border-slate-700 focus:ring-indigo-500"
                            } bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100`}
                    />
                    {errors.link && <p className="text-[10px] text-red-500 mt-1">{errors.link}</p>}
                    <p className="text-[10px] text-slate-400 mt-1">Specify the internal path to the detailed information page.</p>
                </div>

                {/* Image Upload */}
                <div className="col-span-2">
                    <FileUpload
                        label={t("programs.coverImage")}
                        value={formData.imageSrc}
                        onChange={(url) => {
                            setFormData(prev => ({ ...prev, imageSrc: url }));
                            handleClearError("imageSrc");
                        }}
                        onFocus={() => handleClearError("imageSrc")}
                        accept="image/*"
                        folder="ced_web/programs"
                        required
                        error={errors.imageSrc}
                    />
                </div>

                {/* Alt Text */}
                <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t("programs.imageAlt")}</label>
                    <input
                        type="text"
                        name="imageAlt"
                        value={formData.imageAlt}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                    />
                </div>
            </div>

            {/* Localized Content using BilingualInput */}
            <div className="space-y-6 pt-2">
                <BilingualInput
                    label={t("programs.degreeName")}
                    placeholder={{
                        th: t("programs.degreeNamePlaceholderTh"),
                        en: t("programs.degreeNamePlaceholderEn")
                    }}
                    value={{ th: formData.th?.degree || "", en: formData.en?.degree || "" }}
                    onChange={(lang, val) => handleNestedChange(lang, 'degree', val)}
                    onTranslate={() => handleTranslate('degree')}
                    isTranslating={isTranslating.degree}
                    required
                    error={{ th: errors.degreeTh, en: errors.degreeEn }}
                    onFocus={(lang) => handleClearError(lang === 'th' ? "degreeTh" : "degreeEn")}
                />

                <BilingualInput
                    label={t("programs.programTitle")}
                    placeholder={{
                        th: t("programs.programTitlePlaceholderTh"),
                        en: t("programs.programTitlePlaceholderEn")
                    }}
                    value={{ th: formData.th?.title || "", en: formData.en?.title || "" }}
                    onChange={(lang, val) => handleNestedChange(lang, 'title', val)}
                    onTranslate={() => handleTranslate('title')}
                    isTranslating={isTranslating.title}
                    required
                    error={{ th: errors.titleTh, en: errors.titleEn }}
                    onFocus={(lang) => handleClearError(lang === 'th' ? "titleTh" : "titleEn")}
                />

                <BilingualInput
                    label={t("programs.subtitle")}
                    placeholder={{
                        th: t("programs.subtitlePlaceholderTh"),
                        en: t("programs.subtitlePlaceholderEn")
                    }}
                    value={{ th: formData.th?.subtitle || "", en: formData.en?.subtitle || "" }}
                    onChange={(lang, val) => handleNestedChange(lang, 'subtitle', val)}
                    onTranslate={() => handleTranslate('subtitle')}
                    isTranslating={isTranslating.subtitle}
                    required
                    error={{ th: errors.subtitleTh, en: errors.subtitleEn }}
                    onFocus={(lang) => handleClearError(lang === 'th' ? "subtitleTh" : "subtitleEn")}
                />

                <BilingualInput
                    label={t("programs.description")}
                    multiline
                    value={{ th: formData.th?.description || "", en: formData.en?.description || "" }}
                    onChange={(lang, val) => handleNestedChange(lang, 'description', val)}
                    onTranslate={() => handleTranslate('description')}
                    isTranslating={isTranslating.description}
                    required
                    error={{ th: errors.descriptionTh, en: errors.descriptionEn }}
                    onFocus={(lang) => handleClearError(lang === 'th' ? "descriptionTh" : "descriptionEn")}
                />
            </div>

            <div className="flex justify-end pt-6 border-t mt-6 sticky bottom-0 bg-white/90 backdrop-blur pb-4">
                <SaveButton
                    isLoading={isLoading}
                    label={t("programs.saveProgram")}
                    loadingLabel={t("common.saving")}
                />
            </div>
        </form>
    );
}
