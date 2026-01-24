"use client";

import { LocalizedString } from "@/types";
import { useLocale } from "next-intl";

interface EducationListProps {
    education: {
        level: LocalizedString;
        major: LocalizedString;
        university: LocalizedString;
    }[];
}

export default function EducationList({ education }: EducationListProps) {
    const locale = useLocale();
    const lang = locale as keyof LocalizedString;

    return (
        <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <span className="w-1 h-8 bg-primary-main"></span>
                {lang === 'th' ? "ประวัติการศึกษา" : "Education History"}
            </h2>
            <ul className="space-y-3">
                {education.map((edu, index) => (
                    <li key={index} className="flex items-start gap-3 text-slate-700">
                        <span className="mt-2.5 w-1.5 h-1.5 bg-slate-400 rounded-full flex-shrink-0"></span>
                        <div className="text-base text-slate-800">
                            <span className="font-semibold">{edu.level[lang]}</span>
                            {edu.major[lang] && <span> ({edu.major[lang]})</span>}
                            {edu.university[lang] && <span>, {edu.university[lang]}</span>}
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}
