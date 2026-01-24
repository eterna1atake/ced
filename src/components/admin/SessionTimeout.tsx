"use client";

import { useSession, signOut } from "next-auth/react";
import { useEffect, useRef } from "react";
import Swal from "sweetalert2";

// Config: Warning 60s before timeout
const TIMEOUT_MS = 15 * 60 * 1000; // 15 Minutes
const WARNING_MS = 60 * 1000;      // 60 Seconds

export default function SessionTimeout() {
    const { data: session, update } = useSession();
    // Use Ref for lastActivity to prevent re-renders on every mousemove
    const lastActivity = useRef(Date.now());

    useEffect(() => {
        if (!session) return;

        const checkTimer = setInterval(() => {
            const now = Date.now();
            const timeSinceActivity = now - lastActivity.current;
            const timeLeft = TIMEOUT_MS - timeSinceActivity;

            if (timeLeft <= 0) {
                // Timeout!
                clearInterval(checkTimer);
                Swal.close(); // Close warning if open

                Swal.fire({
                    icon: 'error',
                    title: 'หมดเวลาการใช้งาน',
                    text: 'กรุณาเข้าสู่ระบบใหม่',
                    confirmButtonText: 'ตกลง',
                    confirmButtonColor: '#35622F',
                    allowOutsideClick: false,
                    allowEscapeKey: false
                }).then(() => {
                    signOut({ callbackUrl: "/admin/login?error=SessionExpired" });
                });

            } else if (timeLeft <= WARNING_MS) {
                // Warning Zone
                if (!Swal.isVisible()) {
                    let timerInterval: NodeJS.Timeout;

                    Swal.fire({
                        icon: 'warning',
                        title: 'เซสชั่นกำลังจะหมดอายุ',
                        html: 'ระบบจะออกจากระบบอัตโนมัติใน <b></b> วินาที<br/>คลิก X เพื่ออยู่ในระบบต่อ',
                        showConfirmButton: false,
                        showCancelButton: false,
                        showCloseButton: true,
                        confirmButtonColor: '#35622F',
                        timer: timeLeft,
                        timerProgressBar: true,
                        didOpen: () => {
                            const container = Swal.getHtmlContainer();
                            if (container) {
                                const b = container.querySelector('b');
                                if (b) {
                                    // Initial set
                                    b.textContent = Math.ceil(Swal.getTimerLeft()! / 1000).toString();

                                    timerInterval = setInterval(() => {
                                        const remaining = Swal.getTimerLeft();
                                        if (remaining) {
                                            b.textContent = Math.ceil(remaining / 1000).toString();
                                        }
                                    }, 100);
                                }
                            }
                        },
                        willClose: () => {
                            clearInterval(timerInterval);
                        }
                    }).then((result) => {
                        // If closed by "Close Button" (X) -> Extend
                        if (result.dismiss === Swal.DismissReason.close) {
                            update();
                            lastActivity.current = Date.now();
                        }
                    });
                }
            } else {
                // Safe Zone: If user moved mouse (updated ref) while alert was shown? 
                // Actually the alert blocks interaction usually, but `allowOutsideClick` is default false.
                // So they can't move mouse to extend UNLESS they close the alert.
                // So we don't need to auto-close here.
            }
        }, 1000);

        const updateActivity = () => {
            lastActivity.current = Date.now();
        };

        window.addEventListener('mousemove', updateActivity);
        window.addEventListener('keydown', updateActivity);
        window.addEventListener('click', updateActivity);

        return () => {
            clearInterval(checkTimer);
            window.removeEventListener('mousemove', updateActivity);
            window.removeEventListener('keydown', updateActivity);
            window.removeEventListener('click', updateActivity);
        };
    }, [session, update]);

    return null;
}
