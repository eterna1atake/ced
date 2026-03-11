"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faPlus } from "@fortawesome/free-solid-svg-icons";

import { FormInput } from "@/components/admin/common/FormInputs";

export const CourseEditor = ({ value, onChange, onTranslate, translatingField, isStaff = false, errors = {}, onClearError, t }: {
    value: { courseId?: string; th: string; en: string }[],
    onChange: (val: { courseId?: string; th: string; en: string }[]) => void,
    onTranslate: (idx: number) => void,
    translatingField: string | null,
    isStaff?: boolean,
    errors?: Record<string, string>,
    onClearError?: (name: string) => void,
    t: any
}) => {
    const addEntry = () => onChange([...value, { courseId: "", th: "", en: "" }]);
    const removeEntry = (index: number) => onChange(value.filter((_, i) => i !== index));
    const updateEntry = (index: number, field: 'courseId' | 'th' | 'en', val: string) => {
        const next = [...value];
        next[index] = { ...next[index], [field]: val };
        onChange(next);
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center mb-2">
                <label className="text-xl font-bold text-slate-900 dark:text-slate-100">
                    {isStaff ? "Responsibilities (งานที่รับผิดชอบ)" : t("personnel.courses")}
                </label>
            </div>
            <div className="grid grid-cols-1 gap-3">
                {value.map((course, idx) => (
                    <div key={idx} className="relative group border-l-4 border-slate-200 dark:border-slate-700 pl-6 py-4 bg-slate-50/30 dark:bg-slate-800/20 rounded-r-lg flex items-start gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold text-xs mt-1">
                            {idx + 1}
                        </div>
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                            {!isStaff && (
                                <div className="md:col-span-2">
                                    <div className="flex items-center mb-1">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase">{t("personnel.courseIdOptional")}</span>
                                    </div>
                                    <FormInput
                                        label=""
                                        name={`course-${idx}-id`}
                                        placeholder={t("personnel.courseIdOptional")}
                                        value={course.courseId || ""}
                                        onChange={(e) => {
                                            updateEntry(idx, 'courseId', e.target.value);
                                            onClearError?.(`course-${idx}-id`);
                                        }}
                                        onFocus={() => onClearError?.(`course-${idx}-id`)}
                                        error={errors[`course-${idx}-id`]}
                                    />
                                </div>
                            )}
                            <div className={`md:col-span-${isStaff ? 6 : 5}`}>
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase">{t("personnel.thai")}</span>
                                    <button
                                        type="button"
                                        onClick={() => onTranslate(idx)}
                                        disabled={translatingField === `course-${idx}` || !course.th}
                                        className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 disabled:text-slate-400"
                                    >
                                        {translatingField === `course-${idx}` ? "..." : "Translate"}
                                    </button>
                                </div>
                                <FormInput
                                    label=""
                                    name={`course-${idx}-th`}
                                    placeholder={isStaff ? "งานที่รับผิดชอบ (ไทย)" : "ชื่อวิชา (ไทย)"}
                                    value={course.th}
                                    onChange={(e) => {
                                        updateEntry(idx, 'th', e.target.value);
                                        onClearError?.(`course-${idx}-th`);
                                    }}
                                    onFocus={() => onClearError?.(`course-${idx}-th`)}
                                    error={errors[`course-${idx}-th`]}
                                />
                            </div>
                            <div className={`md:col-span-${isStaff ? 6 : 5}`}>
                                <div className="flex items-center mb-1">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase">{t("personnel.english")}</span>
                                </div>
                                <FormInput
                                    label=""
                                    name={`course-${idx}-en`}
                                    placeholder={isStaff ? "Responsibility (English)" : "Course Name (English)"}
                                    value={course.en}
                                    onChange={(e) => {
                                        updateEntry(idx, 'en', e.target.value);
                                        onClearError?.(`course-${idx}-en`);
                                    }}
                                    onFocus={() => onClearError?.(`course-${idx}-en`)}
                                    error={errors[`course-${idx}-en`]}
                                />
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => removeEntry(idx)}
                            className="text-slate-300 hover:text-red-500 hover:bg-red-50 p-2 rounded-full transition-all opacity-0 group-hover:opacity-100 self-center"
                            title={isStaff ? "Remove Responsibility" : "Remove Course"}
                        >
                            <FontAwesomeIcon icon={faTrash} className="text-sm" />
                        </button>
                    </div>
                ))}
            </div>

            <button
                type="button"
                onClick={addEntry}
                className="w-full py-3 border-2 border-dashed border-slate-300 rounded-lg text-slate-500 font-semibold hover:border-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
            >
                <FontAwesomeIcon icon={faPlus} />
                {isStaff ? "Add Responsibility" : t("personnel.addCourse")}
            </button>
        </div>
    );
};
