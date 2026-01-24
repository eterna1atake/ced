
"use client";

import { useEffect, useState } from 'react';

const ChristmasSnow = () => {
    const [snowflakes, setSnowflakes] = useState<number[]>([]);

    useEffect(() => {
        // Generate snowflakes on mount
        const count = 50; // Number of snowflakes
        const flakes = Array.from({ length: count }, (_, i) => i);
        setSnowflakes(flakes);
    }, []);

    return (
        <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden" aria-hidden="true">
            {snowflakes.map((i) => (
                <div
                    key={i}
                    className="absolute top-[-20px] text-slate-300 dark:text-white animate-fall drop-shadow-sm"
                    style={{
                        left: `${Math.random() * 100}%`,
                        animationDuration: `${Math.random() * 5 + 5}s`,
                        animationDelay: `${Math.random() * 5}s`,
                        opacity: Math.random() * 0.5 + 0.3,
                        fontSize: `${Math.random() * 25 + 20}px`, // Increased size (20px - 45px)
                    }}
                >
                    ❄
                </div>
            ))}
            {/* <style> block for global animation definition to avoid scoping issues with keyframes */}
            <style jsx global>{`
                @keyframes fall {
                    0% {
                        transform: translateY(-5vh) translateX(0px) rotate(0deg);
                    }
                    100% {
                        transform: translateY(105vh) translateX(20px) rotate(360deg);
                    }
                }
                .animate-fall {
                    animation-name: fall;
                    animation-timing-function: linear;
                    animation-iteration-count: infinite;
                    will-change: transform;
                }
            `}</style>
        </div>
    );
};

export default ChristmasSnow;
