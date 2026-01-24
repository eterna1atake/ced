import React from "react";

type BilingualInputProps = {
    label: string;
    value: { th: string; en: string };
    onChange: (lang: 'th' | 'en', value: string) => void;
    multiline?: boolean;
    placeholder?: { th?: string; en?: string };
    rows?: number;
    onTranslate?: () => void;
    isTranslating?: boolean;
};

export const BilingualInput: React.FC<BilingualInputProps> = ({
    label,
    value,
    onChange,
    multiline = false,
    placeholder,
    rows = 3,
    onTranslate,
    isTranslating = false
}) => {
    return (
        <div className="py-2">
            <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    {label}
                </span>
                {onTranslate && (
                    <button
                        type="button"
                        onClick={onTranslate}
                        disabled={isTranslating || !value.th}
                        className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 disabled:text-slate-400 dark:disabled:text-slate-600 flex items-center gap-1 transition-colors"
                        title="Translate Thai to English"
                    >
                        {isTranslating ? (
                            <div className="w-3 h-3 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                <path d="M4 14l3-6 3 6M5 12h4" stroke="currentColor" strokeWidth="1" />
                                <path d="M11 8l3 6M11 11c1 0 2 0.5 2 1.5s-1 1.5-2 1.5" stroke="currentColor" strokeWidth="1" fill="none" />
                            </svg>
                        )}
                        {isTranslating ? "Translating..." : "Auto-translate to English"}
                    </button>
                )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                    <span className="absolute -top-2 left-2 px-1 bg-white dark:bg-slate-800 text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                        Thai
                    </span>
                    {multiline ? (
                        <textarea
                            rows={rows}
                            value={value.th || ""}
                            onChange={(e) => onChange("th", e.target.value)}
                            className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-main/20 focus:border-primary-main transition-all bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 hover:border-slate-300 dark:hover:border-slate-600"
                            placeholder={placeholder?.th}
                        />
                    ) : (
                        <input
                            type="text"
                            value={value.th || ""}
                            onChange={(e) => onChange("th", e.target.value)}
                            className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-main/20 focus:border-primary-main transition-all bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 hover:border-slate-300 dark:hover:border-slate-600"
                            placeholder={placeholder?.th}
                        />
                    )}
                </div>
                <div className="relative">
                    <span className="absolute -top-2 left-2 px-1 bg-white dark:bg-slate-800 text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                        English
                    </span>
                    {multiline ? (
                        <textarea
                            rows={rows}
                            value={value.en || ""}
                            onChange={(e) => onChange("en", e.target.value)}
                            className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-main/20 focus:border-primary-main transition-all bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 hover:border-slate-300 dark:hover:border-slate-600"
                            placeholder={placeholder?.en}
                        />
                    ) : (
                        <input
                            type="text"
                            value={value.en || ""}
                            onChange={(e) => onChange("en", e.target.value)}
                            className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-main/20 focus:border-primary-main transition-all bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 hover:border-slate-300 dark:hover:border-slate-600"
                            placeholder={placeholder?.en}
                        />
                    )}
                </div>
            </div>
        </div >
    );
};
