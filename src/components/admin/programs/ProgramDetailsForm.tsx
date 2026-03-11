"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { ProgramDetailData } from "@/types/program";
import FileUpload from "@/components/admin/FileUpload";
import CurriculumEditor from "./CurriculumEditor";
import BilingualField, { BilingualFieldProvider } from "./BilingualField";
import SaveButton from '../common/SaveButton';
import { useAutoTranslate } from "@/hooks/useAutoTranslate";

import { useTranslations } from "next-intl";
import type { ProgramItem } from "@/types/program";
import { useUnsavedChanges } from "@/contexts/UnsavedChangesContext";


type ProgramDetailsFormProps = {
    initialData?: Partial<ProgramDetailData>;
    generalData?: ProgramItem;
    onSubmit: (data: ProgramDetailData) => void;
    isLoading?: boolean;
    onFormDataChange?: (data: Partial<ProgramDetailData>) => void;
};


export default function ProgramDetailsForm({ initialData, generalData, onSubmit, isLoading = false, onFormDataChange }: ProgramDetailsFormProps) {
    const t = useTranslations("Admin.forms");
    const { setIsDirty } = useUnsavedChanges();
    const [formData, _setFormData] = useState<Partial<ProgramDetailData>>({
        id: "",
        name: { th: "", en: "" },
        degree: { full: { th: "", en: "" }, short: { th: "", en: "" } },
        programFormat: { title: { th: "", en: "" }, items: [] },
        gradAttribute: { title: { th: "", en: "" }, items: [] },
        major: { title: { th: "", en: "" }, description: { th: "", en: "" } },
        highlights: { title: { th: "", en: "" }, items: [] },
        suitableFor: { title: { th: "", en: "" }, items: [] },
        curriculum: [],
        documents: [],
        careers: { title: { th: "", en: "" }, items: [] },
        language: { th: "", en: "" },
        admission: { th: "", en: "" },
        ...initialData,
    });

    const setFormData: typeof _setFormData = useCallback((value) => {
        setIsDirty(true);
        _setFormData(value);
    }, [setIsDirty]);

    const syncFromGeneral = () => {
        if (!generalData) return;
        setFormData(prev => ({
            ...prev,
            name: {
                th: generalData.th.title,
                en: generalData.en.title
            },
            degree: {
                full: {
                    th: generalData.th.degree,
                    en: generalData.en.degree
                },
                short: {
                    th: generalData.th.subtitle,
                    en: generalData.en.subtitle
                }
            }
        }));
    };

    // Sync state when initialData changes (after server refresh)
    const [lastInitialData, setLastInitialData] = useState(initialData);
    if (initialData !== lastInitialData) {
        setLastInitialData(initialData);
        _setFormData(prev => ({ ...prev, ...initialData }));
    }

    // Debounce onFormDataChange to prevent focus loss during typing
    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
    useEffect(() => {
        if (onFormDataChange) {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
            debounceTimerRef.current = setTimeout(() => {
                onFormDataChange(formData);
            }, 300);
        }
        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, [formData, onFormDataChange]);

    // --- Helper Functions ---

    const handleChange = useCallback((path: string[], value: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
        setFormData((prev) => {
            // Helper to recursively clone and update
            const updateRecursive = (current: any, pathIdx: number): any => { // eslint-disable-line @typescript-eslint/no-explicit-any
                if (pathIdx === path.length) {
                    return value;
                }

                const key = path[pathIdx];
                const nextKey = path[pathIdx + 1];

                // Determine if we need to clone an array or an object
                let clone;
                if (Array.isArray(current)) {
                    clone = [...current];
                } else if (current && typeof current === 'object') {
                    clone = { ...current };
                } else {
                    // If current is null, undefined, or not an object, initiate it
                    clone = isNaN(Number(key)) ? {} : [];
                }

                // If the key doesn't exist, decide if next level should be array or object
                if (clone[key] === undefined && pathIdx < path.length - 1) {
                    clone[key] = isNaN(Number(nextKey)) ? {} : [];
                }

                clone[key] = updateRecursive(clone[key], pathIdx + 1);
                return clone;
            };

            return updateRecursive(prev, 0);
        });
    }, []);

    const { translate, isTranslating } = useAutoTranslate();

    const handleTranslate = useCallback((path: string[]) => {

        setFormData(prev => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const text = path.reduce((acc: any, key) => acc?.[key], prev) || "";
            const key = path.join('.');
            translate(key, text, (translated) => {
                const enPath = [...path.slice(0, -1), "en"];
                handleChange(enPath, translated);
            });
            return prev;
        });
    }, [translate, handleChange]);

    const isPathTranslating = useCallback((path: string[]) => {
        const key = path.join('.');
        return isTranslating[key] || false;
    }, [isTranslating]);

    const [errors, setErrors] = useState<Record<string, string>>({});

    const validate = () => {
        const newErrors: Record<string, string> = {};

        // Basic Info
        if (!formData.name?.th) newErrors['name.th'] = t("common.required");
        if (!formData.name?.en) newErrors['name.en'] = t("common.required");
        if (!formData.degree?.full?.th) newErrors['degree.full.th'] = t("common.required");
        if (!formData.degree?.full?.en) newErrors['degree.full.en'] = t("common.required");
        if (!formData.degree?.short?.th) newErrors['degree.short.th'] = t("common.required");
        if (!formData.degree?.short?.en) newErrors['degree.short.en'] = t("common.required");

        if (!formData.admission?.th) newErrors['admission.th'] = t("common.required");
        if (!formData.admission?.en) newErrors['admission.en'] = t("common.required");

        if (!formData.language?.th) newErrors['language.th'] = t("common.required");
        if (!formData.language?.en) newErrors['language.en'] = t("common.required");

        if (!formData.programFormat?.title?.th) newErrors['programFormat.title.th'] = t("common.required");
        if (!formData.programFormat?.title?.en) newErrors['programFormat.title.en'] = t("common.required");

        if (!formData.gradAttribute?.title?.th) newErrors['gradAttribute.title.th'] = t("common.required");
        if (!formData.gradAttribute?.title?.en) newErrors['gradAttribute.title.en'] = t("common.required");

        if (!formData.suitableFor?.title?.th) newErrors['suitableFor.title.th'] = t("common.required");
        if (!formData.suitableFor?.title?.en) newErrors['suitableFor.title.en'] = t("common.required");

        // Curriculum Validation
        if (formData.curriculum) {
            formData.curriculum.forEach((sec, sIdx) => {
                if (!sec.title.th) newErrors[`sections[${sIdx}].title.th`] = t("common.required");
                if (!sec.title.en) newErrors[`sections[${sIdx}].title.en`] = t("common.required");

                sec.items.forEach((item, iIdx) => {
                    if (!item.id) newErrors[`sections[${sIdx}].items[${iIdx}].id`] = t("common.required");
                    if (!item.title.th) newErrors[`sections[${sIdx}].items[${iIdx}].title.th`] = t("common.required");
                    if (!item.title.en) newErrors[`sections[${sIdx}].items[${iIdx}].title.en`] = t("common.required");

                    item.subItems?.forEach((sub, subIdx) => {
                        if (!sub.title?.th) newErrors[`sections[${sIdx}].items[${iIdx}].subItems[${subIdx}].title.th`] = t("common.required");
                        if (!sub.title?.en) newErrors[`sections[${sIdx}].items[${iIdx}].subItems[${subIdx}].title.en`] = t("common.required");
                    });
                });
            });
        }

        // Program Format Validation
        if (formData.programFormat?.items) {
            formData.programFormat.items.forEach((item, idx) => {
                if (!item.title?.th) newErrors[`programFormat.items[${idx}].title.th`] = t("common.required");
                if (!item.title?.en) newErrors[`programFormat.items[${idx}].title.en`] = t("common.required");
                item.subItems?.forEach((sub, sIdx) => {
                    if (!sub.th) newErrors[`programFormat.items[${idx}].subItems[${sIdx}].th`] = t("common.required");
                    if (!sub.en) newErrors[`programFormat.items[${idx}].subItems[${sIdx}].en`] = t("common.required");
                });
            });
        }

        // Grad Attributes Validation
        if (formData.gradAttribute?.items) {
            formData.gradAttribute.items.forEach((item, idx) => {
                if (!item.title?.th) newErrors[`gradAttribute.items[${idx}].title.th`] = t("common.required");
                if (!item.title?.en) newErrors[`gradAttribute.items[${idx}].title.en`] = t("common.required");
                item.subItems?.forEach((sub, sIdx) => {
                    if (!sub.th) newErrors[`gradAttribute.items[${idx}].subItems[${sIdx}].th`] = t("common.required");
                    if (!sub.en) newErrors[`gradAttribute.items[${idx}].subItems[${sIdx}].en`] = t("common.required");
                });
            });
        }

        // Suitable For Validation
        if (formData.suitableFor?.items) {
            formData.suitableFor.items.forEach((item, idx) => {
                if (!item.title?.th) newErrors[`suitableFor.items[${idx}].title.th`] = t("common.required");
                if (!item.title?.en) newErrors[`suitableFor.items[${idx}].title.en`] = t("common.required");
                item.subItems?.forEach((sub, sIdx) => {
                    if (!sub.th) newErrors[`suitableFor.items[${idx}].subItems[${sIdx}].th`] = t("common.required");
                    if (!sub.en) newErrors[`suitableFor.items[${idx}].subItems[${sIdx}].en`] = t("common.required");
                });
            });
        }

        // Documents Validation
        if (formData.documents) {
            formData.documents.forEach((doc, idx) => {
                if (!doc.name.th) newErrors[`documents[${idx}].name.th`] = t("common.required");
                if (!doc.name.en) newErrors[`documents[${idx}].name.en`] = t("common.required");
                if (!doc.url) newErrors[`documents[${idx}].url`] = t("common.required");
            });
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleClearError = (path: string) => {
        if (errors[path]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[path];
                return newErrors;
            });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
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

        setIsDirty(false);
        onSubmit(formData as ProgramDetailData);
    };

    // --- Dynamic List Handlers ---



    return (
        <BilingualFieldProvider
            formData={formData}
            onChange={handleChange}
            onTranslate={handleTranslate}
            isPathTranslating={isPathTranslating}
            t={t}
        >
            <form onSubmit={handleSubmit} className="space-y-8 bg-white dark:bg-slate-900 p-4 md:p-8 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800">

                {/* 1. Program Information */}
                <section className="mb-12">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100">
                            {t("programDetails.curriculumInfo")}
                        </h3>
                        {generalData && (
                            <button
                                type="button"
                                onClick={syncFromGeneral}
                                className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-all border border-indigo-100 dark:border-indigo-800"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" /><path d="M16 16h5v5" /></svg>
                                {t("programDetails.syncFromGeneral")}
                            </button>
                        )}
                    </div>
                    <div className="space-y-6 px-0 md:px-2">
                        <BilingualField
                            label={t("programDetails.programName")}
                            path={['name']}
                            required
                            error={{ th: errors['name.th'], en: errors['name.en'] }}
                            onFocus={(lang) => handleClearError(`name.${lang}`)}
                        />
                        <BilingualField
                            label={t("programDetails.degreeFull")}
                            path={['degree', 'full']}
                            required
                            error={{ th: errors['degree.full.th'], en: errors['degree.full.en'] }}
                            onFocus={(lang) => handleClearError(`degree.full.${lang}`)}
                        />
                        <BilingualField
                            label={t("programDetails.degreeShort")}
                            path={['degree', 'short']}
                            required
                            error={{ th: errors['degree.short.th'], en: errors['degree.short.en'] }}
                            onFocus={(lang) => handleClearError(`degree.short.${lang}`)}
                        />
                    </div>
                </section>

                {/* 1.1 Program Format */}
                <section className="mb-12">
                    <h3 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100 mb-6">
                        {t("programDetails.programFormat")}
                    </h3>
                    <div className="space-y-6 px-0 md:px-2">
                        <BilingualField
                            label={t("programDetails.sectionTitle")}
                            path={['programFormat', 'title']}
                            required
                            error={{ th: errors['programFormat.title.th'], en: errors['programFormat.title.en'] }}
                            onFocus={(lang) => handleClearError(`programFormat.title.${lang}`)}
                        />

                        {/* Items List */}
                        <div className="mt-6 space-y-6">
                            {formData.programFormat?.items?.map((item, idx) => (
                                <div key={idx} className="bg-slate-50 dark:bg-slate-800/30 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-4">
                                    <div className="flex gap-4 items-start group">
                                        <span className="mt-3 text-slate-400 font-mono text-xs">#{idx + 1}</span>
                                        <div className="flex-1">
                                            <div className="flex justify-end mb-2">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const text = item.title?.th || "";
                                                        const key = `format-title-${idx}`;
                                                        translate(key, text, (translated) => {
                                                            const newItems = [...(formData.programFormat?.items || [])];
                                                            newItems[idx] = { ...newItems[idx], title: { ...newItems[idx].title, en: translated } };
                                                            setFormData(prev => ({ ...prev, programFormat: { ...prev.programFormat!, items: newItems } }));
                                                        });
                                                    }}
                                                    disabled={isTranslating[`format-title-${idx}`] || !item.title?.th}
                                                    className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 disabled:text-slate-400 dark:disabled:text-slate-600 flex items-center gap-1 transition-colors"
                                                >
                                                    {isTranslating[`format-title-${idx}`] ? (
                                                        <div className="w-3 h-3 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                                                    ) : (
                                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                                            <path d="M4 14l3-6 3 6M5 12h4" stroke="currentColor" strokeWidth="1" />
                                                            <path d="M11 8l3 6M11 11c1 0 2 0.5 2 1.5s-1 1.5-2 1.5" stroke="currentColor" strokeWidth="1" fill="none" />
                                                        </svg>
                                                    )}
                                                    {isTranslating[`format-title-${idx}`] ? t("common.translating") : t("common.autoTranslate")}
                                                </button>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="relative">
                                                    <span className={`absolute -top-2 left-2 px-1 bg-white dark:bg-slate-800 text-[10px] font-semibold uppercase tracking-wider ${errors[`programFormat.items[${idx}].title.th`] ? "text-red-500" : "text-slate-400 dark:text-slate-500"}`}>TH</span>
                                                    <input
                                                        className={`w-full px-4 py-3 border rounded-lg text-sm outline-none focus:ring-2 transition-all bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium ${errors[`programFormat.items[${idx}].title.th`]
                                                            ? "border-red-500 focus:ring-red-500/20"
                                                            : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 focus:ring-primary-main/20 focus:border-primary-main"
                                                            }`}
                                                        value={item.title?.th || ""}
                                                        placeholder="รูปแบบหลัก (ไทย)"
                                                        onFocus={() => handleClearError(`programFormat.items[${idx}].title.th`)}
                                                        onChange={(e) => {
                                                            const newItems = [...(formData.programFormat?.items || [])];
                                                            newItems[idx] = { ...newItems[idx], title: { ...newItems[idx].title, th: e.target.value } };
                                                            setFormData(prev => ({ ...prev, programFormat: { ...prev.programFormat!, items: newItems } }));
                                                            handleClearError(`programFormat.items[${idx}].title.th`);
                                                        }}
                                                    />
                                                    {errors[`programFormat.items[${idx}].title.th`] && <p className="text-[10px] text-red-500 mt-1 ml-1">{errors[`programFormat.items[${idx}].title.th`]}</p>}
                                                </div>
                                                <div className="relative">
                                                    <span className={`absolute -top-2 left-2 px-1 bg-white dark:bg-slate-800 text-[10px] font-semibold uppercase tracking-wider ${errors[`programFormat.items[${idx}].title.en`] ? "text-red-500" : "text-slate-400 dark:text-slate-500"}`}>EN</span>
                                                    <input
                                                        className={`w-full px-4 py-3 border rounded-lg text-sm outline-none focus:ring-2 transition-all bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium ${errors[`programFormat.items[${idx}].title.en`]
                                                            ? "border-red-500 focus:ring-red-500/20"
                                                            : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 focus:ring-primary-main/20 focus:border-primary-main"
                                                            }`}
                                                        value={item.title?.en || ""}
                                                        placeholder="Main Format (EN)"
                                                        onFocus={() => handleClearError(`programFormat.items[${idx}].title.en`)}
                                                        onChange={(e) => {
                                                            const newItems = [...(formData.programFormat?.items || [])];
                                                            newItems[idx] = { ...newItems[idx], title: { ...newItems[idx].title, en: e.target.value } };
                                                            setFormData(prev => ({ ...prev, programFormat: { ...prev.programFormat!, items: newItems } }));
                                                            handleClearError(`programFormat.items[${idx}].title.en`);
                                                        }}
                                                    />
                                                    {errors[`programFormat.items[${idx}].title.en`] && <p className="text-[10px] text-red-500 mt-1 ml-1">{errors[`programFormat.items[${idx}].title.en`]}</p>}
                                                </div>
                                            </div>
                                        </div>
                                        <button type="button" className="text-slate-400 hover:text-red-500 p-2"
                                            onClick={() => {
                                                const newItems = [...(formData.programFormat?.items || [])];
                                                newItems.splice(idx, 1);
                                                setFormData(prev => ({ ...prev, programFormat: { ...prev.programFormat!, items: newItems } }));
                                            }}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
                                        </button>
                                    </div>

                                    {/* Sub Items */}
                                    <div className="pl-8 md:pl-12 space-y-3 border-l-2 border-slate-200 dark:border-slate-700 ml-5 md:ml-6">
                                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sub Items</h4>
                                        {item.subItems?.map((sub, sIdx) => (
                                            <div key={sIdx} className="flex gap-4 items-start group">
                                                <div className="flex-1">
                                                    <div className="flex justify-end mb-1">
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const text = sub.th;
                                                                const key = `format-${idx}-sub-${sIdx}`;
                                                                translate(key, text, (translated) => {
                                                                    const newItems = [...(formData.programFormat?.items || [])];
                                                                    const newSubItems = [...(newItems[idx].subItems || [])];
                                                                    newSubItems[sIdx] = { ...newSubItems[sIdx], en: translated };
                                                                    newItems[idx] = { ...newItems[idx], subItems: newSubItems };
                                                                    setFormData(prev => ({ ...prev, programFormat: { ...prev.programFormat!, items: newItems } }));
                                                                });
                                                            }}
                                                            disabled={isTranslating[`format-${idx}-sub-${sIdx}`] || !sub.th}
                                                            className="text-[10px] font-semibold text-indigo-500 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 disabled:text-slate-400 dark:disabled:text-slate-600 flex items-center gap-1 transition-colors"
                                                        >
                                                            {isTranslating[`format-${idx}-sub-${sIdx}`] ? (
                                                                <div className="w-3 h-3 border-[1.5px] border-indigo-500 border-t-transparent rounded-full animate-spin" />
                                                            ) : (
                                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                                                                    <path d="M4 14l3-6 3 6M5 12h4" stroke="currentColor" strokeWidth="1" />
                                                                    <path d="M11 8l3 6M11 11c1 0 2 0.5 2 1.5s-1 1.5-2 1.5" stroke="currentColor" strokeWidth="1" fill="none" />
                                                                </svg>
                                                            )}
                                                            {isTranslating[`format-${idx}-sub-${sIdx}`] ? t("common.translating") : "Auto"}
                                                        </button>
                                                    </div>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div>
                                                            <input
                                                                className={`w-full px-3 py-2 border rounded text-xs outline-none focus:ring-2 transition-all bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 ${errors[`programFormat.items[${idx}].subItems[${sIdx}].th`]
                                                                    ? "border-red-500 focus:ring-red-500/20"
                                                                    : "border-slate-100 dark:border-slate-700 focus:border-primary-main/50"
                                                                    }`}
                                                                value={sub.th}
                                                                placeholder="หัวข้อย่อย (ไทย)"
                                                                onFocus={() => handleClearError(`programFormat.items[${idx}].subItems[${sIdx}].th`)}
                                                                onChange={(e) => {
                                                                    const newItems = [...(formData.programFormat?.items || [])];
                                                                    const newSubItems = [...(newItems[idx].subItems || [])];
                                                                    newSubItems[sIdx] = { ...newSubItems[sIdx], th: e.target.value };
                                                                    newItems[idx] = { ...newItems[idx], subItems: newSubItems };
                                                                    setFormData(prev => ({ ...prev, programFormat: { ...prev.programFormat!, items: newItems } }));
                                                                    handleClearError(`programFormat.items[${idx}].subItems[${sIdx}].th`);
                                                                }}
                                                            />
                                                            {errors[`programFormat.items[${idx}].subItems[${sIdx}].th`] && <p className="text-[9px] text-red-500 mt-0.5">{errors[`programFormat.items[${idx}].subItems[${sIdx}].th`]}</p>}
                                                        </div>
                                                        <div>
                                                            <input
                                                                className={`w-full px-3 py-2 border rounded text-xs outline-none focus:ring-2 transition-all bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 ${errors[`programFormat.items[${idx}].subItems[${sIdx}].en`]
                                                                    ? "border-red-500 focus:ring-red-500/20"
                                                                    : "border-slate-100 dark:border-slate-700 focus:border-primary-main/50"
                                                                    }`}
                                                                value={sub.en}
                                                                placeholder="Sub-item (EN)"
                                                                onFocus={() => handleClearError(`programFormat.items[${idx}].subItems[${sIdx}].en`)}
                                                                onChange={(e) => {
                                                                    const newItems = [...(formData.programFormat?.items || [])];
                                                                    const newSubItems = [...(newItems[idx].subItems || [])];
                                                                    newSubItems[sIdx] = { ...newSubItems[sIdx], en: e.target.value };
                                                                    newItems[idx] = { ...newItems[idx], subItems: newSubItems };
                                                                    setFormData(prev => ({ ...prev, programFormat: { ...prev.programFormat!, items: newItems } }));
                                                                    handleClearError(`programFormat.items[${idx}].subItems[${sIdx}].en`);
                                                                }}
                                                            />
                                                            {errors[`programFormat.items[${idx}].subItems[${sIdx}].en`] && <p className="text-[9px] text-red-500 mt-0.5">{errors[`programFormat.items[${idx}].subItems[${sIdx}].en`]}</p>}
                                                        </div>
                                                    </div>
                                                </div>
                                                <button type="button" className="text-slate-300 hover:text-red-400 p-1.5"
                                                    onClick={() => {
                                                        const newItems = [...(formData.programFormat?.items || [])];
                                                        const newSubItems = [...(newItems[idx].subItems || [])];
                                                        newSubItems.splice(sIdx, 1);
                                                        newItems[idx] = { ...newItems[idx], subItems: newSubItems };
                                                        setFormData(prev => ({ ...prev, programFormat: { ...prev.programFormat!, items: newItems } }));
                                                    }}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                                                </button>
                                            </div>
                                        ))}
                                        <button
                                            type="button"
                                            className="text-[11px] font-bold text-primary-main hover:text-primary-dark flex items-center gap-1.5 px-2 py-1.5 rounded hover:bg-primary-main/5 transition-colors"
                                            onClick={() => {
                                                const newItems = [...(formData.programFormat?.items || [])];
                                                const newSubItems = [...(newItems[idx].subItems || []), { th: "", en: "" }];
                                                newItems[idx] = { ...newItems[idx], subItems: newSubItems };
                                                setFormData(prev => ({ ...prev, programFormat: { ...prev.programFormat!, items: newItems } }));
                                            }}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
                                            {t("programDetails.addSubItem")}
                                        </button>
                                    </div>
                                </div>
                            ))}
                            <button type="button" className="w-full py-3 mt-4 border border-dashed border-primary-main/30 rounded-lg text-primary-main hover:bg-primary-main/5 transition-all text-sm font-medium flex items-center justify-center gap-2"
                                onClick={() => {
                                    setFormData(prev => ({
                                        ...prev,
                                        programFormat: {
                                            ...prev.programFormat!,
                                            items: [...(prev.programFormat?.items || []), { title: { th: "", en: "" }, subItems: [] }]
                                        }
                                    }));
                                }}
                            >
                                + {t("programDetails.addItem")}
                            </button>
                        </div>
                    </div>
                </section>

                {/* 2. Graduate Attributes / Admission Qualifications */}
                <section className="mb-12">
                    <h3 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6">
                        {t("programDetails.gradAttributes")}
                    </h3>
                    <div className="space-y-6 px-0 md:px-2">
                        <BilingualField
                            label={t("programDetails.sectionTitle")}
                            path={['gradAttribute', 'title']}
                            required
                            error={{ th: errors['gradAttribute.title.th'], en: errors['gradAttribute.title.en'] }}
                            onFocus={(lang) => handleClearError(`gradAttribute.title.${lang}`)}
                        />

                        {/* Items List */}
                        <div className="mt-6 space-y-6">
                            {formData.gradAttribute?.items?.map((item, idx) => (
                                <div key={idx} className="bg-slate-50 dark:bg-slate-800/30 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-4">
                                    <div className="flex gap-4 items-start group">
                                        <span className="mt-3 text-slate-400 font-mono text-xs">#{idx + 1}</span>
                                        <div className="flex-1">
                                            <div className="flex justify-end mb-2">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const text = item.title?.th || "";
                                                        const key = `grad-title-${idx}`;
                                                        translate(key, text, (translated) => {
                                                            const newItems = [...(formData.gradAttribute?.items || [])];
                                                            newItems[idx] = { ...newItems[idx], title: { ...newItems[idx].title, en: translated } };
                                                            setFormData(prev => ({ ...prev, gradAttribute: { ...prev.gradAttribute!, items: newItems } }));
                                                        });
                                                    }}
                                                    disabled={isTranslating[`grad-title-${idx}`] || !item.title?.th}
                                                    className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 disabled:text-slate-400 dark:disabled:text-slate-600 flex items-center gap-1 transition-colors"
                                                >
                                                    {isTranslating[`grad-title-${idx}`] ? (
                                                        <div className="w-3 h-3 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                                                    ) : (
                                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                                            <path d="M4 14l3-6 3 6M5 12h4" stroke="currentColor" strokeWidth="1" />
                                                            <path d="M11 8l3 6M11 11c1 0 2 0.5 2 1.5s-1 1.5-2 1.5" stroke="currentColor" strokeWidth="1" fill="none" />
                                                        </svg>
                                                    )}
                                                    {isTranslating[`grad-title-${idx}`] ? t("common.translating") : t("common.autoTranslate")}
                                                </button>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="relative">
                                                    <span className={`absolute -top-2 left-2 px-1 bg-white dark:bg-slate-800 text-[10px] font-semibold uppercase tracking-wider ${errors[`gradAttribute.items[${idx}].title.th`] ? "text-red-500" : "text-slate-400 dark:text-slate-500"}`}>TH</span>
                                                    <input
                                                        className={`w-full px-4 py-3 border rounded-lg text-sm outline-none focus:ring-2 transition-all bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium ${errors[`gradAttribute.items[${idx}].title.th`]
                                                            ? "border-red-500 focus:ring-red-500/20"
                                                            : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 focus:ring-primary-main/20 focus:border-primary-main"
                                                            }`}
                                                        value={item.title?.th || ""}
                                                        placeholder="หัวข้อหลัก (ไทย)"
                                                        onFocus={() => handleClearError(`gradAttribute.items[${idx}].title.th`)}
                                                        onChange={(e) => {
                                                            const newItems = [...(formData.gradAttribute?.items || [])];
                                                            newItems[idx] = { ...newItems[idx], title: { ...newItems[idx].title, th: e.target.value } };
                                                            setFormData(prev => ({ ...prev, gradAttribute: { ...prev.gradAttribute!, items: newItems } }));
                                                            handleClearError(`gradAttribute.items[${idx}].title.th`);
                                                        }}
                                                    />
                                                    {errors[`gradAttribute.items[${idx}].title.th`] && <p className="text-[10px] text-red-500 mt-1 ml-1">{errors[`gradAttribute.items[${idx}].title.th`]}</p>}
                                                </div>
                                                <div className="relative">
                                                    <span className={`absolute -top-2 left-2 px-1 bg-white dark:bg-slate-800 text-[10px] font-semibold uppercase tracking-wider ${errors[`gradAttribute.items[${idx}].title.en`] ? "text-red-500" : "text-slate-400 dark:text-slate-500"}`}>EN</span>
                                                    <input
                                                        className={`w-full px-4 py-3 border rounded-lg text-sm outline-none focus:ring-2 transition-all bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium ${errors[`gradAttribute.items[${idx}].title.en`]
                                                            ? "border-red-500 focus:ring-red-500/20"
                                                            : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 focus:ring-primary-main/20 focus:border-primary-main"
                                                            }`}
                                                        value={item.title?.en || ""}
                                                        placeholder="Main Title (EN)"
                                                        onFocus={() => handleClearError(`gradAttribute.items[${idx}].title.en`)}
                                                        onChange={(e) => {
                                                            const newItems = [...(formData.gradAttribute?.items || [])];
                                                            newItems[idx] = { ...newItems[idx], title: { ...newItems[idx].title, en: e.target.value } };
                                                            setFormData(prev => ({ ...prev, gradAttribute: { ...prev.gradAttribute!, items: newItems } }));
                                                            handleClearError(`gradAttribute.items[${idx}].title.en`);
                                                        }}
                                                    />
                                                    {errors[`gradAttribute.items[${idx}].title.en`] && <p className="text-[10px] text-red-500 mt-1 ml-1">{errors[`gradAttribute.items[${idx}].title.en`]}</p>}
                                                </div>
                                            </div>
                                        </div>
                                        <button type="button" className="text-slate-400 hover:text-red-500 p-2"
                                            onClick={() => {
                                                const newItems = [...(formData.gradAttribute?.items || [])];
                                                newItems.splice(idx, 1);
                                                setFormData(prev => ({ ...prev, gradAttribute: { ...prev.gradAttribute!, items: newItems } }));
                                            }}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
                                        </button>
                                    </div>

                                    {/* Sub Items */}
                                    <div className="pl-8 md:pl-12 space-y-3 border-l-2 border-slate-200 dark:border-slate-700 ml-5 md:ml-6">
                                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sub Items</h4>
                                        {item.subItems?.map((sub, sIdx) => (
                                            <div key={sIdx} className="flex gap-4 items-start group">
                                                <div className="flex-1">
                                                    <div className="flex justify-end mb-1">
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const text = sub.th;
                                                                const key = `grad-${idx}-sub-${sIdx}`;
                                                                translate(key, text, (translated) => {
                                                                    const newItems = [...(formData.gradAttribute?.items || [])];
                                                                    const newSubItems = [...(newItems[idx].subItems || [])];
                                                                    newSubItems[sIdx] = { ...newSubItems[sIdx], en: translated };
                                                                    newItems[idx] = { ...newItems[idx], subItems: newSubItems };
                                                                    setFormData(prev => ({ ...prev, gradAttribute: { ...prev.gradAttribute!, items: newItems } }));
                                                                });
                                                            }}
                                                            disabled={isTranslating[`grad-${idx}-sub-${sIdx}`] || !sub.th}
                                                            className="text-[10px] font-semibold text-indigo-500 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 disabled:text-slate-400 dark:disabled:text-slate-600 flex items-center gap-1 transition-colors"
                                                        >
                                                            {isTranslating[`grad-${idx}-sub-${sIdx}`] ? (
                                                                <div className="w-3 h-3 border-[1.5px] border-indigo-500 border-t-transparent rounded-full animate-spin" />
                                                            ) : (
                                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                                                                    <path d="M4 14l3-6 3 6M5 12h4" stroke="currentColor" strokeWidth="1" />
                                                                    <path d="M11 8l3 6M11 11c1 0 2 0.5 2 1.5s-1 1.5-2 1.5" stroke="currentColor" strokeWidth="1" fill="none" />
                                                                </svg>
                                                            )}
                                                            {isTranslating[`grad-${idx}-sub-${sIdx}`] ? t("common.translating") : "Auto"}
                                                        </button>
                                                    </div>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div>
                                                            <input
                                                                className={`w-full px-3 py-2 border rounded text-xs outline-none focus:ring-2 transition-all bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 ${errors[`gradAttribute.items[${idx}].subItems[${sIdx}].th`]
                                                                    ? "border-red-500 focus:ring-red-500/20"
                                                                    : "border-slate-100 dark:border-slate-700 focus:border-primary-main/50"
                                                                    }`}
                                                                value={sub.th}
                                                                placeholder="หัวข้อย่อย (ไทย)"
                                                                onFocus={() => handleClearError(`gradAttribute.items[${idx}].subItems[${sIdx}].th`)}
                                                                onChange={(e) => {
                                                                    const newItems = [...(formData.gradAttribute?.items || [])];
                                                                    const newSubItems = [...(newItems[idx].subItems || [])];
                                                                    newSubItems[sIdx] = { ...newSubItems[sIdx], th: e.target.value };
                                                                    newItems[idx] = { ...newItems[idx], subItems: newSubItems };
                                                                    setFormData(prev => ({ ...prev, gradAttribute: { ...prev.gradAttribute!, items: newItems } }));
                                                                    handleClearError(`gradAttribute.items[${idx}].subItems[${sIdx}].th`);
                                                                }}
                                                            />
                                                            {errors[`gradAttribute.items[${idx}].subItems[${sIdx}].th`] && <p className="text-[9px] text-red-500 mt-0.5">{errors[`gradAttribute.items[${idx}].subItems[${sIdx}].th`]}</p>}
                                                        </div>
                                                        <div>
                                                            <input
                                                                className={`w-full px-3 py-2 border rounded text-xs outline-none focus:ring-2 transition-all bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 ${errors[`gradAttribute.items[${idx}].subItems[${sIdx}].en`]
                                                                    ? "border-red-500 focus:ring-red-500/20"
                                                                    : "border-slate-100 dark:border-slate-700 focus:border-primary-main/50"
                                                                    }`}
                                                                value={sub.en}
                                                                placeholder="Sub-item (EN)"
                                                                onFocus={() => handleClearError(`gradAttribute.items[${idx}].subItems[${sIdx}].en`)}
                                                                onChange={(e) => {
                                                                    const newItems = [...(formData.gradAttribute?.items || [])];
                                                                    const newSubItems = [...(newItems[idx].subItems || [])];
                                                                    newSubItems[sIdx] = { ...newSubItems[sIdx], en: e.target.value };
                                                                    newItems[idx] = { ...newItems[idx], subItems: newSubItems };
                                                                    setFormData(prev => ({ ...prev, gradAttribute: { ...prev.gradAttribute!, items: newItems } }));
                                                                    handleClearError(`gradAttribute.items[${idx}].subItems[${sIdx}].en`);
                                                                }}
                                                            />
                                                            {errors[`gradAttribute.items[${idx}].subItems[${sIdx}].en`] && <p className="text-[9px] text-red-500 mt-0.5">{errors[`gradAttribute.items[${idx}].subItems[${sIdx}].en`]}</p>}
                                                        </div>
                                                    </div>
                                                </div>
                                                <button type="button" className="text-slate-300 hover:text-red-400 p-1.5"
                                                    onClick={() => {
                                                        const newItems = [...(formData.gradAttribute?.items || [])];
                                                        const newSubItems = [...(newItems[idx].subItems || [])];
                                                        newSubItems.splice(sIdx, 1);
                                                        newItems[idx] = { ...newItems[idx], subItems: newSubItems };
                                                        setFormData(prev => ({ ...prev, gradAttribute: { ...prev.gradAttribute!, items: newItems } }));
                                                    }}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                                                </button>
                                            </div>
                                        ))}
                                        <button
                                            type="button"
                                            className="text-[11px] font-bold text-primary-main hover:text-primary-dark flex items-center gap-1.5 px-2 py-1.5 rounded hover:bg-primary-main/5 transition-colors"
                                            onClick={() => {
                                                const newItems = [...(formData.gradAttribute?.items || [])];
                                                const newSubItems = [...(newItems[idx].subItems || []), { th: "", en: "" }];
                                                newItems[idx] = { ...newItems[idx], subItems: newSubItems };
                                                setFormData(prev => ({ ...prev, gradAttribute: { ...prev.gradAttribute!, items: newItems } }));
                                            }}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
                                            {t("programDetails.addSubItem")}
                                        </button>
                                    </div>
                                </div>
                            ))}
                            <button type="button" className="w-full py-3 mt-4 border border-dashed border-primary-main/30 rounded-lg text-primary-main hover:bg-primary-main/5 transition-all text-sm font-medium flex items-center justify-center gap-2"
                                onClick={() => {
                                    setFormData(prev => ({
                                        ...prev,
                                        gradAttribute: {
                                            ...prev.gradAttribute!,
                                            items: [...(prev.gradAttribute?.items || []), { title: { th: "", en: "" }, subItems: [] }]
                                        }
                                    }));
                                }}
                            >
                                + {t("programDetails.addItem")}
                            </button>
                        </div>
                    </div>
                </section>

                {/* 6. Career Opportunities (suitableFor) */}
                <section className="mb-12">
                    <h3 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6">
                        {t("programDetails.suitableFor")}
                    </h3>
                    <div className="space-y-6 px-0 md:px-2">
                        <BilingualField
                            label={t("programDetails.sectionTitle")}
                            path={['suitableFor', 'title']}
                            required
                            error={{ th: errors['suitableFor.title.th'], en: errors['suitableFor.title.en'] }}
                            onFocus={(lang) => handleClearError(`suitableFor.title.${lang}`)}
                        />

                        {/* Items List */}
                        <div className="mt-6 space-y-6">
                            {formData.suitableFor?.items?.map((item, idx) => (
                                <div key={idx} className="bg-slate-50 dark:bg-slate-800/30 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-4">
                                    <div className="flex gap-4 items-start group">
                                        <span className="mt-3 text-slate-400 font-mono text-xs">#{idx + 1}</span>
                                        <div className="flex-1">
                                            <div className="flex justify-end mb-2">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const text = item.title?.th || "";
                                                        const key = `suitable-title-${idx}`;
                                                        translate(key, text, (translated) => {
                                                            const newItems = [...(formData.suitableFor?.items || [])];
                                                            newItems[idx] = { ...newItems[idx], title: { ...newItems[idx].title, en: translated } };
                                                            setFormData(prev => ({ ...prev, suitableFor: { ...prev.suitableFor!, items: newItems } }));
                                                        });
                                                    }}
                                                    disabled={isTranslating[`suitable-title-${idx}`] || !item.title?.th}
                                                    className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 disabled:text-slate-400 dark:disabled:text-slate-600 flex items-center gap-1 transition-colors"
                                                >
                                                    {isTranslating[`suitable-title-${idx}`] ? (
                                                        <div className="w-3 h-3 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                                                    ) : (
                                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                                            <path d="M4 14l3-6 3 6M5 12h4" stroke="currentColor" strokeWidth="1" />
                                                            <path d="M11 8l3 6M11 11c1 0 2 0.5 2 1.5s-1 1.5-2 1.5" stroke="currentColor" strokeWidth="1" fill="none" />
                                                        </svg>
                                                    )}
                                                    {isTranslating[`suitable-title-${idx}`] ? t("common.translating") : t("common.autoTranslate")}
                                                </button>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="relative">
                                                    <span className={`absolute -top-2 left-2 px-1 bg-white dark:bg-slate-800 text-[10px] font-semibold uppercase tracking-wider ${errors[`suitableFor.items[${idx}].title.th`] ? "text-red-500" : "text-slate-400 dark:text-slate-500"}`}>TH</span>
                                                    <input
                                                        className={`w-full px-4 py-3 border rounded-lg text-sm outline-none focus:ring-2 transition-all bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium ${errors[`suitableFor.items[${idx}].title.th`]
                                                            ? "border-red-500 focus:ring-red-500/20"
                                                            : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 focus:ring-primary-main/20 focus:border-primary-main"
                                                            }`}
                                                        value={item.title?.th || ""}
                                                        placeholder="กลุ่มอาชีพหลัก (ไทย)"
                                                        onFocus={() => handleClearError(`suitableFor.items[${idx}].title.th`)}
                                                        onChange={(e) => {
                                                            const newItems = [...(formData.suitableFor?.items || [])];
                                                            newItems[idx] = { ...newItems[idx], title: { ...newItems[idx].title, th: e.target.value } };
                                                            setFormData(prev => ({ ...prev, suitableFor: { ...prev.suitableFor!, items: newItems } }));
                                                            handleClearError(`suitableFor.items[${idx}].title.th`);
                                                        }}
                                                    />
                                                    {errors[`suitableFor.items[${idx}].title.th`] && <p className="text-[10px] text-red-500 mt-1 ml-1">{errors[`suitableFor.items[${idx}].title.th`]}</p>}
                                                </div>
                                                <div className="relative">
                                                    <span className={`absolute -top-2 left-2 px-1 bg-white dark:bg-slate-800 text-[10px] font-semibold uppercase tracking-wider ${errors[`suitableFor.items[${idx}].title.en`] ? "text-red-500" : "text-slate-400 dark:text-slate-500"}`}>EN</span>
                                                    <input
                                                        className={`w-full px-4 py-3 border rounded-lg text-sm outline-none focus:ring-2 transition-all bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium ${errors[`suitableFor.items[${idx}].title.en`]
                                                            ? "border-red-500 focus:ring-red-500/20"
                                                            : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 focus:ring-primary-main/20 focus:border-primary-main"
                                                            }`}
                                                        value={item.title?.en || ""}
                                                        placeholder="Career Group (EN)"
                                                        onFocus={() => handleClearError(`suitableFor.items[${idx}].title.en`)}
                                                        onChange={(e) => {
                                                            const newItems = [...(formData.suitableFor?.items || [])];
                                                            newItems[idx] = { ...newItems[idx], title: { ...newItems[idx].title, en: e.target.value } };
                                                            setFormData(prev => ({ ...prev, suitableFor: { ...prev.suitableFor!, items: newItems } }));
                                                            handleClearError(`suitableFor.items[${idx}].title.en`);
                                                        }}
                                                    />
                                                    {errors[`suitableFor.items[${idx}].title.en`] && <p className="text-[10px] text-red-500 mt-1 ml-1">{errors[`suitableFor.items[${idx}].title.en`]}</p>}
                                                </div>
                                            </div>
                                        </div>
                                        <button type="button" className="text-slate-400 hover:text-red-500 p-2"
                                            onClick={() => {
                                                const newItems = [...(formData.suitableFor?.items || [])];
                                                newItems.splice(idx, 1);
                                                setFormData(prev => ({ ...prev, suitableFor: { ...prev.suitableFor!, items: newItems } }));
                                            }}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
                                        </button>
                                    </div>

                                    {/* Sub Items (Specific Careers) */}
                                    <div className="pl-8 md:pl-12 space-y-3 border-l-2 border-slate-200 dark:border-slate-700 ml-5 md:ml-6">
                                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Career Details</h4>
                                        {item.subItems?.map((sub, sIdx) => (
                                            <div key={sIdx} className="flex gap-4 items-start group">
                                                <div className="flex-1">
                                                    <div className="flex justify-end mb-1">
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const text = sub.th;
                                                                const key = `suitable-${idx}-sub-${sIdx}`;
                                                                translate(key, text, (translated) => {
                                                                    const newItems = [...(formData.suitableFor?.items || [])];
                                                                    const newSubItems = [...(newItems[idx].subItems || [])];
                                                                    newSubItems[sIdx] = { ...newSubItems[sIdx], en: translated };
                                                                    newItems[idx] = { ...newItems[idx], subItems: newSubItems };
                                                                    setFormData(prev => ({ ...prev, suitableFor: { ...prev.suitableFor!, items: newItems } }));
                                                                });
                                                            }}
                                                            disabled={isTranslating[`suitable-${idx}-sub-${sIdx}`] || !sub.th}
                                                            className="text-[10px] font-semibold text-indigo-500 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 disabled:text-slate-400 dark:disabled:text-slate-600 flex items-center gap-1 transition-colors"
                                                        >
                                                            {isTranslating[`suitable-${idx}-sub-${sIdx}`] ? (
                                                                <div className="w-3 h-3 border-[1.5px] border-indigo-500 border-t-transparent rounded-full animate-spin" />
                                                            ) : (
                                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                                                                    <path d="M4 14l3-6 3 6M5 12h4" stroke="currentColor" strokeWidth="1" />
                                                                    <path d="M11 8l3 6M11 11c1 0 2 0.5 2 1.5s-1 1.5-2 1.5" stroke="currentColor" strokeWidth="1" fill="none" />
                                                                </svg>
                                                            )}
                                                            {isTranslating[`suitable-${idx}-sub-${sIdx}`] ? t("common.translating") : "Auto"}
                                                        </button>
                                                    </div>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div>
                                                            <input
                                                                className={`w-full px-3 py-2 border rounded text-xs outline-none focus:ring-2 transition-all bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 ${errors[`suitableFor.items[${idx}].subItems[${sIdx}].th`]
                                                                    ? "border-red-500 focus:ring-red-500/20"
                                                                    : "border-slate-100 dark:border-slate-700 focus:border-primary-main/50"
                                                                    }`}
                                                                value={sub.th}
                                                                placeholder="อาชีพย่อย (ไทย)"
                                                                onFocus={() => handleClearError(`suitableFor.items[${idx}].subItems[${sIdx}].th`)}
                                                                onChange={(e) => {
                                                                    const newItems = [...(formData.suitableFor?.items || [])];
                                                                    const newSubItems = [...(newItems[idx].subItems || [])];
                                                                    newSubItems[sIdx] = { ...newSubItems[sIdx], th: e.target.value };
                                                                    newItems[idx] = { ...newItems[idx], subItems: newSubItems };
                                                                    setFormData(prev => ({ ...prev, suitableFor: { ...prev.suitableFor!, items: newItems } }));
                                                                    handleClearError(`suitableFor.items[${idx}].subItems[${sIdx}].th`);
                                                                }}
                                                            />
                                                            {errors[`suitableFor.items[${idx}].subItems[${sIdx}].th`] && <p className="text-[9px] text-red-500 mt-0.5">{errors[`suitableFor.items[${idx}].subItems[${sIdx}].th`]}</p>}
                                                        </div>
                                                        <div>
                                                            <input
                                                                className={`w-full px-3 py-2 border rounded text-xs outline-none focus:ring-2 transition-all bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 ${errors[`suitableFor.items[${idx}].subItems[${sIdx}].en`]
                                                                    ? "border-red-500 focus:ring-red-500/20"
                                                                    : "border-slate-100 dark:border-slate-700 focus:border-primary-main/50"
                                                                    }`}
                                                                value={sub.en}
                                                                placeholder="Specific Career (EN)"
                                                                onFocus={() => handleClearError(`suitableFor.items[${idx}].subItems[${sIdx}].en`)}
                                                                onChange={(e) => {
                                                                    const newItems = [...(formData.suitableFor?.items || [])];
                                                                    const newSubItems = [...(newItems[idx].subItems || [])];
                                                                    newSubItems[sIdx] = { ...newSubItems[sIdx], en: e.target.value };
                                                                    newItems[idx] = { ...newItems[idx], subItems: newSubItems };
                                                                    setFormData(prev => ({ ...prev, suitableFor: { ...prev.suitableFor!, items: newItems } }));
                                                                    handleClearError(`suitableFor.items[${idx}].subItems[${sIdx}].en`);
                                                                }}
                                                            />
                                                            {errors[`suitableFor.items[${idx}].subItems[${sIdx}].en`] && <p className="text-[9px] text-red-500 mt-0.5">{errors[`suitableFor.items[${idx}].subItems[${sIdx}].en`]}</p>}
                                                        </div>
                                                    </div>
                                                </div>
                                                <button type="button" className="text-slate-300 hover:text-red-400 p-1.5"
                                                    onClick={() => {
                                                        const newItems = [...(formData.suitableFor?.items || [])];
                                                        const newSubItems = [...(newItems[idx].subItems || [])];
                                                        newSubItems.splice(sIdx, 1);
                                                        newItems[idx] = { ...newItems[idx], subItems: newSubItems };
                                                        setFormData(prev => ({ ...prev, suitableFor: { ...prev.suitableFor!, items: newItems } }));
                                                    }}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                                                </button>
                                            </div>
                                        ))}
                                        <button
                                            type="button"
                                            className="text-[11px] font-bold text-primary-main hover:text-primary-dark flex items-center gap-1.5 px-2 py-1.5 rounded hover:bg-primary-main/5 transition-colors"
                                            onClick={() => {
                                                const newItems = [...(formData.suitableFor?.items || [])];
                                                const newSubItems = [...(newItems[idx].subItems || []), { th: "", en: "" }];
                                                newItems[idx] = { ...newItems[idx], subItems: newSubItems };
                                                setFormData(prev => ({ ...prev, suitableFor: { ...prev.suitableFor!, items: newItems } }));
                                            }}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
                                            {t("programDetails.addSubItem")}
                                        </button>
                                    </div>
                                </div>
                            ))}
                            <button type="button" className="w-full py-3 mt-4 border border-dashed border-primary-main/30 rounded-lg text-primary-main hover:bg-primary-main/5 transition-all text-sm font-medium flex items-center justify-center gap-2"
                                onClick={() => {
                                    setFormData(prev => ({
                                        ...prev,
                                        suitableFor: {
                                            ...prev.suitableFor!,
                                            items: [...(prev.suitableFor?.items || []), { title: { th: "", en: "" }, subItems: [] }]
                                        }
                                    }));
                                }}
                            >
                                + {t("programDetails.addItem")}
                            </button>
                        </div>
                    </div>
                </section>

                {/* 7. Curriculum Documents */}
                <section className="mb-12">
                    <h3 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6">
                        {t("programDetails.documents")}
                    </h3>
                    <div className="space-y-4 px-0 md:px-2">
                        {formData.documents?.map((doc, idx) => (
                            <div key={idx} className="flex gap-4 items-start pb-4 border-b border-gray-50 last:border-0 relative group">
                                <div className="flex-1 space-y-3">
                                    <div className="flex justify-end mb-2">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const text = doc.name.th;
                                                const key = `doc-${idx}`;
                                                translate(key, text, (translated) => {
                                                    const newDocs = [...(formData.documents || [])];
                                                    newDocs[idx] = { ...newDocs[idx], name: { ...newDocs[idx].name, en: translated } };
                                                    setFormData(prev => ({ ...prev, documents: newDocs }));
                                                });
                                            }}
                                            disabled={isTranslating[`doc-${idx}`] || !doc.name.th}
                                            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 disabled:text-slate-400 dark:disabled:text-slate-600 flex items-center gap-1 transition-colors"
                                        >
                                            {isTranslating[`doc-${idx}`] ? (
                                                <div className="w-3 h-3 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                                            ) : (
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                                    <path d="M4 14l3-6 3 6M5 12h4" stroke="currentColor" strokeWidth="1" />
                                                    <path d="M11 8l3 6M11 11c1 0 2 0.5 2 1.5s-1 1.5-2 1.5" stroke="currentColor" strokeWidth="1" fill="none" />
                                                </svg>
                                            )}
                                            {isTranslating[`doc-${idx}`] ? t("common.translating") : t("common.autoTranslate")}
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="relative">
                                            <span className={`absolute -top-2 left-2 px-1 bg-white dark:bg-slate-800 text-[10px] font-semibold uppercase tracking-wider ${errors[`documents[${idx}].name.th`] ? "text-red-500" : "text-slate-400 dark:text-slate-500"}`}>{t("programDetails.docNameTh")}</span>
                                            <input
                                                className={`w-full px-4 py-3 border rounded-lg text-sm outline-none focus:ring-2 transition-all bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium ${errors[`documents[${idx}].name.th`]
                                                    ? "border-red-500 focus:ring-red-500/20"
                                                    : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 focus:ring-primary-main/20 focus:border-primary-main"
                                                    }`}
                                                value={doc.name.th}
                                                onFocus={() => handleClearError(`documents[${idx}].name.th`)}
                                                onChange={(e) => {
                                                    const newDocs = [...(formData.documents || [])];
                                                    newDocs[idx] = { ...newDocs[idx], name: { ...newDocs[idx].name, th: e.target.value } };
                                                    setFormData(prev => ({ ...prev, documents: newDocs }));
                                                    handleClearError(`documents[${idx}].name.th`);
                                                }} />
                                            {errors[`documents[${idx}].name.th`] && <p className="text-[10px] text-red-500 mt-1 ml-1">{errors[`documents[${idx}].name.th`]}</p>}
                                        </div>
                                        <div className="relative">
                                            <span className={`absolute -top-2 left-2 px-1 bg-white dark:bg-slate-800 text-[10px] font-semibold uppercase tracking-wider ${errors[`documents[${idx}].name.en`] ? "text-red-500" : "text-slate-400 dark:text-slate-500"}`}>{t("programDetails.docNameEn")}</span>
                                            <input
                                                className={`w-full px-4 py-3 border rounded-lg text-sm outline-none focus:ring-2 transition-all bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium ${errors[`documents[${idx}].name.en`]
                                                    ? "border-red-500 focus:ring-red-500/20"
                                                    : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 focus:ring-primary-main/20 focus:border-primary-main"
                                                    }`}
                                                value={doc.name.en}
                                                onFocus={() => handleClearError(`documents[${idx}].name.en`)}
                                                onChange={(e) => {
                                                    const newDocs = [...(formData.documents || [])];
                                                    newDocs[idx] = { ...newDocs[idx], name: { ...newDocs[idx].name, en: e.target.value } };
                                                    setFormData(prev => ({ ...prev, documents: newDocs }));
                                                    handleClearError(`documents[${idx}].name.en`);
                                                }} />
                                            {errors[`documents[${idx}].name.en`] && <p className="text-[10px] text-red-500 mt-1 ml-1">{errors[`documents[${idx}].name.en`]}</p>}
                                        </div>
                                    </div>
                                    <div className="pl-1">
                                        <FileUpload label="" value={doc.url} accept=".pdf"
                                            folder="ced_web/programs"
                                            error={errors[`documents[${idx}].url`]}
                                            onChange={(url) => {
                                                const newDocs = [...(formData.documents || [])];
                                                newDocs[idx] = { ...newDocs[idx], url };
                                                setFormData(prev => ({ ...prev, documents: newDocs }));
                                                handleClearError(`documents[${idx}].url`);
                                            }} />
                                    </div>
                                </div>
                                <button type="button" className="text-slate-300 hover:text-red-500 pt-3"
                                    onClick={() => {
                                        const newDocs = [...(formData.documents || [])];
                                        newDocs.splice(idx, 1);
                                        setFormData(prev => ({ ...prev, documents: newDocs }));
                                    }}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                                </button>
                            </div>
                        ))}
                        <button type="button" className="w-full py-3 mt-4 border border-dashed border-primary-main/30 rounded-lg text-primary-main hover:bg-primary-main/5 transition-all text-sm font-medium flex items-center justify-center gap-2"
                            onClick={() => {
                                setFormData(prev => ({ ...prev, documents: [...(prev.documents || []), { name: { th: t("programDetails.newDocTh"), en: t("programDetails.newDocEn") }, url: "" }] }));
                            }}
                        >
                            + {t("programDetails.addDocument")}
                        </button>
                    </div>
                </section>

                {/* 8. Curriculum Structure */}
                <section className="mb-12">
                    <h3 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6">
                        {t("programDetails.curriculumStructure")}
                    </h3>
                    <div className="px-0 md:px-2">
                        <CurriculumEditor
                            value={formData.curriculum || []}
                            onChange={(newVal) => setFormData(prev => ({ ...prev, curriculum: newVal }))}
                            t={t}
                            errors={errors}
                            onClearError={handleClearError}
                        />
                    </div>
                </section>

                {/* 9. Language */}
                <section className="mb-12">
                    <h3 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6">
                        {t("programDetails.language")}
                    </h3>
                    <div className="px-0 md:px-2">
                        <BilingualField
                            label={t("programDetails.description")}
                            path={['language']}
                            multiline
                            required
                            error={{ th: errors['language.th'], en: errors['language.en'] }}
                            onFocus={(lang) => handleClearError(`language.${lang}`)}
                        />
                    </div>
                </section>

                {/* 10. Admission */}
                <section className="mb-12">
                    <h3 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6">
                        {t("programDetails.admission")}
                    </h3>
                    <div className="px-0 md:px-2">
                        <BilingualField
                            label={t("programDetails.description")}
                            path={['admission']}
                            multiline
                            required
                            error={{ th: errors['admission.th'], en: errors['admission.en'] }}
                            onFocus={(lang) => handleClearError(`admission.${lang}`)}
                        />
                    </div>
                </section>

                {/* Submit */}
                <div className="flex justify-end pt-6 border-t mt-6 sticky bottom-0 bg-white/90 backdrop-blur pb-4">
                    <SaveButton
                        isLoading={isLoading}
                        label={t("programDetails.save")}
                        loadingLabel={t("common.saving")}
                    />
                </div>


            </form>
        </BilingualFieldProvider>
    );
}
