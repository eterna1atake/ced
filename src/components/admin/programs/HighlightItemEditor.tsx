import { useState } from "react";
import { BilingualInput } from "@/components/admin/common/BilingualInput";
import { useAutoTranslate } from "@/hooks/useAutoTranslate";

type HighlightItemEditorProps = {
    index: number;
    item: any;
    total: number;
    t: any;
    onChange: (newItem: any) => void;
    onRemove: () => void;
    onMove: (direction: 'up' | 'down') => void;
};

export default function HighlightItemEditor({ index, item, total, t, onChange, onRemove, onMove }: HighlightItemEditorProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const { translate, isTranslating } = useAutoTranslate();

    const updateItem = (lang: 'th' | 'en', field: 'title' | 'description', val: string) => {
        const newItem = {
            ...item,
            [field]: {
                ...(item[field] || { th: "", en: "" }),
                [lang]: val
            }
        };
        onChange(newItem);
    };

    const handleAutoTranslate = (field: 'title' | 'description') => {
        const text = item[field]?.th || "";
        const key = `highlight-${index}-${field}`;
        translate(key, text, (translated) => {
            updateItem('en', field, translated);
        });
    };

    return (
        <div className="border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800/50 overflow-hidden transition-all duration-200">
            {/* Header / Summary */}
            <div
                className="flex items-center gap-4 p-4 bg-white dark:bg-slate-800 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex flex-col items-center gap-1 text-slate-400">
                    <button
                        type="button"
                        disabled={index === 0}
                        onClick={(e) => { e.stopPropagation(); onMove('up'); }}
                        className="p-1 hover:text-primary-main disabled:opacity-30 disabled:hover:text-slate-400"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6" /></svg>
                    </button>
                    <span className="font-mono text-xs font-bold">{index + 1}</span>
                    <button
                        type="button"
                        disabled={index === total - 1}
                        onClick={(e) => { e.stopPropagation(); onMove('down'); }}
                        className="p-1 hover:text-primary-main disabled:opacity-30 disabled:hover:text-slate-400"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                    </button>
                </div>

                <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-slate-900 dark:text-slate-100 truncate">
                        {item.title?.th || <span className="text-slate-400 italic">{t("programDetails.noTitle")}</span>}
                    </h4>
                    <p className="text-xs text-slate-500 truncate">
                        {item.title?.en}
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        className="p-2 text-slate-400 hover:text-red-500 transition-colors rounded-full hover:bg-red-50 dark:hover:bg-red-900/10"
                        onClick={(e) => { e.stopPropagation(); onRemove(); }}
                        title={t("programDetails.removeItem")}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /><line x1="10" x2="10" y1="11" y2="17" /><line x1="14" x2="14" y1="11" y2="17" /></svg>
                    </button>
                    <div className={`transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                    </div>
                </div>
            </div>

            {/* Expanded Content */}
            {isExpanded && (
                <div className="p-4 space-y-4 border-t border-slate-200 dark:border-slate-700 animate-in slide-in-from-top-2 duration-200">
                    <BilingualInput
                        label={t("programDetails.highlightTitle")}
                        value={item.title || { th: "", en: "" }}
                        onChange={(lang, val) => updateItem(lang, 'title', val)}
                        onTranslate={() => handleAutoTranslate('title')}
                        isTranslating={isTranslating[`highlight-${index}-title`]}
                        placeholder={{ th: t("common.thai"), en: t("common.english") }}
                    />
                    <BilingualInput
                        label={t("programDetails.description")}
                        value={item.description || { th: "", en: "" }}
                        onChange={(lang, val) => updateItem(lang, 'description', val)}
                        multiline
                        onTranslate={() => handleAutoTranslate('description')}
                        isTranslating={isTranslating[`highlight-${index}-description`]}
                        placeholder={{ th: t("common.thai"), en: t("common.english") }}
                    />
                </div>
            )}
        </div>
    );
}
