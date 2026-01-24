
"use client";

import { useEffect, useState } from 'react';
import ChristmasSnow from '@/components/common/ChristmasSnow';
import SongkranEffect from '@/components/common/SongkranEffect';

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
                const res = await fetch('/api/public/settings', { cache: 'no-store' });
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
            {theme === 'songkran' && showEffect && <SongkranEffect />}

            {/* Theme Toggle Button (Client-side only) */}
            {theme !== 'default' && snowEnabled && (
                <button
                    onClick={toggleSnow}
                    className="fixed bottom-4 right-4 z-[10000] bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-2 rounded-full shadow-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 transition-all flex items-center gap-2"
                    title={userSnowDisabled ? "Show Effect" : "Hide Effect"}
                >
                    {userSnowDisabled
                        ? (theme === 'songkran' ? '🌼 Show Effect' : '❄️ Show Snow')
                        : (theme === 'songkran' ? '🚫 Hide Effect' : '🚫 Hide Snow')}
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
            {theme === 'songkran' && (
                <style jsx global>{`
                    :root {
                        --color-primary: #00B5E2; /* Songkran Cyan Blue */
                        --color-secondary: #E0F7FA; /* Light Cyan */
                    }
                    /* Custom Water Cursor */
                    body {
                        cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="%2300B5E2" d="M12,22c4.97,0,9-4.03,9-9c0-4.97-9-13-9-13S3,8.03,3,13C3,17.97,7.03,22,12,22z" opacity="0.8"/></svg>') 16 16, auto;
                    }
                `}</style>
            )}
            {children}
        </>
    );
}
