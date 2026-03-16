"use client";

import { useState } from "react";
import type { Personnel } from "@/types/personnel";
import FileUpload from "@/components/admin/FileUpload";
import { FormInput, FormSelect } from "@/components/admin/common/FormInputs";
import SaveButton from '../common/SaveButton';
import { useAutoTranslate } from "@/hooks/useAutoTranslate";
import { useUnsavedChanges } from "@/contexts/UnsavedChangesContext";

type PersonnelFormProps = {
    initialData?: Partial<Personnel>;
    onSubmit: (data: Personnel) => void;
    isLoading?: boolean;
};

import { EducationEditor } from "./EducationEditor";
import { CourseEditor } from "./CourseEditor";
import { CustomLinkEditor } from "./CustomLinkEditor";
import { POSITIONS, ACADEMIC_TITLES } from "./constants";

import { useTranslations } from "next-intl";
import Swal from "sweetalert2";


export default function PersonnelForm({ initialData, onSubmit, isLoading = false }: PersonnelFormProps) {
    const t = useTranslations("Admin.forms");
    const [formData, setFormData] = useState<Partial<Personnel>>({
        name: { th: "", en: "" },
        academicTitle: { th: "", en: "" },
        position: { th: "", en: "" },
        email: "",
        imageSrc: "",
        education: [],
        courses: [],
        room: "",
        phone: "",
        scopusLink: "",
        researchProfileLink: "",

        googleScholarLink: "",
        customLinks: [],
        ...initialData,
    });

    const { setIsDirty } = useUnsavedChanges();
    const { translate, isTranslating } = useAutoTranslate();

    const handleTranslate = (field: 'name' | 'position') => {
        translate(field, formData[field]?.th || "", (translated) => {
            handleLocalizedChange(field, "en", translated);
        });
    };

    const handleEduTranslate = (idx: number, field: 'major' | 'university') => {
        const edu = formData.education?.[idx];
        if (!edu) return;
        const text = edu[field].th;
        const key = `edu-${idx}-${field}`;
        translate(key, text, (translated) => {
            const next = [...(formData.education || [])];
            next[idx] = { ...next[idx], [field]: { ...next[idx][field], en: translated } };
            setFormData(prev => ({ ...prev, education: next }));
        });
    };

    const handleCourseTranslate = (idx: number) => {
        const course = formData.courses?.[idx];
        if (!course) return;
        const text = course.th;
        const key = `course-${idx}`;
        translate(key, text, (translated) => {
            const next = [...(formData.courses || [])];
            next[idx] = { ...next[idx], en: translated };
            setFormData(prev => ({ ...prev, courses: next }));
        });
    };

    const getTranslatingKey = () => {
        const active = Object.entries(isTranslating).find(([, val]) => val);
        return active ? active[0] : null;
    };


    const [errors, setErrors] = useState<Record<string, string>>({});

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
        setIsDirty(true);
        setFormData((prev) => ({ ...prev, [name]: value }));

        handleClearError(name);
    };

    const handleLocalizedChange = (field: 'name' | 'position', lang: 'th' | 'en', value: string) => {
        setIsDirty(true);
        setFormData(prev => ({
            ...prev,
            [field]: {
                ...(prev[field] || { th: "", en: "" }),
                [lang]: value
            }
        }));

        const errorKey = field === 'name' ? (lang === 'th' ? 'nameTh' : 'nameEn') : (lang === 'th' ? 'posTh' : 'posEn');
        handleClearError(errorKey);
    };

    // Calculate initial position type based on current value matching presets
    const [positionType, setPositionType] = useState(() => {
        const currentTh = initialData?.position?.th || "";
        const match = POSITIONS.find(p => p.th === currentTh);
        return match ? match.th : "อื่นๆ";
    });

    const handlePositionTypeChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement>) => {
        const selectedTh = e.target.value;
        setIsDirty(true);
        setPositionType(selectedTh);

        if (selectedTh !== "อื่นๆ") {
            const match = POSITIONS.find(p => p.th === selectedTh);
            if (match) {
                setFormData(prev => ({
                    ...prev,
                    position: { th: match.th, en: match.en }
                }));
            }
        }
    };

    const validate = () => {
        const newErrors: Record<string, string> = {};
        const missingFields: string[] = [];

        if (!formData.name?.th) {
            newErrors.nameTh = t("common.required");
            missingFields.push(t("personnel.nameTh"));
        }
        if (!formData.name?.en) {
            newErrors.nameEn = t("common.required");
            missingFields.push(t("personnel.nameEn"));
        }
        if (!formData.email) {
            newErrors.email = t("common.required");
            missingFields.push(t("personnel.email"));
        }

        if (positionType === "อื่นๆ") {
            if (!formData.position?.th) {
                newErrors.posTh = t("common.required");
                missingFields.push(t("personnel.positionTh"));
            }
            if (!formData.position?.en) {
                newErrors.posEn = t("common.required");
                missingFields.push(t("personnel.positionEn"));
            }
        }

        if (!formData.imageSrc) {
            newErrors.imageSrc = t("common.required");
            missingFields.push(t("personnel.image"));
        }

        // Validate Education
        formData.education?.forEach((edu, idx) => {
            if (!edu.major.th) newErrors[`edu-${idx}-majorTh`] = t("common.required");
            if (!edu.major.en) newErrors[`edu-${idx}-majorEn`] = t("common.required");
            if (!edu.university.th) newErrors[`edu-${idx}-uniTh`] = t("common.required");
            if (!edu.university.en) newErrors[`edu-${idx}-uniEn`] = t("common.required");

            if (!edu.major.th || !edu.major.en || !edu.university.th || !edu.university.en) {
                missingFields.push(`${t("personnel.education")} #${idx + 1}`);
            }
        });

        // Validate Courses
        formData.courses?.forEach((course, idx) => {
            if (!course.th) newErrors[`course-${idx}-th`] = t("common.required");
            if (!course.en) newErrors[`course-${idx}-en`] = t("common.required");

            if (!course.th || !course.en) {
                missingFields.push(`${t("personnel.courses")} #${idx + 1}`);
            }
        });

        setErrors(newErrors);
        return missingFields;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const missingFields = validate();
        if (missingFields.length > 0) {
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
            text: t("common.saveConfirmText") || "Do you want to save these personnel details?",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: t("common.save") || "Save",
            cancelButtonText: t("common.cancel") || "Cancel",
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
        });

        if (result.isConfirmed) {
            // Filter out empty entries
            const cleanEducation = (formData.education || []).filter(item => item.major.th || item.major.en || item.university.th || item.university.en);
            const cleanCourses = (formData.courses || []).filter(item => item.th || item.en || item.courseId);
            const cleanCustomLinks = (formData.customLinks || []).filter(item => item.title || item.url);

            const submissionData = {
                ...formData,
                education: cleanEducation,
                courses: cleanCourses,
                customLinks: cleanCustomLinks,
                id: formData.id || `person-${Date.now()}`,
            } as Personnel;

            setIsDirty(false);
            onSubmit(submissionData);
        }
    };

    return (
        <form onSubmit={handleSubmit} noValidate className="space-y-8 bg-white dark:bg-slate-900 p-6 rounded-lg dark:border dark:border-slate-800">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 border-b dark:border-slate-800 pb-4">{t("personnel.details")}</h3>

            {/* Section: Basic Info */}
            <div className="space-y-6">
                <h3 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-6">
                    {t("personnel.basicInfo")}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* Academic Title */}
                    <div className="md:col-span-2">
                        <FormSelect
                            label={t("personnel.academicTitle") || "ตำแหน่งทางวิชาการ / Academic Title"}
                            name="academicTitle"
                            value={formData.academicTitle?.th || ""}
                            onChange={(e) => {
                                setIsDirty(true);
                                const selectedTh = e.target.value;
                                const match = ACADEMIC_TITLES.find(t => t.th === selectedTh);
                                setFormData(prev => ({
                                    ...prev,
                                    academicTitle: { th: match?.th || "", en: match?.en || "" }
                                }));
                            }}
                            options={ACADEMIC_TITLES.map(title => ({
                                value: title.th,
                                label: title.th ? `${title.th} (${title.en})` : `ไม่มี (None)`
                            }))}
                        />
                    </div>

                    {/* Name TH */}
                    <FormInput
                        label={t("personnel.nameTh")}
                        name="nameTh"
                        value={formData.name?.th || ""}
                        onChange={(e) => handleLocalizedChange('name', 'th', e.target.value)}
                        onBlur={(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => handleLocalizedChange('name', 'th', e.target.value.trim())}
                        required
                        placeholder={t("personnel.nameThPlaceholder")}
                        error={errors.nameTh}
                        onFocus={() => handleClearError("nameTh")}
                        suffix={
                            <button
                                type="button"
                                onClick={() => handleTranslate('name')}
                                disabled={isTranslating.name || !formData.name?.th}
                                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 disabled:text-slate-400 flex items-center gap-1 transition-colors whitespace-nowrap"
                            >
                                {isTranslating.name ? (
                                    <div className="w-3 h-3 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                        <path d="M4 14l3-6 3 6M5 12h4" stroke="currentColor" strokeWidth="1" />
                                        <path d="M11 8l3 6M11 11c1 0 2 0.5 2 1.5s-1 1.5-2 1.5" stroke="currentColor" strokeWidth="1" fill="none" />
                                    </svg>
                                )}
                                {isTranslating.name ? t("common.translating") : t("common.autoTranslate")}
                            </button>
                        }
                    />

                    {/* Name EN */}
                    <FormInput
                        label={t("personnel.nameEn")}
                        name="nameEn"
                        value={formData.name?.en || ""}
                        onChange={(e) => handleLocalizedChange('name', 'en', e.target.value)}
                        onBlur={(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => handleLocalizedChange('name', 'en', e.target.value.trim())}
                        required
                        placeholder={t("personnel.nameEnPlaceholder")}
                        error={errors.nameEn}
                        onFocus={() => handleClearError("nameEn")}
                    />

                    {/* Position Selection */}
                    <div className="md:col-span-2 space-y-4">
                        <FormSelect
                            label={t("personnel.position")}
                            name="positionType"
                            value={positionType}
                            onChange={handlePositionTypeChange}
                            options={POSITIONS.map(pos => ({
                                value: pos.th,
                                label: `${pos.th} ${pos.th !== "อื่นๆ" ? `(${pos.en})` : ""}`
                            }))}
                        />

                        {/* Custom Position Inputs (Show only if 'อื่นๆ' is selected) */}
                        {positionType === "อื่นๆ" && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 animate-in fade-in slide-in-from-top-2">
                                <FormInput
                                    label={t("personnel.positionTh")}
                                    name="posTh"
                                    value={formData.position?.th || ""}
                                    onChange={(e) => handleLocalizedChange('position', 'th', e.target.value)}
                                    required
                                    placeholder={t("personnel.positionThPlaceholder")}
                                    error={errors.posTh}
                                    onFocus={() => handleClearError("posTh")}
                                    suffix={
                                        <button
                                            type="button"
                                            onClick={() => handleTranslate('position')}
                                            disabled={isTranslating.position || !formData.position?.th}
                                            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 disabled:text-slate-400 flex items-center gap-1 transition-colors whitespace-nowrap"
                                        >
                                            {isTranslating.position ? (
                                                <div className="w-3 h-3 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                                            ) : (
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                                    <path d="M4 14l3-6 3 6M5 12h4" stroke="currentColor" strokeWidth="1" />
                                                    <path d="M11 8l3 6M11 11c1 0 2 0.5 2 1.5s-1 1.5-2 1.5" stroke="currentColor" strokeWidth="1" fill="none" />
                                                </svg>
                                            )}
                                            {isTranslating.position ? "..." : t("common.autoTranslate")}
                                        </button>
                                    }
                                />
                                <FormInput
                                    label={t("personnel.positionEn")}
                                    name="posEn"
                                    value={formData.position?.en || ""}
                                    onChange={(e) => handleLocalizedChange('position', 'en', e.target.value)}
                                    required
                                    placeholder={t("personnel.positionEnPlaceholder")}
                                    className="font-sans"
                                    error={errors.posEn}
                                    onFocus={() => handleClearError("posEn")}
                                />
                            </div>
                        )}
                    </div>

                    {/* Email */}
                    <FormInput
                        label={t("personnel.email")}
                        name="email"
                        type="email"
                        required
                        value={formData.email || ""}
                        onChange={handleChange}
                        onFocus={() => handleClearError("email")}
                        onBlur={(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setFormData(prev => ({ ...prev, email: e.target.value.trim() }))}
                        placeholder="example@kmutnb.ac.th"
                        error={errors.email}
                    />

                    {/* Phone & Room */}
                    <div className="grid grid-cols-2 gap-4">
                        <FormInput
                            label={t("personnel.phone")}
                            name="phone"
                            value={formData.phone || ""}
                            onChange={handleChange}
                            placeholder="Ex. 1234"
                        />
                        <FormInput
                            label={t("personnel.room")}
                            name="room"
                            value={formData.room || ""}
                            onChange={handleChange}
                            placeholder="Ex. 65-401"
                        />
                    </div>
                </div>

                <div className="mt-4">
                    <FileUpload
                        label={t("personnel.image")}
                        required
                        error={errors.imageSrc}
                        value={formData.imageSrc}
                        onChange={(url) => {
                            setIsDirty(true);
                            setFormData(prev => ({ ...prev, imageSrc: url }));
                            handleClearError("imageSrc");
                        }}
                        onFocus={() => handleClearError("imageSrc")}
                        accept="image/*"
                        folder="ced_web/personnel"
                    />
                </div>
            </div>

            {/* Section: Academic Profile */}
            <div className="space-y-6 pt-2">
                <h3 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-6">
                    {t("personnel.academicProfile")}
                </h3>

                {/* Education (Structured) */}
                <div className="pl-2">
                    <EducationEditor
                        value={formData.education || []}
                        onChange={(val) => {
                            setIsDirty(true);
                            setFormData(prev => ({ ...prev, education: val }));
                        }}
                        onTranslate={handleEduTranslate}
                        translatingField={getTranslatingKey()}
                        errors={errors}
                        onClearError={handleClearError}
                        t={t}
                    />
                </div>

                {/* Courses (Structured) */}
                <div className="pl-2 mt-6">
                    <CourseEditor
                        value={formData.courses || []}
                        onChange={(val) => {
                            setIsDirty(true);
                            setFormData(prev => ({ ...prev, courses: val }));
                        }}
                        onTranslate={handleCourseTranslate}
                        translatingField={getTranslatingKey()}
                        isStaff={positionType === "เจ้าหน้าที่" || formData.position?.en === "Staff"}
                        errors={errors}
                        onClearError={handleClearError}
                        t={t}
                    />
                </div>
            </div>


            {/* Section: External Links */}
            <div className="space-y-6 pt-2">
                <h3 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-6">
                    {t("personnel.externalProfiles")}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormInput
                        label={t("personnel.scopusUrl")}
                        name="scopusLink"
                        type="url"
                        value={formData.scopusLink || ""}
                        onChange={handleChange}
                        onBlur={(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setFormData(prev => ({ ...prev, scopusLink: e.target.value.trim() }))}
                        placeholder="https://www.scopus.com/authid/detail.uri?..."
                    />
                    <FormInput
                        label={t("personnel.researchProfileUrl")}
                        name="researchProfileLink"
                        type="url"
                        value={formData.researchProfileLink || ""}
                        onChange={handleChange}
                        onBlur={(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setFormData(prev => ({ ...prev, researchProfileLink: e.target.value.trim() }))}
                        placeholder="https://research.kmutnb.ac.th/researcher/..."
                    />
                    <div className="md:col-span-2">
                        <FormInput
                            label={t("personnel.googleScholarUrl")}
                            name="googleScholarLink"
                            type="url"
                            value={formData.googleScholarLink || ""}
                            onChange={handleChange}
                            onBlur={(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setFormData(prev => ({ ...prev, googleScholarLink: e.target.value.trim() }))}
                            placeholder="https://scholar.google.com/citations?user=..."
                        />
                    </div>
                </div>

                <div className="pl-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <CustomLinkEditor
                        value={formData.customLinks || []}
                        onChange={(val) => {
                            setIsDirty(true);
                            setFormData(prev => ({ ...prev, customLinks: val }));
                        }}
                    />
                </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end pt-8 border-t">
                <SaveButton
                    isLoading={isLoading}
                    label={t("personnel.savePersonnel")}
                    loadingLabel={t("common.saving")}
                />
            </div>
        </form>
    );
}

