"use client";

import { useState } from "react";
import Image from "next/image";
import Swal from "sweetalert2";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShieldHalved, faCheckCircle, faCopy, faExclamationTriangle, faQrcode } from "@fortawesome/free-solid-svg-icons";
import { useTranslations } from "next-intl";

interface TwoFactorSetupProps {
    isEnabled: boolean;
}

export default function TwoFactorSetup({ isEnabled: initialEnabled }: TwoFactorSetupProps) {
    const t = useTranslations("Admin.profile.twoFactor");
    const tAlert = useTranslations("Admin.alerts");
    const [isEnabled, setIsEnabled] = useState(initialEnabled);
    const [step, setStep] = useState<"idle" | "setup" | "verify" | "success">("idle");
    const [secret, setSecret] = useState<string>("");
    const [qrCode, setQrCode] = useState<string>("");
    const [otp, setOtp] = useState<string>("");
    const [backupCodes, setBackupCodes] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    // Step 1: Start Setup (Get Secret & QR)
    const handleStartSetup = async () => {
        setLoading(true);
        try {
            const csrfToken = document.cookie
                .split("; ")
                .find((row) => row.startsWith("ced_csrf_token="))
                ?.split("=")[1];

            const res = await fetch("/cedweb/api/auth/mfa/setup", {
                method: "POST",
                headers: {
                    "x-csrf-token": csrfToken || "",
                }
            });
            const data = await res.json();

            if (res.ok) {
                setSecret(data.secret);
                setQrCode(data.qrCode);
                setStep("setup");
            } else {
                throw new Error(data.error);
            }
        } catch {
            Swal.fire(tAlert("error"), tAlert("twoFactorSetupFailed"), "error");
        } finally {
            setLoading(false);
        }
    };

    // Step 2: Verify & Enable
    const handleVerify = async () => {
        if (otp.length !== 6) return;
        setLoading(true);
        try {
            const csrfToken = document.cookie
                .split("; ")
                .find((row) => row.startsWith("ced_csrf_token="))
                ?.split("=")[1];

            const res = await fetch("/cedweb/api/auth/mfa/enable", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-csrf-token": csrfToken || "",
                },
                body: JSON.stringify({ code: otp })
            });
            const data = await res.json();

            if (res.ok) {
                setBackupCodes(data.backupCodes);
                setIsEnabled(true);
                setStep("success");
                Swal.fire({
                    icon: "success",
                    title: tAlert("success"),
                    text: tAlert("updatedText"),
                    timer: 1500,
                    showConfirmButton: false
                });
            } else {
                Swal.fire(tAlert("error"), data.error || tAlert("twoFactorVerifyFailed"), "error");
            }
        } catch {
            Swal.fire(tAlert("error"), tAlert("twoFactorVerifyFailed"), "error");
        } finally {
            setLoading(false);
        }
    };

    // Step 3: Disable 2FA
    const handleDisable = async () => {
        const result = await Swal.fire({
        title: tAlert("deleteConfirmTitle"),
            text: tAlert("twoFactorDisableConfirmText"),
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#EF4444',
            cancelButtonColor: '#3085d6',
            confirmButtonText: tAlert("twoFactorDisableConfirmButton"),
            cancelButtonText: tAlert("cancelButton")
        });

        if (result.isConfirmed) {
            setLoading(true);
            try {
                const csrfToken = document.cookie
                    .split("; ")
                    .find((row) => row.startsWith("ced_csrf_token="))
                    ?.split("=")[1];

                const res = await fetch("/cedweb/api/auth/mfa/disable", {
                    method: "POST",
                    headers: {
                        "x-csrf-token": csrfToken || "",
                    }
                });
                const data = await res.json();

                if (res.ok) {
                    setIsEnabled(false);
                    setStep("idle");
                    setSecret("");
                    setQrCode("");
                    setOtp("");
                    setBackupCodes([]);
                    Swal.fire(tAlert("twoFactorDisabledTitle"), tAlert("twoFactorDisabled"), 'success');
                } else {
                    throw new Error(data.error);
                }
            } catch {
                Swal.fire(tAlert("error"), tAlert("twoFactorDisableFailed"), "error");
            } finally {
                setLoading(false);
            }
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        const toast = Swal.mixin({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 1000,
            timerProgressBar: true,
        });
        toast.fire({ icon: 'success', title: 'Copied!' });
    };

    // Render Logic
    if (isEnabled && step !== "success") {
        return (
            <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden text-slate-800 dark:text-slate-200">
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 flex justify-between items-center">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <FontAwesomeIcon icon={faShieldHalved} className="text-green-600" />
                        {t("title")}
                    </h3>
                    <span className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded dark:bg-green-900 dark:text-green-300">
                        {t("enabled")}
                    </span>
                </div>
                <div className="p-6">
                    <p className="text-slate-600 dark:text-slate-400 mb-4">
                        {t("description")}
                    </p>
                    <div className="flex gap-4">
                        <button
                            onClick={handleDisable}
                            disabled={loading}
                            className="text-red-500 hover:text-red-700 text-sm font-medium hover:underline transition-colors disabled:opacity-50"
                        >
                            {loading ? t("processing") : t("disable")}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden text-slate-800 dark:text-slate-200">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                    <FontAwesomeIcon icon={faShieldHalved} className="text-primary-main" />
                    {t("title")}
                </h3>
            </div>

            <div className="p-6">
                {step === "idle" && (
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div>
                            <p className="font-medium mb-1">
                                {t("title")}
                            </p>
                            <p className="text-slate-500 dark:text-slate-400 text-sm">
                                {t("setupDescription")}
                            </p>
                        </div>
                        <button
                            onClick={handleStartSetup}
                            disabled={loading}
                            className="bg-primary-main/90 hover:bg-primary-main text-white px-5 py-2 rounded-md font-medium transition-colors shadow-sm disabled:opacity-50"
                        >
                            {loading ? t("processing") : t("enable")}
                        </button>
                    </div>
                )}

                {step === "setup" && (
                    <div className="space-y-6">
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg flex items-start gap-3">
                            <FontAwesomeIcon icon={faQrcode} className="text-primary-main dark:text-blue-400 mt-1" />
                            <div>
                                <h4 className="font-semibold text-primary-main dark:text-blue-300 mb-1">{t("step1")}</h4>
                                <p className="text-primary-main dark:text-blue-400 text-sm">
                                    {t("step1Desc")}
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900/50">
                            {qrCode ? (
                                <Image src={qrCode} alt="2FA QR Code" width={200} height={200} className="rounded-lg shadow-sm" />
                            ) : (
                                <div className="w-48 h-48 bg-slate-200 animate-pulse rounded"></div>
                            )}
                            <div className="mt-4 text-center">
                                <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">{tAlert("orEnterManualCode")}</p>
                                <div className="flex items-center gap-2 bg-white dark:bg-slate-800 border px-3 py-1 rounded">
                                    <code className="text-sm font-mono text-slate-700 dark:text-slate-300 font-bold tracking-widest">
                                        {secret}
                                    </code>
                                    <button onClick={() => copyToClipboard(secret)} className="text-slate-400 hover:text-primary-main">
                                        <FontAwesomeIcon icon={faCopy} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg">
                            <h4 className="font-semibold mb-3">{t("step2")}</h4>
                            <div className="flex gap-2 max-w-xs">
                                <input
                                    type="text"
                                    maxLength={6}
                                    placeholder="000 000"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                    className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-center tracking-[0.5em] font-mono text-lg focus:ring-2 focus:ring-primary-main outline-none bg-white dark:bg-slate-800"
                                />
                                <button
                                    onClick={handleVerify}
                                    disabled={loading || otp.length !== 6}
                                    className="bg-primary-main hover:bg-primary-main/80 text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50"
                                >
                                    {t("verify")}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {step === "success" && (
                    <div className="space-y-6">
                        <div className="text-center py-6">
                            <FontAwesomeIcon icon={faCheckCircle} className="text-green-500 text-5xl mb-3" />
                            <h3 className="text-2xl font-bold">{t("success")}</h3>
                            <p className="text-slate-500 mt-2">{tAlert("accountProtected")}</p>
                        </div>

                        <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-4 rounded-r-lg">
                            <div className="flex items-start gap-3">
                                <FontAwesomeIcon icon={faExclamationTriangle} className="text-yellow-600 dark:text-yellow-400 mt-1" />
                                <div>
                                    <h4 className="font-bold text-yellow-800 dark:text-yellow-300">{t("backupCodesTitle")}</h4>
                                    <p className="text-yellow-700 dark:text-yellow-400 text-sm mt-1">
                                        {t("backupCodesDesc")}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-900 text-slate-200 p-6 rounded-lg font-mono text-sm grid grid-cols-2 gap-4 text-center">
                            {backupCodes.map((code, i) => (
                                <div key={i} className="tracking-widest hover:text-white transition-colors cursor-copy" onClick={() => copyToClipboard(code)}>
                                    {code}
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-center">
                            <button
                                onClick={() => copyToClipboard(backupCodes.join("\n"))}
                                className="text-primary-main hover:text-primary-main/80 font-medium flex items-center gap-2"
                            >
                                <FontAwesomeIcon icon={faCopy} /> {t("copyAll")}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
