"use client";
import { getCsrfToken } from "@/utils/cookie";
import { validatePassword } from "@/lib/password";

import { useState, useEffect, useRef } from "react";
import Swal from "sweetalert2";
import { useRouter } from "@/i18n/navigation";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import ReCAPTCHA from "react-google-recaptcha";
import { useTranslations } from "next-intl";

export default function ForgotPasswordPage() {
    const t = useTranslations("Admin.login");
    const router = useRouter();
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [loading, setLoading] = useState(false);

    // Form States
    const [username, setUsername] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [captchaToken, setCaptchaToken] = useState<string | null>(null);

    const recaptchaRef = useRef<ReCAPTCHA>(null);

    // Password Visibility
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    // Step 1: Check User & 2FA Status
    const handleCheckUser = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setLoading(true);

        try {
            const csrfToken = getCsrfToken();

            const res = await fetch("/cedweb/api/auth/forgot-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-csrf-token": csrfToken || "",
                },
                body: JSON.stringify({ username, captchaToken }),
            });

            const data = await res.json();

            if (res.ok) {
                await Swal.fire({
                    icon: "success",
                    title: t("accountFound"),
                    text: t("openApp"),
                    confirmButtonColor: "#35622F",
                    timer: 1500,
                    timerProgressBar: true
                });
                setStep(2);
                if (recaptchaRef.current) recaptchaRef.current.reset();
                setCaptchaToken(null);
            } else {
                Swal.fire({
                    icon: "error",
                    title: t("errorOccurred"),
                    text: data.error || t("accountNotFound"),
                    confirmButtonColor: "#d33",
                });
            }
        } catch (error) {
            console.error(error);
            Swal.fire({
                icon: "error",
                title: t("errorOccurred"),
                text: t("cannotConnectServer"),
                confirmButtonColor: "#d33",
            });
        } finally {
            setLoading(false);
        }
    };

    // Step 2: Verify OTP
    const handleVerifyOTP = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setLoading(true);

        if (otp.length !== 6) {
            setLoading(false);
            return;
        }

        try {
            const csrfToken = getCsrfToken();
            const res = await fetch("/cedweb/api/auth/verify-otp", {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "x-csrf-token": csrfToken || "",
                },
                body: JSON.stringify({ username, otp }),
            });

            const data = await res.json();

            if (res.ok && data.valid) {
                await Swal.fire({
                    icon: "success",
                    title: t("otpCorrect"),
                    text: t("setNewPasswordText"),
                    confirmButtonColor: "#35622F",
                    timer: 1000,
                    timerProgressBar: true,
                    showConfirmButton: false
                });
                setStep(3); // Go to Password Reset Step
            } else {
                Swal.fire({
                    icon: "error",
                    title: t("invalidOtp"),
                    text: data.error || "รหัส OTP ไม่ถูกต้อง หรือหมดอายุ",
                    confirmButtonColor: "#d33",
                });
                setOtp(""); // Clear invalid OTP
            }
        } catch (error) {
            console.error(error);
            Swal.fire({
                icon: "error",
                title: t("errorOccurred"),
                text: t("cannotConnectServer"),
                confirmButtonColor: "#d33",
            });
        } finally {
            setLoading(false);
        }
    };

    // Trigger auto-submit when OTP is full (6 digits)
    useEffect(() => {
        if (otp.length === 6 && step === 2) {
            void handleVerifyOTP();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [otp, step]);

    // Password Policy Checks for UI
    const passwordChecks = {
        length: newPassword.length >= 8,
        upper: /[A-Z]/.test(newPassword),
        lower: /[a-z]/.test(newPassword),
        number: /[0-9]/.test(newPassword),
        special: /[\W_]/.test(newPassword),
    };

    // Step 3: Reset Password
    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            Swal.fire({
                icon: "warning",
                title: t("passwordMismatchTitle"),
                text: t("passwordMismatchText"),
                confirmButtonColor: "#EF4444",
            });
            return;
        }

        const passwordVal = validatePassword(newPassword);
        if (!passwordVal.success) {
            Swal.fire({
                icon: "warning",
                title: "รหัสผ่านไม่ปลอดภัย",
                text: passwordVal.error,
                confirmButtonColor: "#EF4444",
            });
            return;
        }

        if (!captchaToken) {
            Swal.fire({
                icon: "warning",
                title: t("confirmCaptchaTitle"),
                text: t("confirmCaptchaText"),
                confirmButtonColor: "#EF4444",
            });
            return;
        }

        setLoading(true);

        try {
            const csrfToken = getCsrfToken();

            // Note: We send the OTP again because the backend needs to verify it before resetting.
            const res = await fetch("/cedweb/api/auth/reset-with-otp", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-csrf-token": csrfToken || ""
                },
                body: JSON.stringify({ username, otp, newPassword, captchaToken }),
            });

            const data = await res.json();

            if (res.ok) {
                await Swal.fire({
                    icon: "success",
                    title: t("resetSuccessTitle"),
                    text: t("resetSuccessText"),
                    confirmButtonColor: "#35622F",
                });
                router.push("/ced-portal/login");
            } else {
                Swal.fire({
                    icon: "error",
                    title: t("errorOccurred"),
                    text: data.error || t("resetErrorText"),
                    confirmButtonColor: "#d33",
                });

                if (data.error?.includes("OTP") || data.error?.includes("Authenticator")) {
                    setStep(2);
                    setOtp("");
                }
            }
        } catch (error) {
            console.error(error);
            Swal.fire({
                icon: "error",
                title: t("errorOccurred"),
                text: t("cannotConnectServer"),
                confirmButtonColor: "#d33",
            });
        } finally {
            setLoading(false);
            if (recaptchaRef.current) recaptchaRef.current.reset();
            setCaptchaToken(null);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans relative overflow-hidden">

            {/* Background Pattern */}
            <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
                <div className="absolute -top-20 -left-20 w-96 h-96 bg-[#35622F] rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#5BA3AD] rounded-full blur-3xl opacity-50"></div>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-100 relative z-10 transition-all">
                <div className="text-center mb-6">
                    <Image
                        src="/cedweb/images/logo/logo_2.png"
                        alt="CED Logo"
                        width={180}
                        height={60}
                        className="mx-auto mb-4 object-contain"
                        priority
                    />
                    <h1 className="text-2xl font-bold text-slate-800">{t("forgotPassword")}</h1>
                    <p className="text-slate-500 text-sm mt-1">
                        {step === 1 && t("aliasCheckSubtitle", { label: t("aliasLabel") })}
                        {step === 2 && t("otpSubtitle")}
                        {step === 3 && t("settingNewPassword")}
                    </p>
                </div>

                {/* Progress Indicators */}
                <div className="flex justify-center mb-8 space-x-2">
                    <div className={`h-2 w-16 rounded-full transition-colors ${step >= 1 ? "bg-[#35622F]" : "bg-slate-200"}`} />
                    <div className={`h-2 w-16 rounded-full transition-colors ${step >= 2 ? "bg-[#35622F]" : "bg-slate-200"}`} />
                    <div className={`h-2 w-16 rounded-full transition-colors ${step >= 3 ? "bg-[#35622F]" : "bg-slate-200"}`} />
                </div>

                {step === 1 && (
                    <form onSubmit={handleCheckUser} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">{t("aliasLabel")}</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#35622F] focus:border-transparent outline-none transition-all placeholder-slate-400 bg-white text-black"
                                placeholder="ced_master_admin"
                                required
                            />
                        </div>

                        <div className="flex justify-center scale-90 origin-center">
                            <ReCAPTCHA
                                ref={recaptchaRef}
                                sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ""}
                                onChange={(token) => setCaptchaToken(token)}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !captchaToken}
                            className="w-full bg-[#35622F] text-white py-3 rounded-lg font-semibold hover:bg-[#2e5429] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md flex justify-center items-center gap-2"
                        >
                            {loading ? t("verifying") : t("next")}
                        </button>
                        <div className="flex justify-center mt-4">
                            <Link href="/ced-portal/login" className="text-sm text-slate-500 hover:text-[#35622F] font-medium transition-colors">
                                {t("back")}
                            </Link>
                        </div>
                    </form>
                )}

                {step === 2 && (
                    <form onSubmit={handleVerifyOTP} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">{t("otpTitle")} (6 หลัก)</label>
                            <div className="flex justify-center gap-2 mb-2">
                                {[...Array(6)].map((_, index) => (
                                    <input
                                        key={index}
                                        id={`otp-${index}`}
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={1}
                                        value={otp[index] || ""}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            if (!/^\d*$/.test(val)) return;

                                            const newOtp = otp.split("");
                                            newOtp[index] = val;
                                            const newOtpStr = newOtp.join("");
                                            setOtp(newOtpStr);

                                            if (val && index < 5) {
                                                document.getElementById(`otp-${index + 1}`)?.focus();
                                            }
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === "Backspace" && !otp[index] && index > 0) {
                                                document.getElementById(`otp-${index - 1}`)?.focus();
                                            }
                                        }}
                                        onPaste={(e) => {
                                            e.preventDefault();
                                            const pastedData = e.clipboardData.getData("text").slice(0, 6).replace(/\D/g, "");
                                            if (pastedData) {
                                                setOtp(pastedData);
                                                const focusIndex = Math.min(pastedData.length, 5);
                                                document.getElementById(`otp-${focusIndex}`)?.focus();
                                            }
                                        }}
                                        className="w-10 h-12 sm:w-12 sm:h-14 rounded-lg border-2 border-slate-200 text-center text-xl font-bold text-slate-700 shadow-sm focus:border-[#35622F] focus:ring-4 focus:ring-[#35622F]/20 outline-none transition-all placeholder-slate-300 bg-white"
                                        placeholder="•"
                                        required={index === 0}
                                    />
                                ))}
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || otp.length !== 6}
                            className="w-full bg-[#35622F] text-white py-3 rounded-lg font-semibold hover:bg-[#2e5429] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                        >
                            {loading ? t("verifying") : t("verifyOtp")}
                        </button>

                        <div className="flex justify-center mt-2">
                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                className="text-sm text-slate-400 hover:text-slate-600 font-medium transition-colors"
                            >
                                {t("back")}
                            </button>
                        </div>
                    </form>
                )}

                {step === 3 && (
                    <form onSubmit={handleResetPassword} className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">{t("newPasswordLabel")}</label>
                            <div className="relative">
                                <input
                                    type={showNew ? "text" : "password"}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#35622F] focus:border-transparent outline-none transition-all pr-12 bg-white text-black"
                                    placeholder={t("passwordPlaceholder")}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNew(!showNew)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                                >
                                    {showNew ? (
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
                            </div>

                            {/* Password Checklist */}
                            <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
                                <div className={`flex items-center gap-1.5 ${passwordChecks.length ? "text-green-600" : "text-slate-400"}`}>
                                    <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center border ${passwordChecks.length ? "bg-green-100 border-green-500" : "border-slate-300"}`}>
                                        {passwordChecks.length && <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>}
                                    </div>
                                    ยาวอย่างน้อย 8 ตัว
                                </div>
                                <div className={`flex items-center gap-1.5 ${passwordChecks.upper ? "text-green-600" : "text-slate-400"}`}>
                                    <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center border ${passwordChecks.upper ? "bg-green-100 border-green-500" : "border-slate-300"}`}>
                                        {passwordChecks.upper && <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>}
                                    </div>
                                    ตัวพิมพ์ใหญ่ (A-Z)
                                </div>
                                <div className={`flex items-center gap-1.5 ${passwordChecks.lower ? "text-green-600" : "text-slate-400"}`}>
                                    <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center border ${passwordChecks.lower ? "bg-green-100 border-green-500" : "border-slate-300"}`}>
                                        {passwordChecks.lower && <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>}
                                    </div>
                                    ตัวพิมพ์เล็ก (a-z)
                                </div>
                                <div className={`flex items-center gap-1.5 ${passwordChecks.number ? "text-green-600" : "text-slate-400"}`}>
                                    <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center border ${passwordChecks.number ? "bg-green-100 border-green-500" : "border-slate-300"}`}>
                                        {passwordChecks.number && <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>}
                                    </div>
                                    มีตัวเลข (0-9)
                                </div>
                                <div className={`flex items-center gap-1.5 ${passwordChecks.special ? "text-green-600" : "text-slate-400"}`}>
                                    <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center border ${passwordChecks.special ? "bg-green-100 border-green-500" : "border-slate-300"}`}>
                                        {passwordChecks.special && <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>}
                                    </div>
                                    อักขระพิเศษ (!@#)
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">{t("confirmNewPasswordLabel")}</label>
                            <div className="relative">
                                <input
                                    type={showConfirm ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#35622F] focus:border-transparent outline-none transition-all pr-12 bg-white text-black"
                                    placeholder={t("confirmPasswordPlaceholder")}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirm(!showConfirm)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                                >
                                    {showConfirm ? (
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
                            </div>
                        </div>

                        <div className="flex justify-center scale-90 origin-center">
                            <ReCAPTCHA
                                ref={recaptchaRef}
                                sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ""}
                                onChange={(token) => setCaptchaToken(token)}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !captchaToken}
                            className="w-full bg-[#35622F] text-white py-3 rounded-lg font-semibold hover:bg-[#2e5429] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                        >
                            {loading ? t("resettingPassword") : t("confirmAndReset")}
                        </button>
                        <div className="flex justify-center mt-2">
                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                className="text-sm text-slate-400 hover:text-slate-600 font-medium transition-colors"
                            >
                                {t("back")}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}