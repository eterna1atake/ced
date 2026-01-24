"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import SaveButton from '../common/SaveButton';
import { FormInput, FormTextarea, FormSelect } from "@/components/admin/common/FormInputs";
import { useAutoTranslate } from "@/hooks/useAutoTranslate";


import type { NewsSeedItem } from "@/types/news";
import FileUpload from "@/components/admin/FileUpload";


type NewsFormProps = {
    initialData?: Partial<NewsSeedItem>;
    onSubmit: (data: NewsSeedItem) => void;
    isLoading?: boolean;
};



export default function NewsForm({ initialData, onSubmit, isLoading = false }: NewsFormProps) {
    const { data: session } = useSession();
    const t = useTranslations("Admin.forms");

    const CATEGORIES = [
        { value: "News & Announcements", label: `News & Announcements (${t("news.categories.News & Announcements") || "ข่าวประชาสัมพันธ์"})` },
        { value: "Activities & Events", label: `Activities & Events (${t("news.categories.Activities & Events") || "กิจกรรม"})` },
        { value: "Research & Achievements", label: `Research & Achievements (${t("news.categories.Research & Achievements") || "ผลงานและวิจัย"})` },
        { value: "Training", label: `Training (${t("news.categories.Training") || "การฝึกอบรม"})` },
    ];

    const TAGS_BY_CATEGORY: Record<string, { value: string; label: string }[]> = {
        "News & Announcements": [
            { value: "Department Update", label: `Department Update (${t("news.tags.Department Update") || "ประกาศภาควิชา"})` },
            { value: "Admission", label: `Admission (${t("news.tags.Admission") || "รับสมัคร"})` },
            { value: "Scholarship", label: `Scholarship (${t("news.tags.Scholarship") || "ทุนการศึกษา"})` },
            { value: "Curriculum", label: `Curriculum (${t("news.tags.Curriculum") || "หลักสูตร"})` },
            { value: "Alumni", label: `Alumni (${t("news.tags.Alumni") || "ศิษย์เก่า"})` },
            { value: "General", label: `General (${t("news.tags.General") || "ทั่วไป"})` }
        ],
        "Activities & Events": [
            { value: "Workshop", label: `Workshop (${t("news.tags.Workshop") || "อบรมเชิงปฏิบัติการ"})` },
            { value: "Open House", label: `Open House (${t("news.tags.Open House") || "เปิดบ้าน"})` },
            { value: "Student Life", label: `Student Life (${t("news.tags.Student Life") || "ชีวิตนักศึกษา"})` },
            { value: "Competition", label: `Competition (${t("news.tags.Competition") || "การแข่งขัน"})` },
            { value: "Community Service", label: `Community Service (${t("news.tags.Community Service") || "บริการสังคม"})` }
        ],
        "Research & Achievements": [
            { value: "Awards", label: `Awards (${t("news.tags.Awards") || "รางวัล"})` },
            { value: "Research", label: `Research (${t("news.tags.Research") || "งานวิจัย"})` },
            { value: "Publication", label: `Publication (${t("news.tags.Publication") || "ผลงานตีพิมพ์"})` },
            { value: "Innovation", label: `Innovation (${t("news.tags.Innovation") || "นวัตกรรม"})` },
            { value: "Conference", label: `Conference (${t("news.tags.Conference") || "งานประชุมวิชาการ"})` }
        ],
        "Training": [
            { value: "Workshop", label: `Workshop (${t("news.tags.Workshop") || "อบรมเชิงปฏิบัติการ"})` },
            { value: "Seminar", label: `Seminar (${t("news.tags.Seminar") || "สัมมนา"})` },
            { value: "Certification", label: `Certification (${t("news.tags.Certification") || "ใบรับรอง/ประกาศนียบัตร"})` },
            { value: "Professional Development", label: `Professional Development (${t("news.tags.Professional Development") || "การพัฒนาวิชาชีพ"})` }
        ]
    };

    const [formData, setFormData] = useState<Partial<NewsSeedItem>>({
        title: { en: "", th: "" },
        slug: "",
        summary: { en: "", th: "" },
        content: { en: "", th: "" },
        imageSrc: "",
        category: "",
        author: { en: "", th: "" },
        date: new Date().toISOString().split('T')[0],
        status: "draft",
        tags: [],
        ...initialData,
    });

    // Set default author name from session if not provided in initialData
    useEffect(() => {
        if (!initialData?.author?.en && !initialData?.author?.th && session?.user?.name) {
            setFormData(prev => ({
                ...prev,
                author: {
                    en: prev.author?.en || session.user?.name || "",
                    th: prev.author?.th || session.user?.name || "",
                }
            }));
        }
    }, [session, initialData]);

    const [errors, setErrors] = useState<Record<string, string>>({});
    const { translate, isTranslating } = useAutoTranslate();

    const handleTranslate = async (field: "title" | "summary" | "content", text: string) => {
        await translate(field, text, (translated) => {
            handleLocalizedChange(field, "en", translated);
        });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => {
            const updates: Partial<NewsSeedItem> = { [name]: value };
            // Clear tags if category changes
            if (name === "category") {
                updates.tags = [];
            }
            return { ...prev, ...updates };
        });

        // Clear error for the field
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const generateSlug = (text: string) => {
        return text
            .toLowerCase()
            .replace(/[^\w ]+/g, '')
            .replace(/ +/g, '-');
    };

    const handleLocalizedChange = (field: "title" | "summary" | "content" | "author", locale: "en" | "th", value: string) => {
        setFormData((prev) => {
            const updates = {
                [field]: {
                    ...(prev[field] as { en: string; th: string }),
                    [locale]: value,
                },
            } as Partial<NewsSeedItem>;



            // Auto-generate slug from English title if slug is empty or matches previous auto-gen
            if (field === "title" && locale === "en") {
                const currentSlug = prev.slug || "";
                const oldAutoSlug = generateSlug(prev.title?.en || "");
                if (currentSlug === "" || currentSlug === oldAutoSlug) {
                    updates.slug = generateSlug(value);
                }
            }

            return { ...prev, ...updates };
        });

        // Clear error
        // Let's use simpler keys based on input names
        const nameKey = field === "title" ? (locale === 'en' ? 'titleEn' : 'titleTh') :
            field === "summary" ? (locale === 'en' ? 'summaryEn' : 'summaryTh') :
                field === "content" ? (locale === 'en' ? 'contentEn' : 'contentTh') :
                    (locale === 'en' ? 'authorEn' : 'authorTh');

        if (errors[nameKey]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[nameKey];
                // Also clear slug error if auto-generated
                if (field === "title" && locale === "en") {
                    delete newErrors.slug;
                }
                return newErrors;
            });
        }
    };

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.title?.en) newErrors.titleEn = t("common.required");
        if (!formData.title?.th) newErrors.titleTh = t("common.required");

        // If slug is missing but English title exists, auto-generate it
        if (!formData.slug && formData.title?.en) {
            formData.slug = generateSlug(formData.title.en);
        }

        if (!formData.slug) newErrors.slug = t("common.required");
        if (!formData.category) newErrors.category = t("common.required");
        if (!formData.imageSrc) newErrors.imageSrc = t("common.required");

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };


    const handleSubmit = (statusOrEvent: React.FormEvent | 'published' | 'draft') => {
        if (statusOrEvent && typeof statusOrEvent === 'object' && 'preventDefault' in statusOrEvent) {
            statusOrEvent.preventDefault();
        }

        if (!validate()) {
            import("sweetalert2").then((Swal) => {
                Swal.default.fire({
                    title: t("common.missingInfoTitle"),
                    text: t("common.missingInfoText"),
                    icon: "error",
                    confirmButtonColor: "#f43f5e", // Rose 500
                });
            });
            return;
        }

        const finalStatus = typeof statusOrEvent === 'string' ? statusOrEvent : formData.status || 'draft';

        // Basic validation or ID generation could happen here
        const submissionData = {
            ...formData,
            status: finalStatus,
            id: formData.id || `news-${Date.now()}`,
            imageAlt: formData.title?.en || "News Image", // Default Alt
            galleryImages: formData.galleryImages || [],
            createdAt: formData.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        } as NewsSeedItem;

        onSubmit(submissionData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 bg-white dark:bg-slate-900 p-8 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800">
            <div className="space-y-8">
                {/* Section: Header */}
                <div className="border-b dark:border-slate-800 pb-4">
                    <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                        {t("news.details")}
                    </h3>
                    <p className="text-slate-500 mt-1">{t("news.detailsSubtitle")}</p>
                </div>

                {/* Section 1: Basic Info (Title) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormInput
                        label={t("news.titleTh")}
                        name="titleTh"
                        value={formData.title?.th || ""}
                        onChange={(e) => handleLocalizedChange("title", "th", e.target.value)}
                        required
                        placeholder={t("news.titleThPlaceholder")}
                        error={errors.titleTh}
                        suffix={
                            <button
                                type="button"
                                onClick={() => handleTranslate("title", formData.title?.th || "")}
                                disabled={isTranslating.title || !formData.title?.th}
                                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 disabled:text-slate-400 flex items-center gap-1 transition-colors whitespace-nowrap"
                                title={t("common.autoTranslate")}
                            >
                                {isTranslating.title ? (
                                    <div className="w-3 h-3 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                        <path d="M4 14l3-6 3 6M5 12h4" stroke="currentColor" strokeWidth="1" />
                                        <path d="M11 8l3 6M11 11c1 0 2 0.5 2 1.5s-1 1.5-2 1.5" stroke="currentColor" strokeWidth="1" fill="none" />
                                    </svg>
                                )}
                                {isTranslating.title ? t("common.translating") : t("common.autoTranslate")}
                            </button>
                        }
                    />
                    <FormInput
                        label={t("news.titleEn")}
                        name="titleEn"
                        value={formData.title?.en || ""}
                        onChange={(e) => handleLocalizedChange("title", "en", e.target.value)}
                        required
                        placeholder={t("news.titleEnPlaceholder")}
                        error={errors.titleEn}
                    />
                </div>

                {/* Section 2: Metadata */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormInput
                        label={t("news.slug")}
                        name="slug"
                        value={formData.slug || ""}
                        onChange={handleChange}
                        required
                        placeholder={t("news.slugPlaceholder")}
                        error={errors.slug}
                        hint={t("news.slugHint")}
                    />
                    <FormInput
                        label={t("news.date")}
                        name="date"
                        type="date"
                        value={formData.date || ""}
                        onChange={() => { }} // No-op
                        disabled // Read-only as per request
                        required
                    />
                </div>

                {/* Section 3: Classification */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormSelect
                        label={t("news.category")}
                        name="category"
                        value={formData.category || ""}
                        onChange={handleChange}
                        error={errors.category}
                        options={[
                            { value: "", label: t("news.selectCategory") },
                            ...CATEGORIES
                        ]}
                    />
                    <FormSelect
                        label={t("news.tag")}
                        name="tags"
                        value={formData.tags?.[0] || ""}
                        onChange={(e) => {
                            setFormData(prev => ({ ...prev, tags: [e.target.value] }));
                        }}
                        options={[
                            { value: "", label: t("news.selectTag") },
                            ...(formData.category ? (TAGS_BY_CATEGORY[formData.category] || []) : [])
                        ]}
                        disabled={!formData.category}
                    />
                </div>

                {/* Section 4: Author */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormInput
                        label={t("news.authorTh")}
                        name="authorTh"
                        value={formData.author?.th || ""}
                        onChange={(e) => handleLocalizedChange("author", "th", e.target.value)}
                        placeholder={t("news.authorThPlaceholder")}
                    />
                    <FormInput
                        label={t("news.authorEn")}
                        name="authorEn"
                        value={formData.author?.en || ""}
                        onChange={(e) => handleLocalizedChange("author", "en", e.target.value)}
                        placeholder={t("news.authorEnPlaceholder")}
                    />
                </div>



                {/* Section 6: Content */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormTextarea
                        label={t("news.contentTh")}
                        name="contentTh"
                        rows={12}
                        value={formData.content?.th || ""}
                        onChange={(e) => handleLocalizedChange("content", "th", e.target.value)}
                        placeholder={t("news.contentThPlaceholder")}
                        hint={
                            <button
                                type="button"
                                onClick={() => handleTranslate("content", formData.content?.th || "")}
                                disabled={isTranslating.content || !formData.content?.th}
                                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 disabled:text-slate-400 mt-1 transition-colors flex items-center gap-1"
                            >
                                {isTranslating.content ? (
                                    <div className="w-2 h-2 border border-indigo-600 border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                                        <text x="4" y="12" fontSize="10" className="font-bold">A</text>
                                        <path d="M9 7l2 4M9 9h2M12 7c1 0 1.5 0.5 1.5 1.5s-0.5 1.5-1.5 1.5" stroke="currentColor" strokeWidth="1" fill="none" />
                                    </svg>
                                )}
                                {isTranslating.content ? t("common.translating") : t("common.autoTranslate")}
                            </button>
                        }
                    />
                    <FormTextarea
                        label={t("news.contentEn")}
                        name="contentEn"
                        rows={12}
                        value={formData.content?.en || ""}
                        onChange={(e) => handleLocalizedChange("content", "en", e.target.value)}
                        placeholder={t("news.contentEnPlaceholder")}
                    />
                </div>

                {/* Section 7: Media */}
                <div className="pt-4 border-t space-y-6">
                    <h4 className="text-lg font-medium text-slate-800">{t("common.media")}</h4>

                    {/* Cover Image */}
                    <div>
                        <label className={`block text-sm font-medium mb-2 ${errors.imageSrc ? "text-red-500" : "text-slate-700"}`}>
                            {t("common.coverImage")} {errors.imageSrc && <span className="text-xs font-normal">({errors.imageSrc})</span>}
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
                        />
                    </div>

                    {/* Gallery Images */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            {t("common.galleryImages")} ({formData.galleryImages?.length || 0}/10)
                        </label>

                        {/* Image Grid */}
                        {formData.galleryImages && formData.galleryImages.length > 0 && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                {formData.galleryImages.map((img, index) => (
                                    <div key={index} className="relative group aspect-video bg-slate-100 rounded-md overflow-hidden border">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={img}
                                            alt={`Gallery ${index + 1}`}
                                            className="w-full h-full object-contain"
                                        />

                                        <button
                                            type="button"
                                            onClick={() => {
                                                const newGallery = [...(formData.galleryImages || [])];
                                                newGallery.splice(index, 1);
                                                setFormData(prev => ({ ...prev, galleryImages: newGallery }));
                                            }}
                                            className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                                <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                                            </svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Add Image Button */}
                        {(formData.galleryImages?.length || 0) < 10 ? (
                            <FileUpload
                                label={t("common.addGalleryImage")}
                                onChange={(url) => {
                                    if (url) {
                                        setFormData(prev => ({
                                            ...prev,
                                            galleryImages: [...(prev.galleryImages || []), url]
                                        }));
                                    }
                                }}
                                accept="image/*"
                            />
                        ) : (
                            <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded-md border border-amber-200">
                                {t("common.maxImagesReached", { max: 10 })}
                            </p>
                        )}
                    </div>
                </div>

            </div>

            <div className="flex justify-end items-center gap-4 pt-6 border-t mt-8">
                <button
                    type="button"
                    disabled={isLoading}
                    onClick={() => handleSubmit('draft')}
                    className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 disabled:opacity-50"
                >
                    {t("common.saveAsDraft")}
                </button>
                <SaveButton
                    isLoading={isLoading}
                    onClick={() => handleSubmit('published')}
                    label={t("news.publishNews")}
                    loadingLabel={t("news.publishing")}
                    type="button"
                />
            </div>
        </form>
    );
}
