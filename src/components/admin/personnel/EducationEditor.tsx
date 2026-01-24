"use client";

import { EducationEntry } from "@/types/personnel";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faPlus } from "@fortawesome/free-solid-svg-icons";
import { FormSelect } from "@/components/admin/common/FormInputs";
import { DEGREE_LEVELS } from "./constants";

export const EducationEditor = ({ value, onChange, onTranslate, translatingField }: {
    value: EducationEntry[],
    onChange: (val: EducationEntry[]) => void,
    onTranslate: (idx: number, field: 'major' | 'university') => void,
    translatingField: string | null
}) => {
    const addEntry = () => onChange([...value, {
        level: DEGREE_LEVELS[0],
        major: { th: "", en: "" },
        university: { th: "", en: "" }
    }]);
    const removeEntry = (index: number) => onChange(value.filter((_, i) => i !== index));
    const updateEntry = (index: number, field: keyof EducationEntry, lang: 'th' | 'en', val: string) => {
        const next = [...value];
        next[index] = { ...next[index], [field]: { ...next[index][field], [lang]: val } };
        onChange(next);
    };

    const setLevel = (index: number, level: { th: string; en: string }) => {
        const next = [...value];
        next[index] = { ...next[index], level };
        onChange(next);
    };

    return (
        <div className="space-y-8 bg-white dark:bg-slate-900 p-8 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-center mb-2">
                <label className="text-xl font-bold text-slate-900 dark:text-slate-100">
                    Education History
                </label>
            </div>
            {value.map((edu, idx) => (
                <div key={idx} className="relative group border-l-4 border-slate-200 dark:border-slate-700 pl-6 py-4 my-4 bg-slate-50/30 dark:bg-slate-800/20 rounded-r-lg flex items-start gap-4">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-4">
                        {/* level Selection */}
                        <div className="md:col-span-4">
                            <FormSelect
                                label="Degree Level"
                                name={`edu-level-${idx}`}
                                value={`${edu.level.th}|${edu.level.en}`}
                                onChange={(e) => {
                                    const [th, en] = e.target.value.split('|');
                                    setLevel(idx, { th, en });
                                }}
                                options={DEGREE_LEVELS.map(L => ({
                                    value: `${L.th}|${L.en}`,
                                    label: `${L.th} / ${L.en}`
                                }))}
                            />
                        </div>

                        {/* Major / Field of Study */}
                        <div className="md:col-span-4">
                            <div className="flex justify-between items-center mb-1">
                                <label className="block text-sm font-semibold text-slate-700">Major / Field</label>
                                <button
                                    type="button"
                                    onClick={() => onTranslate(idx, 'major')}
                                    disabled={translatingField === `edu-${idx}-major` || !edu.major.th}
                                    className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 disabled:text-slate-400"
                                >
                                    {translatingField === `edu-${idx}-major` ? "..." : "Translate"}
                                </button>
                            </div>
                            <div className="space-y-2">
                                <input
                                    type="text"
                                    placeholder="สาขาวิชา (ไทย)"
                                    value={edu.major.th}
                                    onChange={(e) => updateEntry(idx, 'major', 'th', e.target.value)}
                                    className="w-full px-4 py-2 h-[42px] border border-slate-200 dark:border-slate-700 rounded-lg outline-none transition-all bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary-main/20 focus:border-primary-main hover:border-slate-300 dark:hover:border-slate-600 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                                />
                                <input
                                    type="text"
                                    placeholder="Major / Field (English)"
                                    value={edu.major.en}
                                    onChange={(e) => updateEntry(idx, 'major', 'en', e.target.value)}
                                    className="w-full px-4 py-2 h-[42px] border border-slate-200 dark:border-slate-700 rounded-lg outline-none transition-all bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary-main/20 focus:border-primary-main hover:border-slate-300 dark:hover:border-slate-600 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                                />
                            </div>
                        </div>

                        {/* University */}
                        <div className="md:col-span-4">
                            <div className="flex justify-between items-center mb-1">
                                <label className="block text-sm font-semibold text-slate-700">University</label>
                                <button
                                    type="button"
                                    onClick={() => onTranslate(idx, 'university')}
                                    disabled={translatingField === `edu-${idx}-university` || !edu.university.th}
                                    className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 disabled:text-slate-400"
                                >
                                    {translatingField === `edu-${idx}-university` ? "..." : "Translate"}
                                </button>
                            </div>
                            <div className="space-y-2">
                                <input
                                    type="text"
                                    placeholder="มหาวิทยาลัย (ไทย)"
                                    value={edu.university.th}
                                    onChange={(e) => updateEntry(idx, 'university', 'th', e.target.value)}
                                    className="w-full px-4 py-2 h-[42px] border border-slate-200 dark:border-slate-700 rounded-lg outline-none transition-all bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary-main/20 focus:border-primary-main hover:border-slate-300 dark:hover:border-slate-600 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                                />
                                <input
                                    type="text"
                                    placeholder="University (English)"
                                    value={edu.university.en}
                                    onChange={(e) => updateEntry(idx, 'university', 'en', e.target.value)}
                                    className="w-full px-4 py-2 h-[42px] border border-slate-200 dark:border-slate-700 rounded-lg outline-none transition-all bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary-main/20 focus:border-primary-main hover:border-slate-300 dark:hover:border-slate-600 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                                />
                            </div>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={() => removeEntry(idx)}
                        className="text-slate-300 hover:text-red-500 hover:bg-red-50 p-2 rounded-full transition-all opacity-0 group-hover:opacity-100 self-center"
                        title="Remove Entry"
                    >
                        <FontAwesomeIcon icon={faTrash} className="text-sm" />
                    </button>
                </div>
            ))}

            <button
                type="button"
                onClick={addEntry}
                className="w-full py-3 border-2 border-dashed border-slate-300 rounded-lg text-slate-500 font-semibold hover:border-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
            >
                <FontAwesomeIcon icon={faPlus} />
                Add Education Entry
            </button>
        </div>
    );
};
