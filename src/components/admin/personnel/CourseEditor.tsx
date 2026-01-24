"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faPlus } from "@fortawesome/free-solid-svg-icons";

export const CourseEditor = ({ value, onChange, onTranslate, translatingField, isStaff = false }: {
    value: { courseId?: string; th: string; en: string }[],
    onChange: (val: { courseId?: string; th: string; en: string }[]) => void,
    onTranslate: (idx: number) => void,
    translatingField: string | null,
    isStaff?: boolean
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
                    {isStaff ? "Responsibilities (งานที่รับผิดชอบ)" : "Courses Taught"}
                </label>
            </div>
            <div className="grid grid-cols-1 gap-3">
                {value.map((course, idx) => (
                    <div key={idx} className="relative group border-l-4 border-slate-200 dark:border-slate-700 pl-6 py-4 bg-slate-50/30 dark:bg-slate-800/20 rounded-r-lg flex items-start gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold text-xs mt-1">
                            {idx + 1}
                        </div>
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-3">
                            {!isStaff && (
                                <div className="md:col-span-2">
                                    <input
                                        type="text"
                                        placeholder="รหัส (Optional)"
                                        value={course.courseId || ""}
                                        onChange={(e) => updateEntry(idx, 'courseId', e.target.value)}
                                        className="w-full px-4 py-2 h-[42px] border border-slate-200 dark:border-slate-700 rounded-lg outline-none transition-all bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary-main/20 focus:border-primary-main hover:border-slate-300 dark:hover:border-slate-600 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                                    />
                                </div>
                            )}
                            <div className="md:col-span-5">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase">Thai</span>
                                    <button
                                        type="button"
                                        onClick={() => onTranslate(idx)}
                                        disabled={translatingField === `course-${idx}` || !course.th}
                                        className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 disabled:text-slate-400"
                                    >
                                        {translatingField === `course-${idx}` ? "..." : "Translate"}
                                    </button>
                                </div>
                                <input
                                    type="text"
                                    placeholder={isStaff ? "งานที่รับผิดชอบ (ไทย)" : "ชื่อวิชา (ไทย)"}
                                    value={course.th}
                                    onChange={(e) => updateEntry(idx, 'th', e.target.value)}
                                    className="w-full px-4 py-2 h-[42px] border border-slate-200 dark:border-slate-700 rounded-lg outline-none transition-all bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary-main/20 focus:border-primary-main hover:border-slate-300 dark:hover:border-slate-600 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                                />
                            </div>
                            <div className="md:col-span-5">
                                <div className="flex items-center mb-1">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase">English</span>
                                </div>
                                <input
                                    type="text"
                                    placeholder={isStaff ? "Responsibility (English)" : "Course Name (English)"}
                                    value={course.en}
                                    onChange={(e) => updateEntry(idx, 'en', e.target.value)}
                                    className="w-full px-4 py-2 h-[42px] border border-slate-200 dark:border-slate-700 rounded-lg outline-none transition-all bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary-main/20 focus:border-primary-main hover:border-slate-300 dark:hover:border-slate-600 placeholder:text-slate-400 dark:placeholder:text-slate-500"
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
                {isStaff ? "Add Responsibility" : "Add Course"}
            </button>
        </div>
    );
};
