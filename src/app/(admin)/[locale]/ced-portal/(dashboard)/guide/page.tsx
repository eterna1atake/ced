"use client";

import { useTranslations } from "next-intl";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faBook,
    faPenToSquare,
    faUsers,
    faGear,
    faShieldHalved,
    faLanguage,
    faServer,
    faCode
} from "@fortawesome/free-solid-svg-icons";

export default function AdminGuidePage() {
    const t = useTranslations("Admin.pages.guide");

    return (
        <div className="max-w-4xl space-y-8">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{t("title")}</h1>
                <p className="text-slate-500 dark:text-slate-400">{t("subtitle")}</p>
            </div>

            {/* Section 1: System Overview */}
            <section className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border dark:border-slate-800 p-6">
                <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                    <FontAwesomeIcon icon={faServer} className="text-blue-500" />
                    {t("systemOverview.title")}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h3 className="font-medium text-slate-900 dark:text-slate-300 mb-2 flex items-center gap-2">
                            <FontAwesomeIcon icon={faCode} className="text-slate-400 text-sm" />
                            {t("systemOverview.techStack.title")}
                        </h3>
                        <ul className="text-slate-600 dark:text-slate-400 text-sm space-y-1 list-disc pl-5">
                            <li>{t("systemOverview.techStack.framework")}</li>
                            <li>{t("systemOverview.techStack.ui")}</li>
                            <li>{t("systemOverview.techStack.db")}</li>
                            <li>{t("systemOverview.techStack.auth")}</li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-medium text-slate-900 dark:text-slate-300 mb-2 flex items-center gap-2">
                            <FontAwesomeIcon icon={faShieldHalved} className="text-slate-400 text-sm" />
                            {t("systemOverview.features.title")}
                        </h3>
                        <ul className="text-slate-600 dark:text-slate-400 text-sm space-y-1 list-disc pl-5">
                            <li>{t("systemOverview.features.bilingual")}</li>
                            <li>{t("systemOverview.features.security")}</li>
                            <li>{t("systemOverview.features.performance")}</li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* Section 2: Getting Started */}
            <section className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border dark:border-slate-800 p-6">
                <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                    <FontAwesomeIcon icon={faBook} className="text-indigo-500" />
                    {t("gettingStarted.title")}
                </h2>
                <div className="prose prose-slate dark:prose-invert max-w-none text-slate-600 dark:text-slate-400">
                    <p>{t("gettingStarted.intro")}</p>
                    <ul className="list-disc pl-5 space-y-2 mt-2">
                        <li>{t("gettingStarted.dashboard")}</li>
                        <li>{t("gettingStarted.sidebar")}</li>
                        <li>{t("gettingStarted.responsive")}</li>
                    </ul>
                </div>
            </section>

            {/* Section 3: Managing Content */}
            <section className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border dark:border-slate-800 p-6">
                <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                    <FontAwesomeIcon icon={faPenToSquare} className="text-emerald-500" />
                    {t("managingContent.title")}
                </h2>
                <div className="space-y-6">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800">
                        <h3 className="font-bold text-blue-900 dark:text-blue-200 mb-2 flex items-center gap-2">
                            <FontAwesomeIcon icon={faLanguage} />
                            {t("managingContent.bilingualGuide.title")}
                        </h3>
                        <p className="text-blue-800 dark:text-blue-300 text-sm mb-2">
                            {t("managingContent.bilingualGuide.desc")}
                        </p>
                        <ul className="text-blue-700 dark:text-blue-300 text-sm list-disc pl-5 space-y-1">
                            <li>{t("managingContent.bilingualGuide.point1")}</li>
                            <li>{t("managingContent.bilingualGuide.point2")}</li>
                        </ul>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="font-medium text-slate-900 dark:text-slate-300 mb-2">{t("managingContent.news.title")}</h3>
                            <p className="text-slate-600 dark:text-slate-400 text-sm">
                                {t("managingContent.news.desc")}
                            </p>
                        </div>
                        <div>
                            <h3 className="font-medium text-slate-900 dark:text-slate-300 mb-2">{t("managingContent.personnel.title")}</h3>
                            <p className="text-slate-600 dark:text-slate-400 text-sm">
                                {t("managingContent.personnel.desc")}
                            </p>
                        </div>
                        <div>
                            <h3 className="font-medium text-slate-900 dark:text-slate-300 mb-2">{t("managingContent.services.title")}</h3>
                            <p className="text-slate-600 dark:text-slate-400 text-sm">
                                {t("managingContent.services.desc")}
                            </p>
                        </div>
                        <div>
                            <h3 className="font-medium text-slate-900 dark:text-slate-300 mb-2">{t("managingContent.awards.title")}</h3>
                            <p className="text-slate-600 dark:text-slate-400 text-sm">
                                {t("managingContent.awards.desc")}
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Section 4: System & Security */}
            <section className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border dark:border-slate-800 p-6">
                <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                    <FontAwesomeIcon icon={faShieldHalved} className="text-amber-500" />
                    {t("systemSecurity.title")}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                        <h3 className="font-medium text-slate-900 dark:text-slate-300 mb-2 flex items-center gap-2">
                            <FontAwesomeIcon icon={faUsers} className="text-slate-400" />
                            {t("systemSecurity.userManagement.title")}
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400 text-sm">
                            {t("systemSecurity.userManagement.desc")}
                        </p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                        <h3 className="font-medium text-slate-900 dark:text-slate-300 mb-2 flex items-center gap-2">
                            <FontAwesomeIcon icon={faGear} className="text-slate-400" />
                            {t("systemSecurity.settings.title")}
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400 text-sm">
                            {t("systemSecurity.settings.desc")}
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
}
