"use client";

import { useState } from "react";
import { FormInput } from "@/components/admin/common/FormInputs";
import FileUpload from "@/components/admin/FileUpload";
import SaveButton from "@/components/admin/common/SaveButton";
import { useTranslations } from "next-intl";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faTrash, faXmark } from "@fortawesome/free-solid-svg-icons";
import type { Facility } from "@/types/facility";
import Swal from "sweetalert2";
import { BilingualInput } from "@/components/admin/common/BilingualInput";
import { useAutoTranslate } from "@/hooks/useAutoTranslate";
import { useUnsavedChanges } from "@/contexts/UnsavedChangesContext";

interface FacilityFormProps {
    initialData?: Partial<Facility>;
    onSubmit: (data: Facility) => void;
    isLoading?: boolean;
}

export default function FacilityForm({ initialData, onSubmit, isLoading = false }: FacilityFormProps) {
    const t = useTranslations("Admin.forms");
    const safeT = (key: string, fallback: string) => {
        try {
            const res = t(key);
            return res === key ? fallback : res;
        } catch {
            return fallback;
        }
    };

    const [formData, setFormData] = useState<Partial<Facility>>({
        id: "",
        name: { th: "", en: "" },
        description: { th: "", en: "" },
        capacity: { th: "", en: "" },
        equipment: [],
        gallery: [],
        image: "",
        ...initialData
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [capacityValue, setCapacityValue] = useState<string>(() => {
        // Extract numbers from initial capacity string if it exists
        const cap = initialData?.capacity;
        const val = typeof cap === 'string' ? cap : (cap?.th || "");
        return val.replace(/\D/g, "");
    });
    const { setIsDirty } = useUnsavedChanges();
    const { translate, isTranslating } = useAutoTranslate();

    const handleTranslate = async (field: "name" | "description", text: string) => {
        if (!text) return;

        await translate(field, text, (translatedText) => {
            setFormData(prev => ({
                ...prev,
                [field]: {
                    ...prev[field],
                    en: translatedText
                }
            }));

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
        setIsDirty(true);
        setFormData(prev => ({ ...prev, [name]: value }));
        handleClearError(name);
    };

    const handleLocalizedChange = (field: "name" | "description", lang: "th" | "en", value: string) => {
        setIsDirty(true);
        setFormData(prev => ({
            ...prev,
            [field]: {
                ...prev[field]!,
                [lang]: value
            }
        }));

        const errorKey = field === "name" ? (lang === "th" ? "nameTh" : "nameEn") :
            field === "description" ? (lang === "th" ? "descriptionTh" : "descriptionEn") : "";
        if (errorKey) {
            handleClearError(errorKey);
        }
    };

    const handleEquipmentChange = (index: number, value: string) => {
        setIsDirty(true);
        const newEquipment = [...(formData.equipment || [])];
        newEquipment[index] = value;
        setFormData(prev => ({ ...prev, equipment: newEquipment }));
    };

    const addEquipment = () => {
        setIsDirty(true);
        setFormData(prev => ({ ...prev, equipment: [...(prev.equipment || []), ""] }));
    };

    const removeEquipment = (index: number) => {
        setIsDirty(true);
        const newEquipment = [...(formData.equipment || [])];
        newEquipment.splice(index, 1);
        setFormData(prev => ({ ...prev, equipment: newEquipment }));
    };

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.id) newErrors.id = t("common.required");
        if (!formData.name?.th) newErrors.nameTh = t("common.required");
        if (!formData.name?.en) newErrors.nameEn = t("common.required");
        if (!formData.description?.th) newErrors.descriptionTh = t("common.required");
        if (!formData.description?.en) newErrors.descriptionEn = t("common.required");
        if (!capacityValue) newErrors.capacity = t("common.required");
        if (!formData.image) newErrors.image = t("common.required");

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
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

        // ID Validation: Must start with 44- or 52-
        if (!/^(44|52)-/.test(formData.id!)) {
            Swal.fire({
                title: "Invalid Room ID",
                text: "Room ID must start with a building number (44- or 52-), for example: 52-205",
                icon: "warning"
            });
            setErrors(prev => ({ ...prev, id: "Must start with 44- or 52-" }));
            return;
        }

        setIsDirty(false);
        const submissionData = {
            ...formData,
            capacity: {
                th: capacityValue ? `${capacityValue} คน` : "",
                en: capacityValue ? `${capacityValue} students` : ""
            }
        };
        onSubmit(submissionData as Facility);
    };

    return (
        <form onSubmit={handleSubmit} noValidate className="space-y-8 bg-white dark:bg-slate-900 p-8 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800">
            <div className="border-b dark:border-slate-800 pb-4">
                <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                    {initialData?.id ? t("facilities.editFacility") : t("facilities.newFacility")}
                </h3>
            </div>

            <div className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormInput
                        label={t("facilities.roomNumber")}
                        name="id"
                        value={formData.id || ""}
                        onChange={handleChange}
                        required
                        placeholder={t("facilities.roomNumberPlaceholder")}
                        hint={t("facilities.roomNumberHint")}
                        error={errors.id}
                        onFocus={() => handleClearError("id")}
                    />
                    <FormInput
                        label={t("facilities.capacity")}
                        name="capacity"
                        type="text"
                        inputMode="numeric"
                        value={capacityValue}
                        onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, "");
                            setCapacityValue(val);
                            setIsDirty(true);
                            handleClearError("capacity");
                        }}
                        required
                        error={errors.capacity}
                        onFocus={() => handleClearError("capacity")}
                        placeholder={t("facilities.capacityPlaceholder")}
                        suffix={<span className="text-slate-400 text-sm pr-2">คน / students</span>}
                    />
                </div>

                {/* Bilingual Name */}
                <BilingualInput
                    label={t("facilities.roomName")}
                    value={formData.name || { th: "", en: "" }}
                    onChange={(lang, value) => handleLocalizedChange("name", lang, value)}
                    placeholder={{ th: t("facilities.roomNamePlaceholderTh"), en: t("facilities.roomNamePlaceholderEn") }}
                    onTranslate={() => handleTranslate("name", formData.name?.th || "")}
                    isTranslating={isTranslating.name}
                    required
                    error={{ th: errors.nameTh, en: errors.nameEn }}
                    onFocus={(lang) => handleClearError(lang === 'th' ? "nameTh" : "nameEn")}
                />

                {/* Bilingual Description */}
                <BilingualInput
                    label={t("facilities.description")}
                    value={formData.description || { th: "", en: "" }}
                    onChange={(lang, value) => handleLocalizedChange("description", lang, value)}
                    multiline
                    rows={3}
                    placeholder={{ th: t("facilities.descriptionPlaceholderTh"), en: t("facilities.descriptionPlaceholderEn") }}
                    onTranslate={() => handleTranslate("description", formData.description?.th || "")}
                    isTranslating={isTranslating.description}
                    required
                    error={{ th: errors.descriptionTh, en: errors.descriptionEn }}
                    onFocus={(lang) => handleClearError(lang === 'th' ? "descriptionTh" : "descriptionEn")}
                />
            </div>

            {/* Equipment Section */}
            <div className="space-y-4 pt-4 border-t dark:border-slate-800">
                <div className="flex justify-between items-center">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                        {t("facilities.equipmentList")}
                    </label>
                    <button
                        type="button"
                        onClick={addEquipment}
                        className="text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
                    >
                        <FontAwesomeIcon icon={faPlus} className="w-3 h-3" /> {t("facilities.addItem")}
                    </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {formData.equipment?.map((item, index) => (
                        <div key={index} className="flex gap-2">
                            <input
                                type="text"
                                value={item}
                                onChange={(e) => handleEquipmentChange(index, e.target.value)}
                                className="flex-1 px-4 py-2 border rounded-lg outline-none transition-all border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                                placeholder={t("facilities.equipmentPlaceholder")}
                            />
                            <button
                                type="button"
                                onClick={() => removeEquipment(index)}
                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            >
                                <FontAwesomeIcon icon={faTrash} />
                            </button>
                        </div>
                    ))}
                    {(!formData.equipment || formData.equipment.length === 0) && (
                        <div className="text-sm text-slate-400 italic col-span-2">{t("facilities.noEquipment")}</div>
                    )}
                </div>
            </div>

            {/* Media Section */}
            <div className="space-y-6 pt-6 border-t dark:border-slate-800">
                <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100">{safeT("common.media", "Media")}</h4>

                <div>
                    <FileUpload
                        label={safeT("common.coverImage", "Cover Image")}
                        value={formData.image}
                        required
                        error={errors.image}
                        onChange={(url) => {
                            setIsDirty(true);
                            setFormData(prev => ({ ...prev, image: url }));
                            handleClearError("image");
                        }}
                        onFocus={() => handleClearError("image")}
                        accept="image/*"
                        folder="ced_web/facilities"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        {safeT("common.galleryImages", "Gallery Images")} ({formData.gallery?.length || 0}/2)
                    </label>
                    {/* Gallery Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        {formData.gallery?.map((img, index) => (
                            <div key={index} className="relative group aspect-video bg-slate-100 rounded-md overflow-hidden border">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={img} alt={`Gallery ${index}`} className="w-full h-full object-cover" />
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsDirty(true);
                                        const newGallery = [...(formData.gallery || [])];
                                        newGallery.splice(index, 1);
                                        setFormData(prev => ({ ...prev, gallery: newGallery }));
                                    }}
                                    className="absolute top-2 right-2 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600 z-10"
                                >
                                    <FontAwesomeIcon icon={faXmark} className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        ))}
                        {(!formData.gallery || formData.gallery.length < 2) && (
                            <FileUpload
                                label={safeT("common.addGalleryImage", "Add Image")}
                                onChange={(url) => {
                                    if (url) {
                                        setIsDirty(true);
                                        setFormData(prev => ({ ...prev, gallery: [...(prev.gallery || []), url] }));
                                    }
                                }}
                                accept="image/*"
                                folder="ced_web/facilities/gallery"
                            />
                        )}
                    </div>
                </div>
            </div>

            <div className="flex justify-end pt-6 border-t dark:border-slate-800">
                <SaveButton
                    isLoading={isLoading}
                    label={t("facilities.saveFacility")}
                    loadingLabel={t("common.saving")}
                />
            </div>
        </form>
    );
}
