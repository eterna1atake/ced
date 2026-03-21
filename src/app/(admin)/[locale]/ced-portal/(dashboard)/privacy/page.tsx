"use client";

import { useTranslations } from "next-intl";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faShieldHalved,
    faDatabase,
    faClock,
    faLock,
    faCloud
} from "@fortawesome/free-solid-svg-icons";

export default function AdminPrivacyPage() {
    const t = useTranslations("Admin.pages.privacy");

    return (
        <div className="max-w-4xl space-y-8">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{t("title")}</h1>
                <p className="text-slate-500 dark:text-slate-400">{t("subtitle")}</p>
            </div>

            <div className="grid grid-cols-1 gap-6">
                <section className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border dark:border-slate-800 p-6">
                    <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-3">
                        <FontAwesomeIcon icon={faDatabase} className="text-blue-500" />
                        {t("sections.dataCollection.title")}
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                        {t("sections.dataCollection.content")}
                    </p>
                </section>

                <section className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border dark:border-slate-800 p-6">
                    <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-3">
                        <FontAwesomeIcon icon={faClock} className="text-amber-500" />
                        {t("sections.logRetention.title")}
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                        {t("sections.logRetention.content")}
                    </p>
                </section>

                <section className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border dark:border-slate-800 p-6">
                    <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-3">
                        <FontAwesomeIcon icon={faLock} className="text-emerald-500" />
                        {t("sections.dataSecurity.title")}
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                        {t("sections.dataSecurity.content")}
                    </p>
                </section>

                <section className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border dark:border-slate-800 p-6">
                    <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-3">
                        <FontAwesomeIcon icon={faCloud} className="text-sky-500" />
                        {t("sections.cloudStorage.title")}
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                        {t("sections.cloudStorage.content")}
                    </p>
                </section>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                <p className="text-xs text-slate-500 dark:text-slate-400 text-center italic">
                    Last updated: March 2026 • Admin System Security Standards
                </p>
            </div>
        </div>
    );
}
