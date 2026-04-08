
"use client";

import { useEffect, useState } from 'react';
import ChristmasSnow from '@/components/common/ChristmasSnow';

interface DynamicThemeProviderProps {
    children: React.ReactNode;
}

export default function DynamicThemeProvider({ children }: DynamicThemeProviderProps) {
    const [theme, setTheme] = useState<string>('default');
    const [snowEnabled, setSnowEnabled] = useState<boolean>(true); // From API
    const [userSnowDisabled, setUserSnowDisabled] = useState<boolean>(true); // Default true to prevent flash until loaded

    useEffect(() => {
        // Load user preference
        const storedPref = localStorage.getItem('snow-effect-disabled');
        setUserSnowDisabled(storedPref === 'true');

        const fetchTheme = async () => {
            try {
                const res = await fetch('/cedweb/api/public/settings', { cache: 'no-store' });
                if (res.ok) {
                    const data = await res.json();
                    setTheme(data.theme);
                    if (data.snowEnabled === false) {
                        setSnowEnabled(false);
                    } else {
                        setSnowEnabled(true);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch theme:", error);
            }
        };

        fetchTheme();
    }, []);

    const toggleSnow = () => {
        const newValue = !userSnowDisabled;
        setUserSnowDisabled(newValue);
        localStorage.setItem('snow-effect-disabled', String(newValue));
    };

    const showEffect = snowEnabled && !userSnowDisabled;

    return (
        <>
            {theme === 'christmas' && showEffect && <ChristmasSnow />}

            {/* Theme Toggle Button (Client-side only) */}
            {theme !== 'default' && theme !== 'grayscale' && snowEnabled && (
                <button
                    onClick={toggleSnow}
                    className="fixed bottom-4 right-4 z-[10000] bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-2 rounded-full shadow-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 transition-all flex items-center gap-2"
                    title={userSnowDisabled ? "Show Effect" : "Hide Effect"}
                >
                    {userSnowDisabled
                        ? '❄️ Show Snow'
                        : '🚫 Hide Snow'}
                </button>
            )}

            {/* Inject theme specific styles */}
            {theme === 'christmas' && (
                <style jsx global>{`
                    :root {
                        --color-primary: #D42426; /* Christmas Red */
                        --color-secondary: #165B33; /* Christmas Green */
                    }
                `}</style>
            )}
            {theme === 'grayscale' && (
                <style jsx global>{`
                    html {
                        filter: grayscale(1);
                    }
                `}</style>
            )}
            {children}
        </>
    );
}
