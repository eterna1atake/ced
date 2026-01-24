
"use client";

import { useEffect, useState } from 'react';

const SongkranEffect = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [particles, setParticles] = useState<any[]>([]);

    useEffect(() => {
        // Generate particles on mount
        const count = 30; // Number of items
        const items = Array.from({ length: count }, (_, i) => ({
            id: i,
            type: Math.random() > 0.5 ? '🌼' : '💧', // Mix of Jasmine flower and Water drop
            left: Math.random() * 100,
            duration: Math.random() * 5 + 5,
            delay: Math.random() * 5,
            opacity: Math.random() * 0.5 + 0.3,
            size: Math.random() * 20 + 20, // 20px - 40px
            startRotate: Math.random() * 360,
            endRotate: Math.random() * 360 + 360,
            sway: Math.random() * 100 - 50
        }));
        setParticles(items);
    }, []);

    return (
        <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden" aria-hidden="true">
            {particles.map((p) => (
                <div
                    key={p.id}
                    className="absolute top-[-50px] animate-fall-songkran"
                    style={{
                        left: `${p.left}%`,
                        fontSize: `${p.size}px`,
                        opacity: p.opacity,
                        animationDuration: `${p.duration}s`,
                        animationDelay: `${p.delay}s`,
                        // We use CSS variables to pass random values to keyframes if needed, 
                        // but here we'll use inline styles for static properties and specific keyframes for motion
                        transform: `rotate(${p.startRotate}deg)`
                    }}
                >
                    {p.type}
                </div>
            ))}

            <style jsx global>{`
                @keyframes fall-songkran {
                    0% {
                        transform: translateY(-5vh) translateX(0px) rotate(0deg);
                    }
                    50% {
                        transform: translateY(50vh) translateX(20px) rotate(180deg);
                    }
                    100% {
                        transform: translateY(105vh) translateX(-20px) rotate(360deg);
                    }
                }
                .animate-fall-songkran {
                    animation-name: fall-songkran;
                    animation-timing-function: linear;
                    animation-iteration-count: infinite;
                    will-change: transform;
                    text-shadow: 0 0 5px rgba(255,255,255,0.5);
                }
            `}</style>
        </div>
    );
};

export default SongkranEffect;
