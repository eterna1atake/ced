'use client';

import { useRouter, usePathname, useParams } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { useEffect, useState } from 'react';

export default function FloatingBackButton() {
    const router = useRouter();
    const pathname = usePathname();
    const params = useParams();
    const locale = (params?.locale as string) || 'en';
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Hide on home page (e.g., /en, /th, /, etc.)
        const isHomePage = pathname === '/en' || pathname === '/th' || pathname === '/' || pathname === '/en/' || pathname === '/th/';
        setIsVisible(!isHomePage);
    }, [pathname]);

    if (!isVisible) return null;

    return (
        <button
            onClick={() => router.back()}
            className="mt-4 flex items-center gap-1 text-slate-500 hover:text-primary-main transition-colors duration-300 text-sm font-medium group"
            aria-label={locale === 'th' ? 'ย้อนกลับ' : 'Back'}
        >
            <FontAwesomeIcon
                icon={faArrowLeft}
                className="text-base transition-transform duration-300 group-hover:-translate-x-1"
            />
            <span>{locale === 'th' ? 'ย้อนกลับ' : 'Back'}</span>
        </button>
    );
}
