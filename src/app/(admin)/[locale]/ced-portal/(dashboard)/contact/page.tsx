"use client";

import { useTranslations } from "next-intl";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faHeadset,
    faEnvelope,
    faPhone,
    faLocationDot,
    faBuilding,
    faCode,
    faIdCard
} from "@fortawesome/free-solid-svg-icons";

export default function AdminContactPage() {
    const t = useTranslations("Admin.pages.contact");

    return (
        <div className="max-w-4xl space-y-8">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{t("title")}</h1>
                <p className="text-slate-500 dark:text-slate-400">{t("subtitle")}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Section 1: Support Channel */}
                <section className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border dark:border-slate-800 p-6 md:col-span-2">
                    <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-3">
                        <FontAwesomeIcon icon={faHeadset} className="text-indigo-500" />
                        {t("sections.support.title")}
                    </h2>
                    <div className="bg-indigo-50 dark:bg-indigo-900/20 p-5 rounded-lg border border-indigo-100 dark:border-indigo-800">
                        <p className="text-indigo-900 dark:text-indigo-200 leading-relaxed font-medium">
                            {t("sections.support.desc")}
                        </p>
                    </div>
                </section>

                {/* Section 2: Building & Dept Info */}
                <section className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border dark:border-slate-800 p-6 flex flex-col gap-4">
                    <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-3">
                        <FontAwesomeIcon icon={faBuilding} className="text-slate-400" />
                        {t("sections.info.title")}
                    </h2>
                    <ul className="space-y-4 text-slate-600 dark:text-slate-400">
                        <li className="flex items-start gap-3">
                            <FontAwesomeIcon icon={faBuilding} className="mt-1 text-slate-400 w-4" />
                            <div>
                                <p className="font-bold text-slate-800 dark:text-slate-200">{t("sections.info.dept")}</p>
                                <p className="text-sm">{t("sections.info.faculty")}</p>
                            </div>
                        </li>
                        <li className="flex items-start gap-3">
                            <FontAwesomeIcon icon={faLocationDot} className="mt-1 text-red-400 w-4" />
                            <p className="text-sm">{t("sections.info.location")}</p>
                        </li>
                    </ul>
                </section>

                {/* Section 3: Direct Contact */}
                <section className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border dark:border-slate-800 p-6 flex flex-col gap-4">
                    <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-3">
                        <FontAwesomeIcon icon={faEnvelope} className="text-slate-400" />
                        Communication
                    </h2>
                    <ul className="space-y-4 text-slate-600 dark:text-slate-400">
                        <li className="group">
                            <a href={`mailto:${t("sections.info.email")}`} className="flex items-center gap-3 hover:text-indigo-500 transition-colors">
                                <FontAwesomeIcon icon={faEnvelope} className="text-slate-400 group-hover:text-indigo-500 w-4" />
                                <span>{t("sections.info.email")}</span>
                            </a>
                        </li>
                        <li className="group">
                            <a href={`tel:${t("sections.info.phone")}`} className="flex items-center gap-3 hover:text-indigo-500 transition-colors">
                                <FontAwesomeIcon icon={faPhone} className="text-slate-400 group-hover:text-indigo-500 w-4" />
                                <span>{t("sections.info.phone")}</span>
                            </a>
                        </li>
                    </ul>
                </section>

                {/* Section 4: Developer Info */}
                <section className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border dark:border-slate-800 p-6 md:col-span-2">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-6 flex items-center gap-3">
                            <FontAwesomeIcon icon={faCode} className="text-teal-500" />
                            {t("sections.developer.title")}
                        </h2>
                        <div className="flex flex-col md:flex-row items-center gap-6 p-6 rounded-2xl bg-gradient-to-br from-slate-50 to-teal-50/30 dark:from-slate-800/50 dark:to-teal-900/10 border border-teal-100/50 dark:border-teal-900/30">
                            <div className="w-20 h-20 rounded-2xl bg-teal-500 flex items-center justify-center text-white text-3xl shadow-lg shadow-teal-500/20">
                                {t("sections.developer.dev1.alias")}
                            </div>
                            <div className="flex-1 space-y-4">
                                <div>
                                    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                                        {t("sections.developer.dev1.name")}
                                    </h3>
                                    <div className="flex items-center gap-2 mt-1 text-slate-500 dark:text-slate-400">
                                        <FontAwesomeIcon icon={faIdCard} className="text-slate-300 dark:text-slate-600" />
                                        <span className="text-sm font-mono">{t("sections.developer.dev1.id")}</span>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-4">
                                    <a href={`mailto:${t("sections.developer.dev1.email")}`}
                                        className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-teal-500 dark:hover:border-teal-500 hover:text-teal-600 transition-all shadow-sm">
                                        <FontAwesomeIcon icon={faEnvelope} className="text-slate-400" />
                                        <span className="text-sm font-medium">{t("sections.developer.dev1.email")}</span>
                                    </a>
                                    <a href={`tel:${t("sections.developer.dev1.phone")}`}
                                        className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-teal-500 dark:hover:border-teal-500 hover:text-teal-600 transition-all shadow-sm">
                                        <FontAwesomeIcon icon={faPhone} className="text-slate-400" />
                                        <span className="text-sm font-medium">{t("sections.developer.dev1.phone")}</span>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-4">
                        <div className="flex flex-col md:flex-row items-center gap-6 p-6 rounded-2xl bg-gradient-to-br from-slate-50 to-teal-50/30 dark:from-slate-800/50 dark:to-teal-900/10 border border-teal-100/50 dark:border-teal-900/30">
                            <div className="w-20 h-20 rounded-2xl bg-teal-500 flex items-center justify-center text-white text-3xl shadow-lg shadow-teal-500/20">
                                {t("sections.developer.dev2.alias")}
                            </div>
                            <div className="flex-1 space-y-4">
                                <div>
                                    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                                        {t("sections.developer.dev2.name")}
                                    </h3>
                                    <div className="flex items-center gap-2 mt-1 text-slate-500 dark:text-slate-400">
                                        <FontAwesomeIcon icon={faIdCard} className="text-slate-300 dark:text-slate-600" />
                                        <span className="text-sm font-mono">{t("sections.developer.dev2.id")}</span>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-4">
                                    <a href={`mailto:${t("sections.developer.dev2.email")}`}
                                        className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-teal-500 dark:hover:border-teal-500 hover:text-teal-600 transition-all shadow-sm">
                                        <FontAwesomeIcon icon={faEnvelope} className="text-slate-400" />
                                        <span className="text-sm font-medium">{t("sections.developer.dev2.email")}</span>
                                    </a>
                                    <a href={`tel:${t("sections.developer.dev2.phone")}`}
                                        className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-teal-500 dark:hover:border-teal-500 hover:text-teal-600 transition-all shadow-sm">
                                        <FontAwesomeIcon icon={faPhone} className="text-slate-400" />
                                        <span className="text-sm font-medium">{t("sections.developer.dev2.phone")}</span>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
