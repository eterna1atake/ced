"use client";

import { useState } from "react";
import { FormInput } from "@/components/admin/common/FormInputs";
import FileUpload from "@/components/admin/FileUpload";
import SaveButton from "@/components/admin/common/SaveButton";
import { useTranslations } from "next-intl";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import type { Classroom } from "@/types/classroom";
import Swal from "sweetalert2";
import { BilingualInput } from "@/components/admin/common/BilingualInput";
import { useAutoTranslate } from "@/hooks/useAutoTranslate";

interface ClassroomFormProps {
    initialData?: Partial<Classroom>;
    onSubmit: (data: Classroom) => void;
    isLoading?: boolean;
}

export default function ClassroomForm({ initialData, onSubmit, isLoading = false }: ClassroomFormProps) {
    const t = useTranslations("Admin.forms");
    const safeT = (key: string, fallback: string) => {
        try {
            const res = t(key);
            return res === key ? fallback : res;
        } catch {
            return fallback;
        }
    };

    const [formData, setFormData] = useState<Partial<Classroom>>({
        id: "",
        name: { th: "", en: "" },
        description: { th: "", en: "" },
        capacity: "",
        equipment: [],
        gallery: [],
        image: "",
        ...initialData
    });

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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleEquipmentChange = (index: number, value: string) => {
        const newEquipment = [...(formData.equipment || [])];
        newEquipment[index] = value;
        setFormData(prev => ({ ...prev, equipment: newEquipment }));
    };

    const addEquipment = () => {
        setFormData(prev => ({ ...prev, equipment: [...(prev.equipment || []), ""] }));
    };

    const removeEquipment = (index: number) => {
        const newEquipment = [...(formData.equipment || [])];
        newEquipment.splice(index, 1);
        setFormData(prev => ({ ...prev, equipment: newEquipment }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name?.th || !formData.name?.en || !formData.id) {
            Swal.fire({
                title: safeT("common.missingInfoTitle", "Missing Information"),
                text: safeT("common.missingInfoText", "Please fill in all required fields"),
                icon: "warning"
            });
            return;
        }

        // ID Validation: Must start with 44- or 52-
        if (!/^(44|52)-/.test(formData.id)) {
            Swal.fire({
                title: "Invalid Room ID",
                text: "Room ID must start with a building number (44- or 52-), for example: 52-205",
                icon: "warning"
            });
            return;
        }

        onSubmit(formData as Classroom);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 bg-white dark:bg-slate-900 p-8 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800">
            <div className="border-b dark:border-slate-800 pb-4">
                <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                    {initialData?.id ? t("classrooms.editClassroom") : t("classrooms.newClassroom")}
                </h3>
            </div>

            <div className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormInput
                        label={t("classrooms.roomNumber")}
                        name="id"
                        value={formData.id || ""}
                        onChange={handleChange}
                        required
                        placeholder={t("classrooms.roomNumberPlaceholder")}
                        hint={t("classrooms.roomNumberHint")}
                    />
                    <FormInput
                        label={t("classrooms.capacity")}
                        name="capacity"
                        value={formData.capacity || ""}
                        onChange={handleChange}
                        placeholder={t("classrooms.capacityPlaceholder")}
                    />
                </div>

                {/* Bilingual Name */}
                <BilingualInput
                    label={t("classrooms.roomName")}
                    value={formData.name || { th: "", en: "" }}
                    onChange={(lang, value) => setFormData(prev => ({
                        ...prev,
                        name: { ...prev.name!, [lang]: value }
                    }))}
                    placeholder={{ th: t("classrooms.roomNamePlaceholderTh"), en: t("classrooms.roomNamePlaceholderEn") }}
                    onTranslate={() => handleTranslate("name", formData.name?.th || "")}
                    isTranslating={isTranslating.name}
                />

                {/* Bilingual Description */}
                <BilingualInput
                    label={t("classrooms.description")}
                    value={formData.description || { th: "", en: "" }}
                    onChange={(lang, value) => setFormData(prev => ({
                        ...prev,
                        description: { ...prev.description!, [lang]: value }
                    }))}
                    multiline
                    rows={3}
                    placeholder={{ th: t("classrooms.descriptionPlaceholderTh"), en: t("classrooms.descriptionPlaceholderEn") }}
                    onTranslate={() => handleTranslate("description", formData.description?.th || "")}
                    isTranslating={isTranslating.description}
                />
            </div>

            {/* Equipment Section */}
            <div className="space-y-4 pt-4 border-t dark:border-slate-800">
                <div className="flex justify-between items-center">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                        {t("classrooms.equipmentList")}
                    </label>
                    <button
                        type="button"
                        onClick={addEquipment}
                        className="text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
                    >
                        <FontAwesomeIcon icon={faPlus} className="w-3 h-3" /> {t("classrooms.addItem")}
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
                                placeholder={t("classrooms.equipmentPlaceholder")}
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
                        <div className="text-sm text-slate-400 italic col-span-2">{t("classrooms.noEquipment")}</div>
                    )}
                </div>
            </div>

            {/* Media Section */}
            <div className="space-y-6 pt-6 border-t dark:border-slate-800">
                <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100">{safeT("common.media", "Media")}</h4>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        {safeT("common.coverImage", "Cover Image")}
                    </label>
                    <FileUpload
                        value={formData.image}
                        onChange={(url) => setFormData(prev => ({ ...prev, image: url }))}
                        accept="image/*"
                        folder="ced_web/classrooms"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        {safeT("common.galleryImages", "Gallery Images")} ({formData.gallery?.length || 0})
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
                                        const newGallery = [...(formData.gallery || [])];
                                        newGallery.splice(index, 1);
                                        setFormData(prev => ({ ...prev, gallery: newGallery }));
                                    }}
                                    className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <FontAwesomeIcon icon={faTrash} className="w-3 h-3" />
                                </button>
                            </div>
                        ))}
                        <FileUpload
                            label={safeT("common.addGalleryImage", "Add Image")}
                            onChange={(url) => {
                                if (url) setFormData(prev => ({ ...prev, gallery: [...(prev.gallery || []), url] }));
                            }}
                            accept="image/*"
                            folder="ced_web/classrooms/gallery"
                        />
                    </div>
                </div>
            </div>

            <div className="flex justify-end pt-6 border-t dark:border-slate-800">
                <SaveButton isLoading={isLoading} label={t("classrooms.saveClassroom")} />
            </div>
        </form>
    );
}
