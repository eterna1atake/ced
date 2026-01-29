"use client";

import { encryptPassword } from "@/lib/crypto-client";

import { useState, useEffect, Suspense, useRef } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import ReCAPTCHA from "react-google-recaptcha";
import Loading from "@/components/common/Loading";

import Swal from "sweetalert2";
import { z } from "zod";

function AdminLoginContent({ isTrustedDevice }: { isTrustedDevice: boolean }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get("callbackUrl") || "/admin";

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [captchaToken, setCaptchaToken] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [publicKey, setPublicKey] = useState<string | null>(null);

    // Fetch Public Key on Mount
    useEffect(() => {
        fetch("/api/auth/public-key")
            .then(res => res.json())
            .then(data => {
                if (data.publicKey) {
                    setPublicKey(data.publicKey);
                } else {
                    console.error("Failed to load public key");
                }
            })
            .catch(err => console.error("Error loading public key:", err));
    }, []);

    // Create a ref for the ReCAPTCHA widget
    const recaptchaRef = useRef<ReCAPTCHA>(null);

    // Rate Limit State
    const [blockedSeconds, setBlockedSeconds] = useState(0);

    // Countdown Timer for Rate Limit
    useEffect(() => {
        if (blockedSeconds > 0) {
            const timer = setInterval(() => {
                setBlockedSeconds((prev) => Math.max(0, prev - 1));
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [blockedSeconds]);



    // Helper to format time friendly
    const formatTime = (totalSeconds: number) => {
        if (totalSeconds < 60) return `${totalSeconds} วินาที`;

        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        const parts = [];
        if (hours > 0) parts.push(`${hours} ชั่วโมง`);
        if (minutes > 0) parts.push(`${minutes} นาที`);
        if (seconds > 0 || parts.length === 0) parts.push(`${seconds} วินาที`);

        return parts.join(' ');
    };

    // Handle initial Rate Limit error from URL (if redirected)
    useEffect(() => {
        const urlError = searchParams.get("error");
        if (urlError === "RateLimit") {
            setError("ทำรายการเกินกำหนด กรุณารอสักครู่");
        } else if (urlError === "SessionExpired") {
            // signOut({ redirect: false }).then(() => {
            //     console.log("Stale session cleared");
            // });

            setError("เซสชั่นหมดอายุ กรุณาเข้าสู่ระบบใหม่");
            Swal.fire({
                icon: 'warning',
                title: 'เซสชั่นหมดอายุ',
                text: 'กรุณาเข้าสู่ระบบใหม่อีกครั้ง',
                confirmButtonColor: '#35622F',
                confirmButtonText: 'ตกลง'
            });
        }
    }, [searchParams]);

    // Validation Schema
    const loginSchema = z.object({
        email: z.string()
            .email("รูปแบบอีเมลไม่ถูกต้อง")
            .regex(/^[a-zA-Z0-9.@_-]+$/, "อีเมลมีตัวอักษรที่ไม่ได้รับอนุญาต"), // Stricter check for XSS prevention
        password: z.string().min(1, "กรุณากรอกรหัสผ่าน")
    });

    const [otp, setOtp] = useState<string[]>(new Array(6).fill(""));
    const [isTwoFactor, setIsTwoFactor] = useState(false);

    const [isBackupCode, setIsBackupCode] = useState(false); // [New] Backup Code Mode
    const [backupCodeInput, setBackupCodeInput] = useState(""); // [New] Backup Code Input
    const [trustDevice, setTrustDevice] = useState(isTrustedDevice); // [New] Trust Device State

    // Helper for OTP Input
    const handleOtpChange = (element: HTMLInputElement, index: number) => {
        if (isNaN(Number(element.value))) return false;

        const newOtp = [...otp];
        newOtp[index] = element.value;
        setOtp(newOtp);

        // Focus next input
        if (element.value && element.nextSibling) {
            (element.nextSibling as HTMLInputElement).focus();
        }
    };

    const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData("text").trim();

        // If in backup code mode or it looks like a backup code (8 chars alphanumeric), handled differently? 
        // No, this handler is for the 6-box input.

        const chars = pastedData.slice(0, 6).split("");
        if (chars.every(char => !isNaN(Number(char)))) {
            const newOtp = [...otp];
            chars.forEach((char, index) => {
                if (index < 6) newOtp[index] = char;
            });
            setOtp(newOtp);
            const focusIndex = Math.min(chars.length, 5);
            const inputs = document.querySelectorAll('input[name^="otp-"]');
            if (inputs[focusIndex]) (inputs[focusIndex] as HTMLInputElement).focus();
        }
    };

    const handleOtpKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === "Backspace") {
            if (!otp[index] && index > 0) {
                const newOtp = [...otp];
                newOtp[index - 1] = "";
                setOtp(newOtp);
                const inputs = document.querySelectorAll('input[name^="otp-"]');
                if (inputs[index - 1]) (inputs[index - 1] as HTMLInputElement).focus();
            } else {
                const newOtp = [...otp];
                newOtp[index] = "";
                setOtp(newOtp);
            }
        }
    };


    // Auto-submit OTP when filled (only in standard OTP mode)
    useEffect(() => {
        if (isTwoFactor && !isBackupCode && otp.every(digit => digit !== "") && otp.length === 6 && !loading) {
            handleSubmit();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [otp, isTwoFactor, isBackupCode, loading]);

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setLoading(true);
        setError(null);

        // 0. Validate Inputs
        if (!isTwoFactor) {
            const validation = loginSchema.safeParse({ email, password });
            if (!validation.success) {
                const fieldErrors = validation.error.flatten().fieldErrors;
                const errorMessage = Object.values(fieldErrors).flat()[0] || "ข้อมูลไม่ถูกต้อง";
                setError(errorMessage);
                Swal.fire({
                    icon: "warning",
                    title: "ข้อมูลไม่ถูกต้อง",
                    text: errorMessage,
                    confirmButtonColor: "#EF4444",
                });
                setLoading(false);
                return;
            }
        } else {
            // 2FA Validation
            if (isBackupCode) {
                if (!backupCodeInput || backupCodeInput.length < 8) { // Assuming 8 chars
                    setError("กรุณากรอกรหัส Backup Code ให้ถูกต้อง");
                    setLoading(false);
                    return;
                }
            } else {
                if (otp.join("").length !== 6) {
                    setError("กรุณากรอกรหัส OTP ให้ครบ 6 หลัก");
                    setLoading(false);
                    return;
                }
            }
        }

        try {
            // 1. Pre-check Rate Limit via API (Only for initial login)
            if (!isTwoFactor) {
                const checkRes = await fetch("/api/auth/check-rate-limit", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email }),
                });
                const status = await checkRes.json();

                if (status.blocked) {
                    console.log(`[DEBUG] Pre-check blocked: ${status.seconds} seconds, Reason: ${status.reason}`);
                    setBlockedSeconds(status.seconds);
                    const timeStr = formatTime(status.seconds);

                    let title = "ถูกระงับการใช้งาน";
                    let msg = `คุณทำรายการผิดพลาดเกินกำหนด ระบบระงับการใช้งานเป็นเวลา ${timeStr}`;

                    if (status.reason === "AccountLocked") {
                        title = "บัญชีถูกระงับชั่วคราว";
                        msg = `บัญชีนี้ถูกระงับชั่วคราวเนื่องจากพยายามเข้าระบบผิดหลายครั้ง กรุณารอ ${timeStr}`;
                    }

                    setError(msg);

                    Swal.fire({
                        icon: "error",
                        title: title,
                        text: msg,
                        confirmButtonColor: "#35622F",
                        timer: status.seconds * 1000,
                        timerProgressBar: true,
                    });

                    setLoading(false);
                    return;
                }
            }

            // 2. Proceed to Login
            const codeToSend = isTwoFactor
                ? (isBackupCode ? backupCodeInput : otp.join(""))
                : "";

            let passwordToSend = password;

            // Encrypt Password if public key is available (Always)
            if (publicKey) {
                try {
                    passwordToSend = await encryptPassword(password, publicKey);
                } catch (e) {
                    console.error("Encryption failed, falling back to plaintext (will fail on server)", e);
                    setError("เกิดข้อผิดพลาดในการเข้ารหัสข้อมูล");
                    setLoading(false);
                    return;
                }
            }

            const result = await signIn("credentials", {
                redirect: false,
                email,
                password: passwordToSend, // Send Encrypted Password
                captchaToken: isTwoFactor ? "" : captchaToken, // Captcha only needed for step 1
                code: codeToSend,
                trustDevice: String(trustDevice), // [New] Pass trust flag
                callbackUrl,
            });

            console.log("[DEBUG] Login Result:", result);

            if (result?.error) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const errCode = (result as any)?.code || result?.error || "";

                if (errCode.startsWith("2FA_REQUIRED")) {
                    // Default to TOTP always
                    setIsTwoFactor(true);
                    setLoading(false);

                    return;
                }

                if (result.error.startsWith("RateLimit:Block:")) {
                    const seconds = parseInt(result.error.split(":")[2] || "60");
                    console.log(`[DEBUG] Login failed blocked: ${seconds} seconds`);
                    setBlockedSeconds(seconds);
                    const timeStr = formatTime(seconds);
                    const msg = `คุณทำรายการผิดพลาดเกินกำหนด ระบบระงับการใช้งานเป็นเวลา ${timeStr}`;
                    setError(msg);

                    Swal.fire({
                        icon: "error",
                        title: "ถูกระงับการใช้งาน",
                        text: msg,
                        confirmButtonColor: "#35622F",
                        timer: seconds * 1000,
                        timerProgressBar: true
                    });

                } else if (result.error.startsWith("AccountLocked:")) {
                    const seconds = parseInt(result.error.split(":")[1] || "0");
                    console.log(`[DEBUG] Account locked: ${seconds} seconds`);
                    // We can reuse the "blocked" state to show the countdown
                    setBlockedSeconds(seconds);
                    const timeStr = formatTime(seconds);
                    const msg = `บัญชีถูกระงับชั่วคราวเนื่องจากพยายามเข้าระบบผิดหลายครั้ง กรุณารอ ${timeStr}`;
                    setError(msg);

                    Swal.fire({
                        icon: "error",
                        title: "บัญชีถูกระงับชั่วคราว",
                        text: msg,
                        confirmButtonColor: "#35622F",
                        timer: seconds * 1000,
                        timerProgressBar: true
                    });

                } else

                    if (errCode === "OTP Expired" || errCode === "Invalid OTP" || errCode.startsWith("Invalid OTP")) {
                        const isExpired = errCode === "OTP Expired";
                        const msg = isExpired ? "รหัส OTP หมดอายุ" : "รหัส OTP ไม่ถูกต้อง";
                        setError(msg);
                        Swal.fire({
                            icon: "error",
                            title: msg,
                            text: "กรุณาตรวจสอบรหัสแล้วลองใหม่อีกครั้ง",
                            confirmButtonColor: "#d33",
                        }).then(() => {
                            // Clear OTP to prevent infinite auto-submit loop
                            setOtp(new Array(6).fill(""));
                            setBackupCodeInput(""); // Clear backup code too
                            setLoading(false);
                        });
                        return;
                    } else if (result.error.startsWith("InvalidCredentials") || result.error === "CredentialsSignin") {
                        // Extract remaining attempts if available
                        // ... (existing logic)
                        const parts = result.error.split(":");
                        let remainingMsg = "";
                        if (parts.length > 1) {
                            const remaining = parseInt(parts[1]);
                            if (!isNaN(remaining)) remainingMsg = ` (เหลือโอกาสอีก ${remaining} ครั้ง)`;
                        }

                        const msg = isTwoFactor ? "รหัส OTP ไม่ถูกต้อง" : `อีเมลหรือรหัสผ่านไม่ถูกต้อง${remainingMsg}`;
                        setError(msg);
                        Swal.fire({
                            icon: "error",
                            title: "เข้าสู่ระบบไม่สำเร็จ",
                            text: msg,
                            confirmButtonText: "ตกลง"
                        }).then(() => {
                            if (isTwoFactor) {
                                setOtp(new Array(6).fill(""));
                                setBackupCodeInput("");
                            }
                        });
                    } else {
                        const msg = "เกิดข้อผิดพลาด กรุณาลองใหม่";
                        setError(msg);
                        Swal.fire({
                            icon: "error",
                            title: "ข้อผิดพลาด",
                            text: `${msg} (${result?.error})`,
                            confirmButtonColor: "#d33"
                        });
                    }
                setLoading(false);
            } else {
                Swal.fire({
                    icon: "success",
                    title: "เข้าสู่ระบบสำเร็จ",
                    text: "กำลังเข้าสู่หน้าผู้ดูแลระบบ...",
                    showConfirmButton: false,
                    timer: 1500,
                    timerProgressBar: true
                }).then(() => {
                    router.push(callbackUrl);
                    router.refresh();
                });
            }
        } catch (err) {
            console.error("Login Error:", err);
            setError("เกิดข้อผิดพลาดในการเชื่อมต่อ");
            setLoading(false);
        } finally {
            // Force Reset Captcha after every attempt
            if (recaptchaRef.current) {
                recaptchaRef.current.reset();
            }
            if (!isTwoFactor) setCaptchaToken(null);
        }
    };

    const isBlocked = blockedSeconds > 0;



    // UI Helpers
    const getPageTitle = () => {
        if (!isTwoFactor) return "เข้าสู่ระบบผู้ดูแลระบบ";
        return isBackupCode ? "ยืนยันด้วยรหัสสำรอง" : "ยืนยันตัวตน (2FA)";
    };

    const getPageSubtitle = () => {
        if (!isTwoFactor) return "CED Website Administration";
        if (isBackupCode) return "กรอกรหัสสำรอง 8 หลัก (Backup Code)";
        return "กรอกรหัส 6 หลักจากแอป Authenticator";
    };


    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden font-sans">
            {/* Background Pattern */}
            <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
                <div className="absolute -top-20 -left-20 w-96 h-96 bg-[#35622F] rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#5BA3AD] rounded-full blur-3xl opacity-50"></div>
            </div>

            <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 relative z-10 border-t-8 border-[#35622F]">

                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-24 h-24 mb-4">
                        <Image
                            src="/images/logo/logo_2.png"
                            alt="CED Logo"
                            width={100}
                            height={100}
                            className="w-full h-full object-contain"
                        />
                    </div>
                    <h1 className="text-2xl font-bold text-[#35622F]">
                        {getPageTitle()}
                    </h1>
                    <p className="text-slate-500 text-sm mt-2">
                        {getPageSubtitle()}
                    </p>
                </div>

                {(error || isBlocked) && (
                    <div className={`mb-6 p-4 border-l-4 rounded-r-md text-sm flex items-start shadow-sm ${isBlocked ? "bg-red-50 border-red-600 text-red-700" : "bg-red-50 border-red-600 text-red-700"
                        }`}>
                        <svg className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        <span className="font-semibold">
                            {isBlocked
                                ? `คุณทำรายการผิดพลาดเกินกำหนด ระบบระงับการใช้งานเป็นเวลา ${formatTime(blockedSeconds)} (กำลังนับถอยหลัง)`
                                : error}
                        </span>
                    </div>
                )}

                <form className="space-y-6" onSubmit={handleSubmit}>

                    {!isTwoFactor ? (
                        /* Step 1: Email & Password */
                        <>
                            <div>
                                <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">
                                    อีเมล (Email)
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-4 py-3 rounded-md border border-slate-300 focus:ring-2 focus:ring-[#5BA3AD] focus:border-transparent outline-none transition-all placeholder-slate-400 bg-slate-50 focus:bg-white disabled:bg-gray-100 disabled:text-gray-400 text-black"
                                    placeholder="example@ced.kmutnb.ac.th"
                                    required
                                    disabled={loading || isBlocked}
                                />
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-2">
                                    รหัสผ่าน (Password)
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        id="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full px-4 py-3 rounded-md border border-slate-300 focus:ring-2 focus:ring-[#5BA3AD] focus:border-transparent outline-none transition-all placeholder-slate-400 bg-slate-50 focus:bg-white disabled:bg-gray-100 disabled:text-gray-400 pr-10 text-black"
                                        placeholder="••••••••"
                                        required
                                        disabled={loading || isBlocked}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                                    >
                                        {showPassword ? (
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
                                <div className="flex justify-between items-center mt-2">
                                    <label className="flex items-center space-x-2 text-sm text-slate-600 cursor-pointer select-none">
                                        <input
                                            type="checkbox"
                                            checked={trustDevice}
                                            onChange={(e) => setTrustDevice(e.target.checked)}
                                            className="w-4 h-4 text-[#35622F] border-slate-300 rounded focus:ring-[#35622F] cursor-pointer accent-[#35622F]"
                                            disabled={loading || isBlocked}
                                        />
                                        <span>จำไว้ในระบบ</span>
                                    </label>
                                    <Link href="/admin/forgot-password" className="text-xs text-[#5BA3AD] hover:text-[#35622F] hover:underline transition-colors">
                                        ลืมรหัสผ่าน
                                    </Link>
                                </div>
                            </div>

                            <div className="flex justify-center my-4">
                                <ReCAPTCHA
                                    ref={recaptchaRef}
                                    sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ""}
                                    onChange={(token) => setCaptchaToken(token)}
                                />
                            </div>

                        </>
                    ) : (
                        /* Step 2: OTP / Backup Code */
                        <div className="space-y-4">
                            <div className="text-center text-sm text-slate-600 mb-4">
                                รหัสอ้างอิง: <span className="font-mono bg-slate-100 px-2 py-1 rounded">LOGIN-2FA</span>
                                <br />
                                {isBackupCode ? (
                                    <span className="text-xs text-slate-400">กรอกรหัสสำรองของคุณ</span>
                                ) : (
                                    <span className="text-xs text-slate-400">เปิดแอป Authenticator เพื่อดูรหัส</span>
                                )}
                            </div>

                            {isBackupCode ? (
                                /* Backup Code Input */
                                <input
                                    type="text"
                                    value={backupCodeInput}
                                    onChange={(e) => setBackupCodeInput(e.target.value.trim())}
                                    className="w-full px-4 py-3 text-center text-lg font-bold tracking-widest rounded-md border border-slate-300 focus:ring-2 focus:ring-[#5BA3AD] focus:border-transparent outline-none transition-all placeholder-slate-300 bg-white text-slate-700"
                                    placeholder="XXXXXXXX"
                                    maxLength={16} // Allow some room
                                    disabled={loading}
                                />
                            ) : (
                                /* Standard 6-digit OTP */
                                <div className="flex justify-center gap-2">
                                    {otp.map((digit, index) => (
                                        <input
                                            key={index}
                                            name={`otp-${index}`}
                                            type="text"
                                            maxLength={1}
                                            value={digit}
                                            onChange={(e) => handleOtpChange(e.target, index)}
                                            onKeyDown={(e) => handleOtpKeyDown(e, index)}
                                            onPaste={handleOtpPaste}
                                            disabled={loading}
                                            className="w-10 h-12 text-center text-xl font-bold border rounded-md focus:border-[#5BA3AD] focus:ring-1 focus:ring-[#5BA3AD] outline-none transition-colors bg-white text-slate-700 disabled:bg-slate-50"
                                        />
                                    ))}
                                </div>
                            )}

                            <div className="flex justify-between items-center text-xs mt-2 px-1">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsTwoFactor(false);
                                        setOtp(new Array(6).fill(""));
                                        setBackupCodeInput("");
                                        setIsBackupCode(false);
                                        setError(null);
                                    }}
                                    className="text-slate-400 hover:text-slate-600 underline"
                                >
                                    ย้อนกลับ
                                </button>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsBackupCode(!isBackupCode);
                                        setError(null);
                                    }}
                                    className="text-[#5BA3AD] hover:text-[#35622F] hover:underline cursor-pointer"
                                >
                                    {isBackupCode ? "ใช้อุปกรณ์ยืนยันตัวตน" : "ใช้รหัสสำรอง (Backup Code)"}
                                </button>
                            </div>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading || isBlocked || (!isTwoFactor && !captchaToken)}
                        className="w-full bg-[#35622F] hover:bg-[#2e5429] text-white font-bold py-3 rounded-md shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex justify-center items-center"
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                {isTwoFactor ? "ตรวจสอบรหัส..." : "เข้าสู่ระบบ..."}
                            </>
                        ) : isBlocked ? (
                            `กรุณารอ ${formatTime(blockedSeconds)}`
                        ) : (
                            isTwoFactor ? "ยืนยันรหัส OTP" : "เข้าสู่ระบบ"
                        )}
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                    <p className="text-xs text-slate-400">
                        &copy; {new Date().getFullYear()} CED KMUTNB. สงวนลิขสิทธิ์<br />
                        <span className="text-slate-300">ระบบสารสนเทศเพื่อการบริหารจัดการ</span>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function LoginForm({ isTrustedDevice }: { isTrustedDevice: boolean }) {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loading />
            </div>
        }>
            <AdminLoginContent isTrustedDevice={isTrustedDevice} />
        </Suspense>
    );
}

