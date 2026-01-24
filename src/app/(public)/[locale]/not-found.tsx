"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function NotFound() {
    // Lock scroll on mount
    useEffect(() => {
        // Save original overflow style
        const originalStyle = window.getComputedStyle(document.body).overflow;
        document.body.style.overflow = "hidden";

        // Disable touch move (scrolling) on mobile
        const preventDefault = (e: TouchEvent) => e.preventDefault();
        document.addEventListener('touchmove', preventDefault, { passive: false });

        return () => {
            document.body.style.overflow = originalStyle;
            document.removeEventListener('touchmove', preventDefault);
        };
    }, []);

    return (
        <div className="fixed inset-0 z-[9999] w-screen h-[100dvh] bg-white text-[#171717] px-4 flex flex-col items-center justify-center overflow-hidden overscroll-none touch-none support-[height:100svh]:h-[100svh]">
            <div className="max-w-md w-full text-center space-y-8 md:space-y-8 relative z-10">

                {/* Error Code & Separator - Formal Style */}
                <div className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-6">
                    <span className="text-5xl md:text-6xl font-light text-primary-main tracking-tighter select-none">
                        404
                    </span>

                    {/* Divider: Hidden on mobile, visible on desktop */}
                    <div className="hidden md:block h-16 w-px bg-gray-200"></div>

                    <div className="text-center md:text-left space-y-1">
                        <h1 className="text-base md:text-lg font-semibold text-gray-900 uppercase tracking-widest select-none">
                            Page Not Found
                        </h1>
                        <p className="text-xs md:text-sm text-gray-500 font-light select-none">
                            ขออภัย ไม่พบหน้าที่ท่านต้องการ
                        </p>
                    </div>
                </div>

                {/* Formal Message */}
                <p className="text-gray-600 font-light leading-relaxed text-sm md:text-base border-t border-gray-100 pt-6 md:pt-8 mx-auto max-w-xs md:max-w-none select-none">
                    The requested resource could not be found via this server address.
                    Please check the URL for correctness or return to the homepage to navigate to the desired information.
                </p>

                {/* Action Button - Minimalist/Formal */}
                <div className="pt-2 md:pt-4">
                    <Link
                        href="/"
                        className="inline-flex items-center justify-center w-full md:w-auto px-8 py-3 text-sm font-medium tracking-wide text-white transition-colors duration-200 bg-primary-main rounded-none hover:bg-primary-hover shadow-sm select-none"
                    >
                        RETURN TO HOMEPAGE
                    </Link>
                </div>

            </div>

            {/* Footer Note - Very subtle */}
            <div className="absolute bottom-8 md:bottom-12 text-[10px] text-gray-300 uppercase tracking-widest text-center px-4 w-full select-none">
                CED System &bull; Secured Connection
            </div>
        </div>
    );
}
