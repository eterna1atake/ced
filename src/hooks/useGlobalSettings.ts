import { useState, useEffect } from 'react';

export interface GlobalSettings {
    theme: string;
    snowEnabled: boolean;
    siteName: { th: string; en: string };
    footerCopyright: string;
    contact: {
        email: string;
        phone: string;
        address: { th: string; en: string };
    };
    socials: {
        facebook: string;
        youtube: string;
        tiktok: string;
        googlePlus: string;
    };
}

const defaultSettings: GlobalSettings = {
    theme: 'default',
    snowEnabled: true,
    siteName: { th: '', en: '' },
    footerCopyright: '',
    contact: {
        email: '',
        phone: '',
        address: { th: '', en: '' }
    },
    socials: {
        facebook: '',
        youtube: '',
        tiktok: '',
        googlePlus: ''
    }
};

export function useGlobalSettings() {
    const [settings, setSettings] = useState<GlobalSettings>(defaultSettings);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        const fetchSettings = async () => {
            try {
                const res = await fetch('/api/public/settings', {
                    next: { revalidate: 60 },
                    cache: 'no-store'
                });
                if (res.ok && mounted) {
                    const data = await res.json();
                    setSettings(data);
                }
            } catch (error) {
                console.error('Failed to fetch global settings:', error);
            } finally {
                if (mounted) setLoading(false);
            }
        };

        fetchSettings();

        return () => {
            mounted = false;
        };
    }, []);

    return { settings, loading };
}
