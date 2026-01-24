"use client";

import Image from "next/image";

import { useState } from "react";
import FileUpload from "@/components/admin/FileUpload";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faImage,
    faBook,
    faGraduationCap,
    faChalkboardTeacher,
    faGlobe,
    faEnvelope,
    faDatabase,
    faCode,
    faServer,
    faFileAlt,
    faDesktop,
    faCloud,
    faTools,
    faLink
} from "@fortawesome/free-solid-svg-icons";
import {
    faMicrosoft,
    faGoogle,
    faYoutube,
    faWindows,
    faGithub,
    faDiscord,
    faSlack
} from "@fortawesome/free-brands-svg-icons";
import SaveButton from '../common/SaveButton';
import { FormInput, FormSelect } from "@/components/admin/common/FormInputs";
import { BilingualInput } from "@/components/admin/common/BilingualInput";
import { useAutoTranslate } from "@/hooks/useAutoTranslate";

export interface IOnlineResourceForm {
    key: string;
    link: string;
    iconName: string;
    imagePath?: string;
    colorClass: string;
    categoryKey: "learning_resources" | "systems_tools";
    th: { title: string; description: string };
    en: { title: string; description: string };
}

type ResourceFormProps = {
    initialData?: Partial<IOnlineResourceForm> & { _id?: string };
    onSubmit: (data: IOnlineResourceForm) => Promise<void>;
    isLoading?: boolean;
};

const AVAILABLE_ICONS = [
    { id: "book", icon: faBook, label: "Literature" },
    { id: "graduation-cap", icon: faGraduationCap, label: "Academic" },
    { id: "chalkboard-teacher", icon: faChalkboardTeacher, label: "Instructional" },
    { id: "microsoft", icon: faMicrosoft, label: "Microsoft" },
    { id: "google", icon: faGoogle, label: "Google" },
    { id: "windows", icon: faWindows, label: "Windows" },
    { id: "youtube", icon: faYoutube, label: "Youtube" },
    { id: "globe", icon: faGlobe, label: "Web/Global" },
    { id: "envelope", icon: faEnvelope, label: "Email/Contact" },
    { id: "database", icon: faDatabase, label: "Data" },
    { id: "code", icon: faCode, label: "Development" },
    { id: "server", icon: faServer, label: "System/Server" },
    { id: "file-alt", icon: faFileAlt, label: "Document" },
    { id: "desktop", icon: faDesktop, label: "Desktop App" },
    { id: "cloud", icon: faCloud, label: "Cloud" },
    { id: "tools", icon: faTools, label: "Utility" },
    { id: "link", icon: faLink, label: "Link" },
    { id: "github", icon: faGithub, label: "GitHub" },
    { id: "discord", icon: faDiscord, label: "Discord" },
    { id: "slack", icon: faSlack, label: "Slack" },
];

const COLOR_PRESETS = [
    { id: "slate", class: "bg-slate-50 text-slate-700", label: "Slate (Default)", color: "bg-slate-200" },
    { id: "blue", class: "bg-blue-50 text-blue-700", label: "Blue", color: "bg-blue-500" },
    { id: "indigo", class: "bg-indigo-50 text-indigo-700", label: "Indigo", color: "bg-indigo-500" },
    { id: "emerald", class: "bg-emerald-50 text-emerald-700", label: "Emerald", color: "bg-emerald-500" },
    { id: "amber", class: "bg-amber-50 text-amber-700", label: "Amber", color: "bg-amber-500" },
    { id: "rose", class: "bg-rose-50 text-rose-700", label: "Rose", color: "bg-rose-500" },
    { id: "violet", class: "bg-violet-50 text-violet-700", label: "Violet", color: "bg-violet-500" },
    { id: "cyan", class: "bg-cyan-50 text-cyan-700", label: "Cyan", color: "bg-cyan-500" },
];

import { useTranslations } from "next-intl";


export default function ResourceForm({ initialData, onSubmit, isLoading = false }: ResourceFormProps) {
    const t = useTranslations("Admin.forms");
    const [formData, setFormData] = useState<IOnlineResourceForm>({
        key: initialData?.key || "",
        link: initialData?.link || "",
        iconName: initialData?.iconName || "book",
        imagePath: initialData?.imagePath || "",
        colorClass: initialData?.colorClass || "bg-slate-50 text-slate-700",
        categoryKey: initialData?.categoryKey || "learning_resources",
        th: {
            title: initialData?.th?.title || "",
            description: initialData?.th?.description || "",
        },
        en: {
            title: initialData?.en?.title || "",
            description: initialData?.en?.description || "",
        },
    });

    const { translate, isTranslating } = useAutoTranslate();

    const handleTranslate = (field: 'title' | 'description') => {
        translate(field, formData.th[field], (translated) => {
            handleFieldChange(field, "en", translated);
        });
    };

    const [visualType, setVisualType] = useState<"icon" | "image">(initialData?.imagePath ? "image" : "icon");


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFieldChange = (field: "title" | "description", lang: "th" | "en", value: string) => {
        setFormData(prev => ({
            ...prev,
            [lang]: {
                ...prev[lang],
                [field]: value
            }
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const submissionData = { ...formData };
        if (visualType === "icon") {
            submissionData.imagePath = "";
        } else {
            submissionData.iconName = "image";
        }
        await onSubmit(submissionData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 bg-white dark:bg-slate-900 p-8 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 border-b dark:border-slate-800 pb-4 mb-6">{t("resource.details")}</h3>

            <div className="space-y-4">
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">{t("resource.content")}</h3>
                <BilingualInput
                    label={t("resource.title")}
                    value={{ th: formData.th.title, en: formData.en.title }}
                    onChange={(lang, val) => handleFieldChange("title", lang, val)}
                    placeholder={{ th: t("resource.titlePlaceholderTh"), en: t("resource.titlePlaceholderEn") }}
                    onTranslate={() => handleTranslate("title")}
                    isTranslating={isTranslating.title}
                />
                <BilingualInput
                    label={t("resource.description")}
                    value={{ th: formData.th.description, en: formData.en.description }}
                    onChange={(lang, val) => handleFieldChange("description", lang, val)}
                    multiline
                    rows={3}
                    placeholder={{ th: t("resource.descriptionPlaceholderTh"), en: t("resource.descriptionPlaceholderEn") }}
                    onTranslate={() => handleTranslate("description")}
                    isTranslating={isTranslating.description}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormInput
                    label={t("resource.key")}
                    name="key"
                    value={formData.key}
                    onChange={handleChange}
                    required
                    placeholder="e.g. microsoft_teams"
                    className="capitalize"
                />

                <FormInput
                    label={t("resource.link")}
                    name="link"
                    type="url"
                    value={formData.link}
                    onChange={handleChange}
                    required
                    placeholder="https://teams.microsoft.com"
                />

                <FormSelect
                    label={t("resource.category")}
                    name="categoryKey"
                    value={formData.categoryKey}
                    onChange={handleChange}
                    options={[
                        { value: "learning_resources", label: t("resource.catLearning") },
                        { value: "systems_tools", label: t("resource.catSystems") }
                    ]}
                />
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                    <label className="text-xl font-bold text-slate-900 dark:text-slate-100">{t("resource.visual")}</label>
                    <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1 text-xs font-bold">
                        <button
                            type="button"
                            onClick={() => setVisualType("icon")}
                            className={`px-4 py-2 rounded-md transition-all ${visualType === "icon" ? "bg-white dark:bg-slate-700 text-primary-main shadow-sm" : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"}`}
                        >
                            {t("resource.typeIcon")}
                        </button>
                        <button
                            type="button"
                            onClick={() => setVisualType("image")}
                            className={`px-4 py-2 rounded-md transition-all ${visualType === "image" ? "bg-white dark:bg-slate-700 text-primary-main shadow-sm" : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"}`}
                        >
                            {t("resource.typeImage")}
                        </button>
                    </div>
                </div>

                {visualType === "icon" ? (
                    <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2">
                        {AVAILABLE_ICONS.map((item) => (
                            <button
                                key={item.id}
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, iconName: item.id }))}
                                className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all aspect-square ${formData.iconName === item.id
                                    ? "border-primary-main bg-primary-main/5 text-primary-main ring-2 ring-primary-main/20"
                                    : "border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-primary-main/50 text-slate-400 dark:text-slate-500"
                                    }`}
                                title={item.label}
                            >
                                <FontAwesomeIcon icon={item.icon} className="text-lg mb-1" />
                                <span className="text-[9px] leading-tight text-center line-clamp-1 w-full">{item.label}</span>
                            </button>
                        ))}
                    </div>
                ) : (
                    <FileUpload
                        label={t("resource.uploadLogo")}
                        value={formData.imagePath}
                        onChange={(url) => setFormData(prev => ({ ...prev, imagePath: url }))}
                        accept="image/*"
                        folder="ced_web/resources"
                    />
                )}
            </div>

            {/* Theme & Actions */}
            <div className="pt-6 border-t dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{t("resource.colorTheme")}</label>
                        <div className="flex flex-wrap gap-3">
                            {COLOR_PRESETS.map((preset) => (
                                <button
                                    key={preset.id}
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, colorClass: preset.class }))}
                                    className={`
                                        w-8 h-8 rounded-full shadow-sm border-2 transition-all flex items-center justify-center
                                        ${preset.color}
                                        ${formData.colorClass === preset.class ? "ring-2 ring-offset-2 ring-slate-400 scale-110 border-white" : "border-transparent opacity-70 hover:opacity-100 hover:scale-105"}
                                    `}
                                    title={preset.label}
                                >
                                    {formData.colorClass === preset.class && (
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-white">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="flex flex-col items-center pl-6 border-l dark:border-slate-700">
                        <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase mb-1">{t("common.preview")}</label>
                        <div className={`w-10 h-10 rounded shadow-sm flex items-center justify-center ${formData.colorClass} border border-white/20`}>
                            {visualType === "icon" ? (
                                <FontAwesomeIcon icon={AVAILABLE_ICONS.find(i => i.id === formData.iconName)?.icon || faBook} className="text-lg" />
                            ) : (
                                formData.imagePath ? <Image src={formData.imagePath} width={24} height={24} className="w-6 h-6 object-contain" alt="Preview" unoptimized /> : <FontAwesomeIcon icon={faImage} className="text-lg opacity-20" />
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-2">
                    <SaveButton
                        isLoading={isLoading}
                        label={initialData?._id ? t("resource.update") : t("resource.create")}
                    />
                </div>
            </div>
        </form>
    );
}
