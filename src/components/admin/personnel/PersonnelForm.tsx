"use client";

import { useState } from "react";
import type { Personnel } from "@/types/personnel";
import FileUpload from "@/components/admin/FileUpload";
import { FormInput, FormSelect } from "@/components/admin/common/FormInputs";
import SaveButton from '../common/SaveButton';
import { useAutoTranslate } from "@/hooks/useAutoTranslate";

type PersonnelFormProps = {
    initialData?: Partial<Personnel>;
    onSubmit: (data: Personnel) => void;
    isLoading?: boolean;
};

import { EducationEditor } from "./EducationEditor";
import { CourseEditor } from "./CourseEditor";
import { CustomLinkEditor } from "./CustomLinkEditor";
import { POSITIONS } from "./constants";

import { useTranslations } from "next-intl";


export default function PersonnelForm({ initialData, onSubmit, isLoading = false }: PersonnelFormProps) {
    const t = useTranslations("Admin.forms");
    const [formData, setFormData] = useState<Partial<Personnel>>({
        name: { th: "", en: "" },
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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));

        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const handleLocalizedChange = (field: 'name' | 'position', lang: 'th' | 'en', value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: {
                ...(prev[field] || { th: "", en: "" }),
                [lang]: value
            }
        }));

        const errorKey = field === 'name' ? (lang === 'th' ? 'nameTh' : 'nameEn') : (lang === 'th' ? 'posTh' : 'posEn');
        if (errors[errorKey]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[errorKey];
                return newErrors;
            });
        }
    };

    // Calculate initial position type based on current value matching presets
    const [positionType, setPositionType] = useState(() => {
        const currentTh = initialData?.position?.th || "";
        const match = POSITIONS.find(p => p.th === currentTh);
        return match ? match.th : "อื่นๆ";
    });

    const handlePositionTypeChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement>) => {
        const selectedTh = e.target.value;
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

        setErrors(newErrors);
        return missingFields;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const missingFields = validate();
        if (missingFields.length > 0) {
            import("sweetalert2").then((Swal) => {
                Swal.default.fire({
                    title: t("common.missingInfoTitle"),
                    html: `
                        <p class="mb-2">${t("common.missingInfoText")}</p>
                        <ul class="text-left text-sm list-disc pl-6 text-slate-600 dark:text-slate-300">
                            ${missingFields.map(field => `<li>${field}</li>`).join("")}
                        </ul>
                    `,
                    icon: "error",
                    confirmButtonColor: "#f43f5e",
                });
            });
            return;
        }

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

        onSubmit(submissionData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 bg-white dark:bg-slate-900 p-6 rounded-lg dark:border dark:border-slate-800">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 border-b dark:border-slate-800 pb-4">{t("personnel.details")}</h3>

            {/* Section: Basic Info */}
            <div className="space-y-6">
                <h3 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-6">
                    {t("personnel.basicInfo")}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

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
                    <label className={`block text-sm font-medium mb-2 ${errors.imageSrc ? "text-red-500" : "text-slate-700"}`}>
                        {t("personnel.image")} {errors.imageSrc && <span className="text-xs font-normal">({errors.imageSrc})</span>}
                    </label>
                    <FileUpload
                        value={formData.imageSrc}
                        onChange={(url) => {
                            setFormData(prev => ({ ...prev, imageSrc: url }));
                            if (errors.imageSrc) {
                                setErrors(prev => {
                                    const newErrors = { ...prev };
                                    delete newErrors.imageSrc;
                                    return newErrors;
                                });
                            }
                        }}
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
                        onChange={(val) => setFormData(prev => ({ ...prev, education: val }))}
                        onTranslate={handleEduTranslate}
                        translatingField={getTranslatingKey()}
                    />
                </div>

                {/* Courses (Structured) */}
                <div className="pl-2 mt-6">
                    <CourseEditor
                        value={formData.courses || []}
                        onChange={(val) => setFormData(prev => ({ ...prev, courses: val }))}
                        onTranslate={handleCourseTranslate}
                        translatingField={getTranslatingKey()}
                        isStaff={positionType === "เจ้าหน้าที่" || formData.position?.en === "Staff"}
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
                        onChange={(val) => setFormData(prev => ({ ...prev, customLinks: val }))}
                    />
                </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end pt-8 border-t">
                <SaveButton
                    isLoading={isLoading}
                    label={t("personnel.savePersonnel")}
                />
            </div>
        </form>
    );
}

