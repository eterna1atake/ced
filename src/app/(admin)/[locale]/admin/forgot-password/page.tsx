"use client";

import { useState, useEffect, useRef } from "react";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import ReCAPTCHA from "react-google-recaptcha";

export default function ForgotPasswordPage() {
    const router = useRouter();
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [loading, setLoading] = useState(false);

    // Form States
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [captchaToken, setCaptchaToken] = useState<string | null>(null);

    // Timer States
    const [timeLeft, setTimeLeft] = useState(0); // seconds
    const [resendCooldown, setResendCooldown] = useState(0); // seconds
    const recaptchaRef = useRef<ReCAPTCHA>(null);

    // Password Visibility
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    // Countdown Logic
    useEffect(() => {
        if (timeLeft > 0) {
            const timer = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [timeLeft]);

    // Resend Cooldown Logic
    useEffect(() => {
        if (resendCooldown > 0) {
            const timer = setInterval(() => {
                setResendCooldown((prev) => prev - 1);
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [resendCooldown]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Step 1: Request OTP
    const handleRequestOTP = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();

        if (resendCooldown > 0) return;

        setLoading(true);

        try {
            const res = await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, captchaToken }),
            });

            const data = await res.json();

            if (res.ok) {
                await Swal.fire({
                    icon: "success",
                    title: "ส่ง OTP สำเร็จ",
                    text: "กรุณาตรวจสอบรหัส OTP 6 หลักในอีเมล (1 นาที)",
                    confirmButtonColor: "#35622F",
                    timer: 2000,
                    timerProgressBar: true
                });
                setTimeLeft(60); // 1 minute
                setResendCooldown(60); // 60s cooldown
                setStep(2);
                if (recaptchaRef.current) recaptchaRef.current.reset();
                setCaptchaToken(null);
            } else {
                Swal.fire({
                    icon: "error",
                    title: "ไม่สามารถส่ง OTP ได้",
                    text: data.error || "กรุณาตรวจสอบอีเมลอีกครั้ง",
                    confirmButtonColor: "#d33",
                });
            }
        } catch (error) {
            console.error(error);
            Swal.fire({
                icon: "error",
                title: "เกิดข้อผิดพลาด",
                text: "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้",
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

        if (timeLeft === 0) {
            Swal.fire({
                icon: "error",
                title: "OTP หมดอายุ",
                text: "กรุณากดส่งรหัส OTP ใหม่อีกครั้ง",
                confirmButtonColor: "#d33",
            });
            setLoading(false);
            return;
        }

        try {
            const res = await fetch("/api/auth/verify-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, otp }),
            });

            const data = await res.json();

            if (res.ok) {
                setStep(3); // Go to Password Reset Step
            } else {
                Swal.fire({
                    icon: "error",
                    title: "OTP ไม่ถูกต้อง",
                    text: data.error,
                    confirmButtonColor: "#d33",
                });
            }
        } catch (error) {
            console.error(error);
            Swal.fire({
                icon: "error",
                title: "เกิดข้อผิดพลาด",
                text: "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้",
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

    // Step 3: Reset Password
    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            Swal.fire({
                icon: "warning",
                title: "รหัสผ่านไม่ตรงกัน",
                text: "กรุณากรอกรหัสผ่านใหม่ให้ตรงกันทั้งสองช่อง",
                confirmButtonColor: "#EF4444",
            });
            return;
        }

        if (newPassword.length < 8) {
            Swal.fire({
                icon: "warning",
                title: "รหัสผ่านสั้นเกินไป",
                text: "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร",
                confirmButtonColor: "#EF4444",
            });
            return;
        }

        if (!captchaToken) {
            Swal.fire({
                icon: "warning",
                title: "กรุณายืนยันตัวตน",
                text: "โปรดติ๊กถูกที่ช่อง ReCAPTCHA",
                confirmButtonColor: "#EF4444",
            });
            return;
        }

        setLoading(true);

        try {
            const csrfToken = document.cookie
                .split("; ")
                .find((row) => row.startsWith("ced_csrf_token="))
                ?.split("=")[1];

            const res = await fetch("/api/auth/reset-with-otp", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-csrf-token": csrfToken || ""
                },
                body: JSON.stringify({ email, otp, newPassword, captchaToken }),
            });

            const data = await res.json();

            if (res.ok) {
                await Swal.fire({
                    icon: "success",
                    title: "เปลี่ยนรหัสผ่านสำเร็จ",
                    text: "คุณสามารถเข้าสู่ระบบด้วยรหัสผ่านใหม่ได้ทันที",
                    confirmButtonColor: "#35622F",
                });
                router.push("/admin/login");
            } else {
                Swal.fire({
                    icon: "error",
                    title: "เกิดข้อผิดพลาด",
                    text: data.error || "รหัส OTP ไม่ถูกต้องหรือหมดอายุ",
                    confirmButtonColor: "#d33",
                });
            }
        } catch (error) {
            console.error(error);
            Swal.fire({
                icon: "error",
                title: "เกิดข้อผิดพลาด",
                text: "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้",
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
                        src="/images/logo/logo_2.png"
                        alt="CED Logo"
                        width={180}
                        height={60}
                        className="mx-auto mb-4 object-contain"
                    />
                    <h1 className="text-2xl font-bold text-slate-800">กู้คืนรหัสผ่าน</h1>
                    <p className="text-slate-500 text-sm mt-1">
                        {step === 1 && "ระบุอีเมลเพื่อรับรหัสยืนยันตัวตน"}
                        {step === 2 && `กรอกรหัส OTP ที่ส่งไปยัง ${email}`}
                        {step === 3 && "ตั้งรหัสผ่านใหม่ของคุณ"}
                    </p>
                </div>

                {/* Progress Indicators */}
                <div className="flex justify-center mb-8 space-x-2">
                    <div className={`h-2 w-12 rounded-full transition-colors ${step >= 1 ? "bg-[#35622F]" : "bg-slate-200"}`} />
                    <div className={`h-2 w-12 rounded-full transition-colors ${step >= 2 ? "bg-[#35622F]" : "bg-slate-200"}`} />
                    <div className={`h-2 w-12 rounded-full transition-colors ${step >= 3 ? "bg-[#35622F]" : "bg-slate-200"}`} />
                </div>

                {step === 1 && (
                    <form onSubmit={handleRequestOTP} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">อีเมลผู้ใช้งาน</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#35622F] focus:border-transparent outline-none transition-all placeholder-slate-400"
                                placeholder="name@example.com"
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
                            disabled={loading || resendCooldown > 0 || !captchaToken}
                            className="w-full bg-[#35622F] text-white py-3 rounded-lg font-semibold hover:bg-[#2e5429] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md flex justify-center items-center gap-2"
                        >
                            {loading ? "กำลังตรวจสอบ..." : "ขอรหัส OTP"}
                            {resendCooldown > 0 && <span className="text-xs opacity-75">({resendCooldown}s)</span>}
                        </button>
                        <div className="flex justify-center mt-4">
                            <Link href="/admin/login" className="text-sm text-slate-500 hover:text-[#35622F] font-medium transition-colors">
                                ยกเลิก
                            </Link>
                        </div>
                    </form>
                )}

                {step === 2 && (
                    <form onSubmit={handleVerifyOTP} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="text-center bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                            <p className="text-yellow-800 text-sm font-medium">รหัสจะหมดอายุใน</p>
                            <p className="text-2xl font-mono font-bold text-yellow-900">{formatTime(timeLeft)}</p>
                        </div>

                        <div>
                            <div className="flex justify-center gap-2">
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
                                            if (!/^\d*$/.test(val)) return; // Only numbers

                                            const newOtp = otp.split("");
                                            newOtp[index] = val;
                                            const newOtpStr = newOtp.join("");
                                            setOtp(newOtpStr);

                                            // Auto-focus next
                                            if (val && index < 5) {
                                                const nextInput = document.getElementById(`otp-${index + 1}`);
                                                nextInput?.focus();
                                            }
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === "Backspace" && !otp[index] && index > 0) {
                                                const prevInput = document.getElementById(`otp-${index - 1}`);
                                                prevInput?.focus();
                                            }
                                        }}
                                        onPaste={(e) => {
                                            e.preventDefault();
                                            const pastedData = e.clipboardData.getData("text").slice(0, 6).replace(/\D/g, "");
                                            if (pastedData) {
                                                setOtp(pastedData);
                                                // Focus last filled
                                                const focusIndex = Math.min(pastedData.length, 5);
                                                document.getElementById(`otp-${focusIndex}`)?.focus();
                                            }
                                        }}
                                        className="w-12 h-14 rounded-lg border-2 border-slate-200 text-center text-xl font-bold text-slate-700 shadow-sm focus:border-[#35622F] focus:ring-4 focus:ring-[#35622F]/20 outline-none transition-all placeholder-slate-300"
                                        placeholder="•"
                                        required={index === 0} // Only first required essentially, validation handles rest
                                    />
                                ))}
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || timeLeft === 0}
                            className="w-full bg-[#35622F] text-white py-3 rounded-lg font-semibold hover:bg-[#2e5429] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                        >
                            {loading ? "กำลังตรวจสอบ..." : "ยืนยันรหัส OTP"}
                        </button>

                        <div className="text-center pt-2">
                            <button
                                type="button"
                                onClick={() => handleRequestOTP()}
                                disabled={loading || resendCooldown > 0}
                                className="text-sm text-[#5BA3AD] hover:text-[#35622F] font-medium hover:underline disabled:opacity-50 disabled:text-slate-400 disabled:no-underline"
                            >
                                {resendCooldown > 0 ? `ขอรหัสใหม่ได้ใน ${resendCooldown}s` : "ไม่ได้รับรหัส? ขอรหัส OTP ใหม่"}
                            </button>
                        </div>
                        <div className="flex justify-center mt-2">
                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                className="text-sm text-slate-400 hover:text-slate-600 font-medium transition-colors"
                            >
                                ย้อนกลับ
                            </button>
                        </div>
                    </form>
                )}

                {step === 3 && (
                    <form onSubmit={handleResetPassword} className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">รหัสผ่านใหม่</label>
                            <div className="relative">
                                <input
                                    type={showNew ? "text" : "password"}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#35622F] focus:border-transparent outline-none transition-all pr-12"
                                    placeholder="อย่างน้อย 8 ตัวอักษร"
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
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">ยืนยันรหัสผ่านใหม่</label>
                            <div className="relative">
                                <input
                                    type={showConfirm ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#35622F] focus:border-transparent outline-none transition-all pr-12"
                                    placeholder="ยืนยันรหัสผ่านอีกครั้ง"
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
                            {loading ? "กำลังเปลี่ยนรหัสผ่าน..." : "ยืนยันและเปลี่ยนรหัสผ่าน"}
                        </button>
                        <div className="flex justify-center mt-2">
                            <button
                                type="button"
                                onClick={() => setStep(1)} // Cancel strictly goes to start
                                className="text-sm text-slate-400 hover:text-slate-600 font-medium transition-colors"
                            >
                                ยกเลิก
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
