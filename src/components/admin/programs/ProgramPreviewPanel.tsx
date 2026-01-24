"use client";

import { useState, Fragment } from "react";
import type { ProgramDetailData } from "@/types/program";

type ProgramPreviewPanelProps = {
    data: Partial<ProgramDetailData>;
};

export default function ProgramPreviewPanel({ data }: ProgramPreviewPanelProps) {
    const [lang, setLang] = useState<'th' | 'en'>('th');

    const totalCredits = (data.curriculum || []).reduce(
        (acc, section) => acc + (parseInt(section.credits) || 0),
        0
    );

    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg overflow-hidden">
            {/* Header */}
            <div className="bg-primary-main px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
                    <span className="font-semibold text-white text-sm">Preview</span>
                </div>
                <div className="flex items-center gap-1 bg-white/20 rounded-full p-0.5">
                    <button
                        type="button"
                        onClick={() => setLang('th')}
                        className={`px-3 py-1 text-xs font-medium rounded-full transition-all ${lang === 'th' ? 'bg-white text-primary-main' : 'text-white/80 hover:text-white'}`}
                    >
                        TH
                    </button>
                    <button
                        type="button"
                        onClick={() => setLang('en')}
                        className={`px-3 py-1 text-xs font-medium rounded-full transition-all ${lang === 'en' ? 'bg-white text-primary-main' : 'text-white/80 hover:text-white'}`}
                    >
                        EN
                    </button>
                </div>
            </div>

            {/* Preview Content */}
            <div className="p-4 max-h-[70vh] overflow-y-auto text-sm space-y-6">
                {/* Program Name */}
                <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                        {data.name?.[lang] || <span className="text-slate-400 italic">ชื่อหลักสูตร</span>}
                    </h2>
                </div>

                {/* Program Info */}
                <div>
                    <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-2">
                        {lang === 'th' ? 'ข้อมูลหลักสูตร' : 'Program Information'}
                    </h3>
                    <ul className="list-disc pl-5 text-slate-700 dark:text-slate-300 space-y-1">
                        <li><strong>{lang === 'th' ? 'ชื่อเต็ม :' : 'Full Name :'}</strong> {data.degree?.full?.[lang] || '-'}</li>
                        <li><strong>{lang === 'th' ? 'ชื่อย่อ :' : 'Abbreviation :'}</strong> {data.degree?.short?.[lang] || '-'}</li>
                    </ul>
                </div>

                {/* Program Format */}
                {data.programFormat?.items && data.programFormat.items.length > 0 && (
                    <div className="space-y-3">
                        <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                            {data.programFormat.title?.[lang]}
                        </h3>
                        <div className="space-y-3 pl-2">
                            {data.programFormat.items.map((item, index) => (
                                <div key={index} className="space-y-1">
                                    <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-start gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-primary-main mt-1.5 shrink-0" />
                                        {item.title ? (item.title as any)[lang] : (item as any)[lang]}
                                    </h4>
                                    {item.subItems && item.subItems.length > 0 && (
                                        <ul className="list-disc pl-6 text-xs text-slate-600 dark:text-slate-400 space-y-1">
                                            {item.subItems.map((sub, sIdx) => (
                                                <li key={sIdx}>{sub[lang]}</li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Grad Attribute / Admission Qualifications */}
                {data.gradAttribute?.items && data.gradAttribute.items.length > 0 && (
                    <div className="space-y-3">
                        <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                            {data.gradAttribute.title?.[lang]}
                        </h3>
                        <div className="space-y-3 pl-2">
                            {data.gradAttribute.items.map((item, index) => (
                                <div key={index} className="space-y-1">
                                    <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-start gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-primary-main mt-1.5 shrink-0" />
                                        {item.title ? (item.title as any)[lang] : (item as any)[lang]}
                                    </h4>
                                    {item.subItems && item.subItems.length > 0 && (
                                        <ul className="list-disc pl-6 text-xs text-slate-600 dark:text-slate-400 space-y-1">
                                            {item.subItems.map((sub, sIdx) => (
                                                <li key={sIdx}>{sub[lang]}</li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Major - Removed */}

                {/* Highlights - Removed */}

                {/* Career Opportunities (Suitable For) */}
                {data.suitableFor?.items && data.suitableFor.items.length > 0 && (
                    <div className="space-y-3">
                        <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                            {data.suitableFor.title?.[lang] || (lang === 'th' ? 'อาชีพที่สามารถประกอบได้หลังสำเร็จการศึกษา' : 'Career Opportunities')}
                        </h3>
                        <div className="space-y-3 pl-2">
                            {data.suitableFor.items.map((item, index) => (
                                <div key={index} className="space-y-1">
                                    <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-start gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-primary-main mt-1.5 shrink-0" />
                                        {item.title ? (item.title as any)[lang] : (item as any)[lang]}
                                    </h4>
                                    {item.subItems && item.subItems.length > 0 && (
                                        <ul className="list-disc pl-6 text-xs text-slate-600 dark:text-slate-400 space-y-1">
                                            {item.subItems.map((sub, sIdx) => (
                                                <li key={sIdx}>{sub[lang]}</li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Curriculum Structure */}
                {data.curriculum && data.curriculum.length > 0 && (
                    <div>
                        <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-2">
                            {lang === 'th' ? 'โครงสร้างหลักสูตร' : 'Curriculum Structure'}
                        </h3>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 border text-xs">
                                <thead className="bg-gray-50 dark:bg-slate-800">
                                    <tr>
                                        <th className="px-3 py-2 text-left font-semibold text-gray-700 dark:text-slate-300">
                                            {lang === 'th' ? 'หมวดวิชา' : 'Category'}
                                        </th>
                                        <th className="border-l px-3 py-2 text-center font-semibold text-gray-700 dark:text-slate-300 w-20">
                                            {lang === 'th' ? 'หน่วยกิต' : 'Credits'}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-slate-900 divide-y divide-gray-200 dark:divide-slate-700">
                                    {data.curriculum.map((section, index) => (
                                        <Fragment key={index}>
                                            <tr className="bg-slate-50 dark:bg-slate-800/50">
                                                <td className="px-3 py-2 font-bold text-slate-900 dark:text-slate-100">
                                                    {section.title?.[lang]}
                                                </td>
                                                <td className="border-l px-3 py-2 font-bold text-slate-900 dark:text-slate-100 text-center">
                                                    {section.credits}
                                                </td>
                                            </tr>
                                            {section.items?.map((item) => (
                                                <tr key={item.id}>
                                                    <td className={`px-3 py-1.5 text-slate-700 dark:text-slate-300 pl-6 ${item.isBold ? 'font-bold' : ''}`}>
                                                        {item.title?.[lang]}
                                                    </td>
                                                    <td className={`border-l px-3 py-1.5 text-slate-700 dark:text-slate-300 text-center ${item.isBold ? 'font-bold' : ''}`}>
                                                        {item.credits}
                                                    </td>
                                                </tr>
                                            ))}
                                        </Fragment>
                                    ))}
                                    <tr className="bg-slate-50 dark:bg-slate-800">
                                        <td className="px-3 py-2 font-bold text-slate-900 dark:text-slate-100 text-right pr-4">
                                            {lang === 'th' ? 'รวมหน่วยกิต' : 'Total'}
                                        </td>
                                        <td className="border-l px-3 py-2 font-bold text-slate-900 dark:text-slate-100 text-center">
                                            {totalCredits}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Documents */}
                {data.documents && data.documents.length > 0 && (
                    <div>
                        <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-2">
                            {lang === 'th' ? 'เอกสารหลักสูตร' : 'Documents'}
                        </h3>
                        <ul className="list-disc pl-5 text-primary-main space-y-1">
                            {data.documents.map((doc, index) => (
                                <li key={index}>{doc.name?.[lang] || '-'}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Language */}
                {data.language?.[lang] && (
                    <div>
                        <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-2">
                            {lang === 'th' ? 'ภาษาที่ใช้' : 'Language'}
                        </h3>
                        <p className="pl-5 text-slate-700 dark:text-slate-300">{data.language[lang]}</p>
                    </div>
                )}

                {/* Admission */}
                {data.admission?.[lang] && (
                    <div>
                        <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-2">
                            {lang === 'th' ? 'การรับเข้าศึกษา' : 'Admission'}
                        </h3>
                        <p className="pl-5 text-slate-700 dark:text-slate-300">{data.admission[lang]}</p>
                    </div>
                )}

                {/* Careers - Removed (Redundant with Suitable For) */}
            </div>
        </div >
    );
}
