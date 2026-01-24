"use client";

import { LocalizedString } from "@/types";
import { useLocale } from "next-intl";

interface CourseListProps {
    courses: {
        courseId?: string;
        th: string;
        en: string;
    }[];
}

export default function CourseList({ courses, title }: CourseListProps & { title?: string }) {
    const locale = useLocale();
    const lang = locale as keyof LocalizedString;

    return (
        <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span className="w-1 h-8 bg-primary-main"></span>
                {title ? title : (lang === 'th' ? "รายวิชาที่สอน" : "Courses Taught")}
            </h2>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {courses.map((course, index) => (
                    <li
                        key={index}
                        className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-lg shadow-sm"
                    >
                        <div className="w-8 h-8 rounded-lg bg-primary-light/10 flex items-center justify-center text-primary-main shrink-0">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className="w-5 h-5"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
                                />
                            </svg>
                        </div>
                        <span className="text-slate-700 font-medium text-sm md:text-base">
                            {course.courseId ? (
                                <>
                                    <span className="font-bold text-slate-900">{course.courseId}</span>: {course[lang]}
                                </>
                            ) : (
                                course[lang]
                            )}
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    );
}
