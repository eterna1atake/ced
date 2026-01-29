"use client";

import { useState } from "react";
import Image from "next/image";
import Swal from "sweetalert2";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShieldHalved, faCheckCircle, faCopy, faExclamationTriangle, faQrcode } from "@fortawesome/free-solid-svg-icons";

interface TwoFactorSetupProps {
    isEnabled: boolean;
}

export default function TwoFactorSetup({ isEnabled: initialEnabled }: TwoFactorSetupProps) {
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

            const res = await fetch("/api/auth/mfa/setup", {
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
            Swal.fire("Error", "Failed to start setup", "error");
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

            const res = await fetch("/api/auth/mfa/enable", {
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
                    title: "2FA Enabled",
                    text: "Your account is now more secure.",
                    timer: 1500,
                    showConfirmButton: false
                });
            } else {
                Swal.fire("Invaid Code", data.error || "Verification failed", "error");
            }
        } catch {
            Swal.fire("Error", "Verification failed", "error");
        } finally {
            setLoading(false);
        }
    };

    // Step 3: Disable 2FA
    const handleDisable = async () => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "Disabling 2FA will make your account less secure.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#EF4444',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, disable it!'
        });

        if (result.isConfirmed) {
            setLoading(true);
            try {
                const csrfToken = document.cookie
                    .split("; ")
                    .find((row) => row.startsWith("ced_csrf_token="))
                    ?.split("=")[1];

                const res = await fetch("/api/auth/mfa/disable", {
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
                    Swal.fire('Disabled!', 'Two-Factor Authentication has been disabled.', 'success');
                } else {
                    throw new Error(data.error);
                }
            } catch {
                Swal.fire("Error", "Failed to disable 2FA", "error");
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
            <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                        <FontAwesomeIcon icon={faShieldHalved} className="text-green-600" />
                        Two-Factor Authentication
                    </h3>
                    <span className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded dark:bg-green-900 dark:text-green-300">
                        Enabled
                    </span>
                </div>
                <div className="p-6">
                    <p className="text-slate-600 dark:text-slate-400 mb-4">
                        Your account is secured with Google Authenticator. You will need to enter a code from your authenticator app when logging in.
                    </p>
                    <div className="flex gap-4">
                        {/* TODO: Add "View Backup Codes" */}
                        <button
                            onClick={handleDisable}
                            disabled={loading}
                            className="text-red-500 hover:text-red-700 text-sm font-medium hover:underline transition-colors disabled:opacity-50"
                        >
                            {loading ? "Processing..." : "Disable 2FA"}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <FontAwesomeIcon icon={faShieldHalved} className="text-primary-main" />
                    Two-Factor Authentication
                </h3>
            </div>

            <div className="p-6">
                {step === "idle" && (
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div>
                            <p className="text-slate-700 dark:text-slate-300 font-medium mb-1">
                                Secure your account
                            </p>
                            <p className="text-slate-500 dark:text-slate-400 text-sm">
                                Use Google Authenticator or Authy to generate one-time codes for login.
                            </p>
                        </div>
                        <button
                            onClick={handleStartSetup}
                            disabled={loading}
                            className="bg-primary-main/90 hover:bg-primary-main text-white px-5 py-2 rounded-md font-medium transition-colors shadow-sm disabled:opacity-50"
                        >
                            {loading ? "Loading..." : "Enable 2FA"}
                        </button>
                    </div>
                )}

                {step === "setup" && (
                    <div className="space-y-6">
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg flex items-start gap-3">
                            <FontAwesomeIcon icon={faQrcode} className="text-primary-main dark:text-blue-400 mt-1" />
                            <div>
                                <h4 className="font-semibold text-primary-main dark:text-blue-300 mb-1">Step 1: Scan QR Code</h4>
                                <p className="text-primary-main dark:text-blue-400 text-sm">
                                    Open your authenticator app (e.g., Google Authenticator) and scan this QR code.
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
                                <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Or enter manual code</p>
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
                            <h4 className="font-semibold text-slate-700 dark:text-slate-300 mb-3">Step 2: Enter Verification Code</h4>
                            <div className="flex gap-2 max-w-xs">
                                <input
                                    type="text"
                                    maxLength={6}
                                    placeholder="000 000"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                    className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-center tracking-[0.5em] font-mono text-lg focus:ring-2 focus:ring-primary-main outline-none"
                                />
                                <button
                                    onClick={handleVerify}
                                    disabled={loading || otp.length !== 6}
                                    className="bg-primary-main hover:bg-primary-main/80 text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50"
                                >
                                    Verify
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {step === "success" && (
                    <div className="space-y-6">
                        <div className="text-center py-6">
                            <FontAwesomeIcon icon={faCheckCircle} className="text-green-500 text-5xl mb-3" />
                            <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">2FA Enabled Successfully!</h3>
                            <p className="text-slate-500 mt-2">Your account is now protected.</p>
                        </div>

                        <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-4 rounded-r-lg">
                            <div className="flex items-start gap-3">
                                <FontAwesomeIcon icon={faExclamationTriangle} className="text-yellow-600 dark:text-yellow-400 mt-1" />
                                <div>
                                    <h4 className="font-bold text-yellow-800 dark:text-yellow-300">IMPORTANT: Save Backup Codes</h4>
                                    <p className="text-yellow-700 dark:text-yellow-400 text-sm mt-1">
                                        If you lose your device, these codes are the ONLY way to access your account.
                                        Copy them to a safe place immediately. They will not be shown again.
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
                                <FontAwesomeIcon icon={faCopy} /> Copy All Codes
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
