import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconDefinition } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";

interface ResearchCardProps {
    title: string;
    description: string;
    icon: IconDefinition;
    link: string;
    actionText: string;
}

export default function ResearchCard({ title, description, icon, link, actionText }: ResearchCardProps) {
    return (
        <div className="relative flex flex-col bg-white dark:bg-slate-900 shadow-md border border-slate-200 dark:border-slate-800 text-center h-full transition-all hover:shadow-lg hover:-translate-y-1 mt-6 border-t-[6px] border-t-primary-main">
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-16 h-16 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center text-primary-main shadow-sm z-10 border border-slate-200 dark:border-slate-800">
                <FontAwesomeIcon icon={icon} className="w-8 h-8" />
            </div>

            <div className="pt-10 pb-6 px-6 flex flex-col flex-grow">
                <h3 className="text-lg md:text-xl font-bold font-heading text-slate-800 dark:text-slate-100 mb-3 leading-snug">
                    {title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-8 flex-grow font-sans">
                    {description}
                </p>

                <Link
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-primary-main hover:text-white dark:hover:bg-primary-main dark:hover:text-white text-slate-700 dark:text-slate-300 font-semibold rounded transition-colors tracking-wide text-sm flex items-center justify-center font-sans border border-slate-200 dark:border-slate-700"
                >
                    <span>{actionText}</span>
                </Link>
            </div>
        </div>
    );
}
