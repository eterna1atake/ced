"use client";

import { ICustomLink } from "@/types/personnel";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faPlus } from "@fortawesome/free-solid-svg-icons";

export const CustomLinkEditor = ({ value, onChange }: {
    value: ICustomLink[],
    onChange: (val: ICustomLink[]) => void
}) => {
    const addEntry = () => onChange([...value, { title: "", url: "" }]);
    const removeEntry = (index: number) => onChange(value.filter((_, i) => i !== index));
    const updateEntry = (index: number, field: keyof ICustomLink, val: string) => {
        const next = [...value];
        next[index] = { ...next[index], [field]: val };
        onChange(next);
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center mb-2">
                <label className="text-xl font-bold text-slate-900 dark:text-slate-100">
                    Other Links (ลิงก์อื่นๆ)
                </label>
            </div>
            <div className="grid grid-cols-1 gap-3">
                {value.map((link, idx) => (
                    <div key={idx} className="relative group border-l-4 border-slate-200 dark:border-slate-700 pl-6 py-4 bg-slate-50/30 dark:bg-slate-800/20 rounded-r-lg flex items-start gap-3">
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                            <input
                                type="text"
                                placeholder="Link Title (e.g. Website, GitHub)"
                                value={link.title}
                                onChange={(e) => updateEntry(idx, 'title', e.target.value)}
                                className="w-full px-4 py-2 h-[42px] border border-slate-200 dark:border-slate-700 rounded-lg outline-none transition-all bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary-main/20 focus:border-primary-main hover:border-slate-300 dark:hover:border-slate-600 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                            />
                            <input
                                type="url"
                                placeholder="URL (https://...)"
                                value={link.url}
                                onChange={(e) => updateEntry(idx, 'url', e.target.value)}
                                className="w-full px-4 py-2 h-[42px] border border-slate-200 dark:border-slate-700 rounded-lg outline-none transition-all bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary-main/20 focus:border-primary-main hover:border-slate-300 dark:hover:border-slate-600 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                            />
                        </div>
                        <button
                            type="button"
                            onClick={() => removeEntry(idx)}
                            className="text-slate-300 hover:text-red-500 hover:bg-red-50 p-2 rounded-full transition-all opacity-0 group-hover:opacity-100 self-center"
                            title="Remove Link"
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
                Add Link
            </button>
        </div>
    );
};
