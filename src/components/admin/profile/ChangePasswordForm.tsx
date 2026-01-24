"use client";

import { useState } from "react";
import Swal from "sweetalert2";
import { z } from "zod";
import { signOut } from "next-auth/react";
import SaveButton from '../common/SaveButton';
import { FormInput } from "@/components/admin/common/FormInputs";

import { useTranslations } from "next-intl";


export default function ChangePasswordForm() {
    const t = useTranslations("Admin.forms");
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);

    // Visibility States
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const changeSchema = z.object({
        currentPassword: z.string().min(1, t("changePassword.currentPasswordRequired")),
        newPassword: z.string().min(8, t("changePassword.newPasswordMinLength")),
        confirmPassword: z.string()
    }).refine((data) => data.newPassword === data.confirmPassword, {
        message: t("changePassword.passwordsDoNotMatch"),
        path: ["confirmPassword"],
    }).refine((data) => data.newPassword !== data.currentPassword, {
        message: t("changePassword.newPasswordMustBeDifferent"),
        path: ["newPassword"],
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const validation = changeSchema.safeParse({ currentPassword, newPassword, confirmPassword });
        if (!validation.success) {
            Swal.fire({
                icon: "warning",
                title: t("common.invalidInfoTitle"),
                text: validation.error.flatten().fieldErrors ? Object.values(validation.error.flatten().fieldErrors).flat()[0] : t("common.invalidInfoText"),
                confirmButtonColor: "#EF4444",
            });
            setLoading(false);
            return;
        }

        try {
            // [Fix] Add CSRF Token to headers
            const csrfToken = document.cookie
                .split("; ")
                .find((row) => row.startsWith("ced_csrf_token="))
                ?.split("=")[1];

            const res = await fetch("/api/auth/change-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-csrf-token": csrfToken || ""
                },
                body: JSON.stringify({ currentPassword, newPassword }),
            });

            const data = await res.json();

            if (res.ok) {
                await Swal.fire({
                    icon: "success",
                    title: t("common.successTitle"),
                    text: t("changePassword.successMessage"),
                    confirmButtonColor: "#35622F",
                    timer: 2000,
                    timerProgressBar: true
                });

                // Auto Logout
                await signOut({ callbackUrl: "/admin/login" });

            } else {
                Swal.fire({
                    icon: "error",
                    title: t("common.errorTitle"),
                    text: data.error || t("changePassword.errorMessage"),
                    confirmButtonColor: "#d33",
                });
            }
        } catch (error) {
            console.error("Change Password Error:", error);
            Swal.fire({
                icon: "error",
                title: t("common.errorTitle"),
                text: t("common.connectionError"),
                confirmButtonColor: "#d33",
            });
        } finally {
            setLoading(false);
        }
    };

    // Helper for Eye Icon
    // Helper for Eye Icon
    const ToggleButton = ({ isVisible, onClick }: { isVisible: boolean, onClick: () => void }) => (
        <button
            type="button"
            onClick={onClick}
            className="text-slate-400 hover:text-primary-main focus:outline-none transition-colors"
        >
            {isVisible ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                </svg>
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            )}
        </button>
    );

    return (
        <div className="bg-white dark:bg-slate-900 p-8 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">{t("changePassword.title")}</h3>
            <p className="text-sm text-slate-500 mb-8">{t("changePassword.subtitle")}</p>

            <form onSubmit={handleSubmit} className="space-y-6">
                <FormInput
                    label={t("changePassword.currentPassword")}
                    name="currentPassword"
                    type={showCurrent ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    suffix={<ToggleButton isVisible={showCurrent} onClick={() => setShowCurrent(!showCurrent)} />}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormInput
                        label={t("changePassword.newPassword")}
                        name="newPassword"
                        type={showNew ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        placeholder={t("changePassword.newPasswordPlaceholder")}
                        suffix={<ToggleButton isVisible={showNew} onClick={() => setShowNew(!showNew)} />}
                    />
                    <FormInput
                        label={t("changePassword.confirmPassword")}
                        name="confirmPassword"
                        type={showConfirm ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        suffix={<ToggleButton isVisible={showConfirm} onClick={() => setShowConfirm(!showConfirm)} />}
                    />
                </div>

                <div className="pt-2 flex justify-end">
                    <SaveButton
                        isLoading={loading}
                        label={t("changePassword.update")}
                        loadingLabel={t("common.saving")}
                    />
                </div>
            </form>
        </div>
    );
}
