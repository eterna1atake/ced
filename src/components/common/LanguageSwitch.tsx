"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { US, TH } from 'country-flag-icons/react/3x2';

export default function LanguageSwitch() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChange = (newLocale: string) => {
    // Construct new path: replace /en or /th prefix with new locale
    const pathWithoutLocale = pathname.replace(/^\/(en|th)/, "");
    const newPath = `/${newLocale}${pathWithoutLocale}`;
    router.push(newPath);
    setIsOpen(false);
  };

  const CurrentFlag = locale === 'th' ? TH : US;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-200 dark:focus:ring-slate-700"
        title="Switch Language"
      >
        <div className="w-6 h-4 rounded overflow-hidden shadow-sm relative">
          <CurrentFlag title={locale.toUpperCase()} className="w-full h-full object-cover" />
        </div>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-100 dark:border-slate-700 py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <button
            onClick={() => handleChange('th')}
            className={`w-full px-4 py-2 text-left flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors ${locale === 'th' ? 'bg-slate-50 dark:bg-slate-700/50' : ''}`}
          >
            <div className="w-5 h-3.5 rounded-sm overflow-hidden shadow-sm">
              <TH title="Thai" className="w-full h-full object-cover" />
            </div>
            <span className={`text-sm ${locale === 'th' ? 'font-semibold text-primary-main' : 'text-slate-600 dark:text-slate-300'}`}>
              ไทย
            </span>
          </button>

          <button
            onClick={() => handleChange('en')}
            className={`w-full px-4 py-2 text-left flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors ${locale === 'en' ? 'bg-slate-50 dark:bg-slate-700/50' : ''}`}
          >
            <div className="w-5 h-3.5 rounded-sm overflow-hidden shadow-sm">
              <US title="English" className="w-full h-full object-cover" />
            </div>
            <span className={`text-sm ${locale === 'en' ? 'font-semibold text-primary-main' : 'text-slate-600 dark:text-slate-300'}`}>
              English
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
