
"use client";

import { ActionButtons } from "@/components/admin/common/ActionButtons";
import { AddButton } from "@/components/admin/common/AddButton";
import { TRAINING_SEED } from "@/data/training";

import { useTranslations } from "next-intl";

export default function TrainingListPage() {
    const t = useTranslations("Admin.pages.training");
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{t("title")}</h1>
                    <p className="text-slate-500 dark:text-slate-400">{t("description")}</p>
                </div>
                <AddButton
                    href="/admin/training/create"
                    label={t("add")}
                />
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border dark:border-slate-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-800 border-b dark:border-slate-700 text-slate-600 dark:text-slate-200 text-sm uppercase tracking-wider">
                                <th className="p-4 font-semibold whitespace-nowrap">Title (TH)</th>
                                <th className="p-4 font-semibold whitespace-nowrap">Category</th>
                                <th className="p-4 font-semibold whitespace-nowrap">Date</th>
                                <th className="p-4 font-semibold text-right whitespace-nowrap">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {TRAINING_SEED.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                    <td className="p-4 min-w-[200px]">
                                        <div className="font-medium text-slate-900 dark:text-slate-100">{item.th.title}</div>
                                        <div className="text-xs text-slate-500 dark:text-slate-400">{item.en.title}</div>
                                    </td>
                                    <td className="p-4 text-sm text-slate-600 dark:text-slate-300 whitespace-nowrap">
                                        <div>{item.th.category}</div>
                                    </td>
                                    <td className="p-4 text-sm text-slate-600 dark:text-slate-300 whitespace-nowrap">
                                        {item.date}
                                    </td>
                                    <td className="p-4 text-right whitespace-nowrap">
                                        <ActionButtons
                                            editUrl={`/admin/training/${item.id}`}
                                            onDelete={() => { }} // Placeholder, no logic implemented in original
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
