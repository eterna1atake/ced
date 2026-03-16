"use client";

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell, faCheck, faSpinner } from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";
import { useTranslations } from "next-intl";

interface NotificationSettingsFormProps {
    initialEmail?: string;
    initialEnabled?: boolean;
}

export default function NotificationSettingsForm({
    initialEmail = "",
    initialEnabled = false,
}: NotificationSettingsFormProps) {
    const t = useTranslations("Admin.profile.notifications");
    const [email, setEmail] = useState(initialEmail);
    const [enabled, setEnabled] = useState(initialEnabled);
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        if (enabled && !email) {
            Swal.fire({
                icon: "warning",
                title: t("emailRequired"),
                text: t("emailRequiredText"),
                confirmButtonColor: "#35622F"
            });
            return;
        }

        setLoading(true);
        try {
            const csrfToken = document.cookie.split("; ").find(r => r.startsWith("ced_csrf_token="))?.split("=")[1];
            const res = await fetch("/api/ced-portal/profile/notification", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    ...(csrfToken ? { "x-csrf-token": csrfToken } : {}),
                },
                body: JSON.stringify({ notificationEmail: email, notificationEnabled: enabled }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || t("saveError"));
            }

            Swal.fire({
                icon: "success",
                title: t("saveSuccess"),
                text: data.message,
                confirmButtonColor: "#35622F",
                timer: 2000,
                showConfirmButton: false
            });
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : String(err);
            Swal.fire({
                icon: "error",
                title: t("saveError"),
                text: msg,
                confirmButtonColor: "#EF4444"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 flex items-center gap-2">
                <FontAwesomeIcon icon={faBell} className="text-primary-main" />
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                    {t("sectionTitle")}
                </h3>
            </div>
            <div className="p-6 space-y-5">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    {t("description")}
                </p>

                {/* Email Input */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        {t("emailLabel")}
                    </label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={!enabled}
                        placeholder="your-email@gmail.com"
                        className={`w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-main focus:border-transparent transition-all ${!enabled ? "opacity-50 bg-slate-100 dark:bg-slate-900/50 cursor-not-allowed" : ""}`}
                    />
                </div>

                {/* Toggle */}
                <div className="flex items-center gap-4">
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={enabled}
                            onChange={(e) => setEnabled(e.target.checked)}
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-main/20 dark:bg-slate-700 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-main"></div>
                    </label>
                    <div className="flex flex-col">
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            {t("toggleLabel")}
                        </span>
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${enabled ? "text-green-600" : "text-slate-400"}`}>
                            {enabled ? t("statusOn") : t("statusOff")}
                        </span>
                    </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end pt-2">
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="flex items-center gap-2 px-5 py-2 bg-primary-main text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-60 text-sm font-medium"
                    >
                        {loading
                            ? <><FontAwesomeIcon icon={faSpinner} className="animate-spin" /> {t("saving")}</>
                            : <><FontAwesomeIcon icon={faCheck} /> {t("saveButton")}</>
                        }
                    </button>
                </div>
            </div>
        </div>
    );
}
