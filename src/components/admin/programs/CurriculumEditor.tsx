import type { CurriculumSection, CurriculumItem } from "@/types/program";
import { useAutoTranslate } from "@/hooks/useAutoTranslate";

type TranslationFunction = (key: string) => string;

type CurriculumEditorProps = {
    value: CurriculumSection[];
    onChange: (value: CurriculumSection[]) => void;
    t: TranslationFunction;
};

// Recursive Component for Items
const CurriculumItemEditor = ({
    item,
    onChange,
    onDelete,
    onTranslate,
    translatingField,
    t
}: {
    item: CurriculumItem;
    onChange: (val: CurriculumItem) => void;
    onDelete: () => void;
    onTranslate: (field: string, text: string, callback: (translated: string) => void) => void;
    translatingField: string | null;
    t: TranslationFunction;
}) => {
    // Helper to update fields
    const updateField = (field: keyof CurriculumItem, val: string | boolean) => {
        onChange({ ...item, [field]: val });
    };

    const updateTitle = (lang: 'th' | 'en', val: string) => {
        onChange({ ...item, title: { ...item.title, [lang]: val } });
    };

    // Sub-items handling
    const addSubItem = () => {
        const newSub: CurriculumItem = {
            id: `${item.id}.${(item.subItems?.length || 0) + 1}`,
            title: { th: "", en: "" },
            credits: "3",
            isBold: false
        };
        onChange({ ...item, subItems: [...(item.subItems || []), newSub] });
    };

    return (
        <div className="border-l-4 border-primary-main/20 pl-4 py-2 my-2 bg-transparent">
            <div className="flex gap-2 items-start">
                <div className="grid grid-cols-2 md:grid-cols-12 gap-3 flex-1">
                    {/* ID */}
                    <div className="col-span-2 md:col-span-1">
                        <label className="block text-[10px] font-bold text-slate-400 mb-1">{t("programDetails.id")}</label>
                        <input
                            type="text"
                            placeholder="ID"
                            value={item.id}
                            onChange={(e) => updateField('id', e.target.value)}
                            className="w-full px-2 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-md focus:ring-2 focus:ring-primary-main/20 focus:border-primary-main outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                        />
                    </div>
                    {/* Title TH */}
                    <div className="col-span-2 md:col-span-4">
                        <div className="flex justify-between items-center mb-1">
                            <label className="block text-[10px] font-bold text-slate-400">{t("programDetails.titleTh")}</label>
                            <button
                                type="button"
                                onClick={() => onTranslate(item.id, item.title.th, (translated) => updateTitle('en', translated))}
                                disabled={translatingField === item.id || !item.title.th}
                                className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 disabled:text-slate-300"
                            >
                                {translatingField === item.id ? "..." : t("common.autoTranslate")}
                            </button>
                        </div>
                        <input
                            type="text"
                            placeholder={t("programDetails.titleTh")}
                            value={item.title.th}
                            onChange={(e) => updateTitle('th', e.target.value)}
                            className={`w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-md focus:ring-2 focus:ring-primary-main/20 focus:border-primary-main outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 ${item.isBold ? 'font-bold' : ''}`}
                        />
                    </div>
                    {/* Title EN */}
                    <div className="col-span-2 md:col-span-4">
                        <label className="block text-[10px] font-bold text-slate-400 mb-1">{t("programDetails.titleEn")}</label>
                        <input
                            type="text"
                            placeholder={t("programDetails.titleEn")}
                            value={item.title.en}
                            onChange={(e) => updateTitle('en', e.target.value)}
                            className={`w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-md focus:ring-2 focus:ring-primary-main/20 focus:border-primary-main outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 ${item.isBold ? 'font-bold' : ''}`}
                        />
                    </div>
                    {/* Credits */}
                    <div className="col-span-1 md:col-span-1">
                        <label className="block text-[10px] font-bold text-slate-400 mb-1">{t("programDetails.credits")}</label>
                        <input
                            type="text"
                            placeholder="Cr"
                            value={item.credits}
                            onChange={(e) => updateField('credits', e.target.value)}
                            className="w-full px-2 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-md text-center focus:ring-2 focus:ring-primary-main/20 focus:border-primary-main outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                        />
                    </div>
                    {/* Options */}
                    <div className="col-span-1 md:col-span-2 flex items-end gap-2 h-full pb-2">
                        <label className="flex items-center gap-1 text-[10px] md:text-xs cursor-pointer select-none text-slate-600 hover:text-indigo-600">
                            <input
                                type="checkbox"
                                checked={item.isBold}
                                onChange={(e) => updateField('isBold', e.target.checked)}
                                className="accent-primary-main"
                            />
                            {t("programDetails.bold")}
                        </label>
                        <button
                            type="button"
                            onClick={onDelete}
                            className="text-slate-400 hover:text-red-500 transition-colors p-1"
                            title={t("programDetails.removeItem")}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Recursion for SubItems */}
            <div className="pl-6 mt-3 border-l-2 border-slate-100 ml-2">
                {item.subItems?.map((sub, idx) => (
                    <CurriculumItemEditor
                        key={idx}
                        item={sub}
                        onTranslate={onTranslate}
                        translatingField={translatingField}
                        t={t}
                        onChange={(newSub) => {
                            const newSubs = [...(item.subItems || [])];
                            newSubs[idx] = newSub;
                            onChange({ ...item, subItems: newSubs });
                        }}
                        onDelete={() => {
                            const newSubs = [...(item.subItems || [])];
                            newSubs.splice(idx, 1);
                            onChange({ ...item, subItems: newSubs });
                        }}
                    />
                ))}

                <button
                    type="button"
                    onClick={addSubItem}
                    className="text-xs font-bold text-primary-main hover:text-primary-hover hover:underline mt-2 flex items-center gap-1"
                >
                    <span className="text-lg leading-none">+</span> {t("programDetails.addSubItem")}
                </button>
            </div>
        </div>
    );
};

export default function CurriculumEditor({ value, onChange, t }: CurriculumEditorProps) {

    // Add new Section
    const addSection = () => {
        const newSec: CurriculumSection = {
            title: { th: `หมวดที่ ${value.length + 1}`, en: `Section ${value.length + 1}` },
            credits: "0",
            items: []
        };
        onChange([...value, newSec]);
    };

    const updateSection = (idx: number, newSec: CurriculumSection) => {
        const newVal = [...value];
        newVal[idx] = newSec;
        onChange(newVal);
    };

    const deleteSection = (idx: number) => {
        const newVal = [...value];
        newVal.splice(idx, 1);
        onChange(newVal);
    };

    const { translate, isTranslating } = useAutoTranslate();

    const getTranslatingKey = () => {
        const active = Object.entries(isTranslating).find(([, val]) => val);
        return active ? active[0] : null;
    };


    return (
        <div className="space-y-6">
            {value.map((sec, secIdx) => (
                <div key={secIdx} className="border-b border-gray-100 pb-8 mb-8">
                    {/* Section Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 pb-4 border-b gap-4">
                        <div className="w-full flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <label className="block text-xs font-semibold text-slate-500">{t("programDetails.sectionTitleTh")}</label>
                                    <button
                                        type="button"
                                        onClick={() => translate(`sec-${secIdx}`, sec.title.th, (translated) => updateSection(secIdx, { ...sec, title: { ...sec.title, en: translated } }))}
                                        disabled={isTranslating[`sec-${secIdx}`] || !sec.title.th}
                                        className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 disabled:text-slate-300"
                                    >
                                        {isTranslating[`sec-${secIdx}`] ? "..." : t("common.autoTranslate")}
                                    </button>
                                </div>
                                <input
                                    type="text"
                                    value={sec.title.th}
                                    onChange={(e) => updateSection(secIdx, { ...sec, title: { ...sec.title, th: e.target.value } })}
                                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-md text-sm font-semibold bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:border-primary-main"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1">{t("programDetails.sectionTitleEn")}</label>
                                <input
                                    type="text"
                                    value={sec.title.en}
                                    onChange={(e) => updateSection(secIdx, { ...sec, title: { ...sec.title, en: e.target.value } })}
                                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-md text-sm font-semibold bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:border-primary-main"
                                />
                            </div>
                            <div className="flex flex-col md:block">
                                <label className="block text-xs font-semibold text-slate-500 mb-1">{t("programDetails.totalCredits")}</label>
                                <input
                                    type="text"
                                    value={sec.credits}
                                    onChange={(e) => updateSection(secIdx, { ...sec, credits: e.target.value })}
                                    className="w-full md:w-24 px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-md text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:border-primary-main"
                                />
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => deleteSection(secIdx)}
                            className="text-red-500 hover:text-red-700 text-sm font-bold self-end md:self-center"
                        >
                            {t("programDetails.deleteSection")}
                        </button>
                    </div>

                    {/* Items List */}
                    <div className="pl-2 mt-4">
                        <label className="block text-xs font-bold text-primary-main mb-3 uppercase tracking-wider">{t("programDetails.itemsInSection")}</label>
                        {sec.items.map((item, itemIdx) => (
                            <CurriculumItemEditor
                                key={itemIdx}
                                item={item}
                                onTranslate={translate}
                                translatingField={getTranslatingKey()}
                                t={t}
                                onChange={(newItem) => {
                                    const newItems = [...sec.items];
                                    newItems[itemIdx] = newItem;
                                    updateSection(secIdx, { ...sec, items: newItems });
                                }}
                                onDelete={() => {
                                    const newItems = [...sec.items];
                                    newItems.splice(itemIdx, 1);
                                    updateSection(secIdx, { ...sec, items: newItems });
                                }}
                            />
                        ))}

                        <button
                            type="button"
                            onClick={() => {
                                const newItem: CurriculumItem = {
                                    id: `${sec.items.length + 1}`,
                                    title: { th: "", en: "" },
                                    credits: "3",
                                    isBold: false
                                };
                                updateSection(secIdx, { ...sec, items: [...sec.items, newItem] });
                            }}
                            className="w-full py-2 mt-4 border border-dashed border-primary-main/30 rounded-lg text-primary-main/80 text-sm hover:text-primary-main hover:bg-primary-main/5 transition-all flex items-center justify-center gap-2"
                        >
                            + {t("programDetails.addItem")}
                        </button>
                    </div>
                </div>
            ))}

            <button
                type="button"
                onClick={addSection}
                className="w-full py-3 border-2 border-dashed border-primary-main/40 text-primary-main rounded-lg hover:bg-primary-main/5 font-medium flex items-center justify-center gap-2 transition-all mt-4"
            >
                <span className="text-xl font-bold">+</span> {t("programDetails.addSection")}
            </button>
        </div>
    );
}
