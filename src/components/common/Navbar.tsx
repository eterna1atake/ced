"use client";
// แถบเมนูนำทางหลักของเว็บไซต์ รองรับการสลับภาษาและปุ่มเมนู

import Image from "next/image";
import { useState, useEffect, useCallback, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faMagnifyingGlass,
  faXmark,
  faPhone,
  faChevronRight,
  faUser,
  faNewspaper,
  faLink,
  faTrophy,
  faFileArrowDown,
  faGlobe
} from "@fortawesome/free-solid-svg-icons";

import Link from 'next/link'

import { useLocale, useTranslations } from 'next-intl';

import LanguageSwitch from "./LanguageSwitch";
import { useGlobalSettings } from "@/hooks/useGlobalSettings";


export default function Navbar() {
  const t = useTranslations('Navbar');
  const locale = useLocale();
  const { settings } = useGlobalSettings();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  interface SearchResult {
    type: 'news' | 'personnel' | 'page' | 'award' | 'service' | 'research';
    title: string;
    subtitle?: string;
    url: string;
    image?: string;
    meta?: string;
    icon?: string;
  }
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    } else {
      // Reset search when closed
      setTimeout(() => {
        setSearchQuery("");
        setSearchResults([]);
      }, 300);
    }
  }, [isSearchOpen]);

  // Debounced Search Effect
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.length >= 2) {
        setIsSearching(true);
        try {
          const res = await fetch(`/api/public/search?q=${encodeURIComponent(searchQuery)}&locale=${locale}`);
          if (res.ok) {
            const data = await res.json();
            setSearchResults(data.results || []);
          } else {
            setSearchResults([]);
          }
        } catch (error) {
          console.error("Search error:", error);
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, locale]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Navigate to first result if available, or do nothing (users usually click results)
    if (searchResults.length > 0) {
      // Optionally auto-navigate to top result
      // handleMenuNavigate(searchResults[0].url);
    }
  };

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuItems = [
    { label: t("menuItem1") ?? "Menu item 1", href: `/${locale}` },
    { label: t("menuItem2") ?? "Menu item 2", href: `/${locale}/personnel` },
    { label: t("menuItem4") ?? "Menu item 4", href: "https://research.kmutnb.ac.th" },
    { label: t("menuItem5") ?? "Menu item 5", href: `/${locale}/newsandevents` },
    { label: t("menuItem6") ?? "Menu item 6", href: `/${locale}/about` },
    { label: t("menuItem7") ?? "Menu item 7", href: `/${locale}/contact-us` },
  ];

  const getLocalizedPath = (path: string) => {
    if (!path) return `/${locale}`;
    if (path.startsWith("http://") || path.startsWith("https://")) {
      return path;
    }
    if (path.startsWith(`/${locale}`)) {
      return path;
    }
    if (path === "/") {
      return `/${locale}`;
    }
    return `/${locale}${path.startsWith("/") ? path : `/${path}`}`;
  };

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  const closeMenu = useCallback(() => {
    setIsMenuOpen(false);
  }, []);

  const handleMenuNavigate = useCallback(
    (href: string) => {
      closeMenu();

      if (!href || href === "#") {
        return;
      }

      if (typeof window !== "undefined") {
        window.location.assign(href);
      }
    },
    [closeMenu]
  );

  useEffect(() => {
    document.body.style.overflow = isMenuOpen || isSearchOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen, isSearchOpen]);

  return (
    <div className="relative w-full shadow-xl" role="banner">
      <div className="flex justify-between items-center bg-primary-nav py-3 px-4 md:py-4 md:px-8 lg:px-16 transition-all duration-300">
        <Link href="/" className="relative flex items-center">
          <div className="relative w-40 md:w-48 lg:w-[200px] h-[38px] md:h-[48px] transition-all duration-300">
            <Image
              src="/images/logo/logo_1.png"
              alt="CED Logo"
              fill
              className="object-contain object-left"
              priority
            />
          </div>
        </Link>
        <ul className="flex items-center gap-3 md:gap-4 lg:gap-6 text-black transition-all duration-300">
          <LanguageSwitch />
          <li>
            <button
              className="p-1 hover:text-slate-600 transition-colors"
              onClick={() => setIsSearchOpen(true)}
              aria-label={t("search") || "Search"}
            >
              <FontAwesomeIcon icon={faMagnifyingGlass} className="w-5 h-5 md:w-5 md:h-5" />
            </button>
          </li>
          <li>
            <button className="flex items-center gap-2 hover:text-slate-600 transition-colors" onClick={toggleMenu}>
              <span className="hidden sm:block text-sm md:text-base font-medium">{t("menu")}</span>
              <FontAwesomeIcon icon={faBars} className="w-5 h-5 md:w-5 md:h-5" />
            </button>
          </li>
        </ul>
      </div>

      {/* Search Overlay (Sliding from Top 1:3) */}
      <div className={`fixed inset-0 z-50 ${isSearchOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>
        {/* Backdrop */}
        <div
          className={`
            absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-500 ease-in-out
            ${isSearchOpen ? 'opacity-100' : 'opacity-0'}
          `}
          onClick={() => setIsSearchOpen(false)}
        />

        {/* Sliding Panel */}
        <div
          className={`
            relative w-full bg-slate-900 shadow-2xl flex flex-col pt-10 pb-6 md:pt-16
            transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] origin-top
            ${isSearchOpen ? 'translate-y-0' : '-translate-y-full'}
          `}
          style={{ maxHeight: '85vh', minHeight: '30vh' }}
        >
          <button
            type="button"
            onClick={() => setIsSearchOpen(false)}
            className="absolute top-4 right-4 md:top-8 md:right-8 p-2 text-slate-400 hover:text-white hover:rotate-90 transition-all duration-300 z-10"
          >
            <FontAwesomeIcon icon={faXmark} className="w-8 h-8" />
          </button>

          <div className="w-full max-w-4xl mx-auto px-6 flex flex-col h-full">
            <label htmlFor="search-input" className="block text-primary-main text-xs md:text-sm font-bold mb-4 tracking-widest uppercase">
              {t("search")}
            </label>
            <form onSubmit={handleSearchSubmit} className="relative w-full group border-b border-slate-700 pb-2 mb-6 flex-shrink-0">
              <input
                id="search-input"
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                placeholder={t("searchPlaceholder")}
                className="w-full bg-transparent text-2xl md:text-4xl font-light text-white placeholder-slate-600 focus:outline-none"
                autoComplete="off"
              />
              <button
                type="submit"
                className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-500 hover:text-primary-main transition-colors duration-300"
              >
                {isSearching ? (
                  <div className="w-6 h-6 md:w-8 md:h-8 rounded-full border-2 border-slate-600 border-t-primary-main animate-spin" />
                ) : (
                  <FontAwesomeIcon icon={faMagnifyingGlass} className="w-6 h-6 md:w-8 md:h-8" />
                )}
              </button>
            </form>

            {/* Search Results Area */}
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
              {searchQuery.length > 1 && searchResults.length > 0 ? (
                <div className="flex flex-col gap-2 pb-8">
                  {searchResults.map((result, idx) => (
                    <Link
                      key={idx}
                      href={getLocalizedPath(result.url)}
                      onClick={() => setIsSearchOpen(false)}
                      target={result.url.startsWith('http') ? '_blank' : undefined}
                      rel={result.url.startsWith('http') ? 'noopener noreferrer' : undefined}
                      className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/10 transition-all duration-200 group border border-transparent hover:border-slate-700/50"
                    >
                      {/* Icon/Image */}
                      <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-slate-800/50 flex items-center justify-center overflow-hidden border border-slate-700/50 text-slate-400">
                        {result.image ? (
                          <Image
                            src={result.image.startsWith('http') ? result.image : `/images/${result.image}`}
                            alt={result.title}
                            width={48}
                            height={48}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <FontAwesomeIcon icon={
                            result.type === 'personnel' ? faUser :
                              result.type === 'news' ? faNewspaper :
                                result.type === 'award' ? faTrophy :
                                  result.type === 'service' ? faFileArrowDown :
                                    result.type === 'research' ? faGlobe :
                                      faLink
                          } className="w-5 h-5" />
                        )}
                      </div>

                      {/* Text */}
                      <div className="flex-grow min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="text-white font-medium truncate group-hover:text-primary-main transition-colors text-base">
                            {result.title}
                          </h4>
                          <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full tracking-wider opacity-60 group-hover:opacity-100 transition-opacity whitespace-nowrap hidden sm:inline-block ${result.type === 'news' ? 'bg-blue-500/20 text-blue-300' :
                            result.type === 'personnel' ? 'bg-purple-500/20 text-purple-300' :
                              result.type === 'award' ? 'bg-yellow-500/20 text-yellow-300' :
                                result.type === 'service' ? 'bg-green-500/20 text-green-300' :
                                  'bg-slate-700 text-slate-300'
                            }`}>
                            {result.type}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                          {result.subtitle && <span className="truncate">{result.subtitle}</span>}
                          {result.meta && (
                            <>
                              <span className="w-1 h-1 rounded-full bg-slate-600 hidden sm:inline-block"></span>
                              <span className="truncate hidden sm:inline-block">{result.meta}</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Arrow */}
                      <div className="text-slate-600 group-hover:text-white transition-colors pl-2">
                        <FontAwesomeIcon icon={faChevronRight} className="w-3 h-3" />
                      </div>
                    </Link>
                  ))}
                </div>
              ) : searchQuery.length > 0 && !isSearching && searchResults.length === 0 ? (
                <div className="text-slate-500 text-center py-8">
                  No results found for &quot;{searchQuery}&quot;
                </div>
              ) : (
                <div className="flex flex-col md:flex-row md:items-center text-slate-500 text-sm gap-4 pb-4">
                  <span className="font-medium whitespace-nowrap">{t("quickLinks")}</span>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { label: t("menuItem2") || "Personel", href: `/${locale}/personnel` },
                      { label: t("menuItem5") || "News", href: `/${locale}/newsandevents` }
                    ].map((link, idx) => (
                      <Link
                        key={idx}
                        href={link.href}
                        onClick={() => setIsSearchOpen(false)}
                        className="px-3 py-1 border border-slate-700 rounded-full hover:bg-white hover:text-black hover:border-white transition-all duration-200"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Overlay */}
      <div
        className={[
          "fixed inset-0 z-40 bg-black/40 transition-opacity duration-300",
          isMenuOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
        ].join(" ")}
        onClick={closeMenu}
      />

      {/* Sliding Menu */}
      <aside
        className={[
          "fixed inset-y-0 right-0 z-50 w-72 max-w-full bg-primary-main shadow-2xl transform transition-transform duration-300 ease-out",
          isMenuOpen ? "translate-x-0" : "translate-x-full",
        ].join(" ")}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between border-b border-slate-900/50 px-5 py-2">
          <div>
            <Image
              src="/images/logo/logo_2.png"
              alt="CED Logo"
              width={60}
              height={30}
              priority
            />
          </div>
          <button
            type="button"
            onClick={closeMenu}
            className="p-2 text-white hover:text-slate-700"
            aria-label={t("closeMenu")}
          >
            <FontAwesomeIcon icon={faXmark} width={20} height={20} />
          </button>
        </div>
        <nav className="flex h-full flex-col">
          <div className="flex-1 overflow-y-auto px-5 py-8">
            {/* TODO: แทรกเมนูจริงภายหลัง */}
            <ul className="space-y-4 text-base font-medium text-white">
              {menuItems.map((item, index) => (
                <li key={item.href + index} className="group">
                  <Link
                    href={getLocalizedPath(item.href)}
                    className="flex items-center justify-between px-3 transition duration-200 group-hover:text-primary-nav"
                    onClick={(event) => {
                      event.preventDefault();
                      handleMenuNavigate(item.href);
                    }}
                  >
                    <span className="font-medium">{item.label}</span>

                  </Link>
                  <hr className="mt-1 border-0 h-px bg-white/25 transition-colors duration-200 group-hover:bg-white/60" />
                </li>
              ))}
            </ul>

            <div className="mt-8 pt-4 text-white">
              <span className="text-xl">{t("contactDetail")}</span>
              <div className="mt-4 space-y-4 text-base">
                {(locale === 'th' ? settings.contactDepartment.th : settings.contactDepartment.en) && (
                  <div className="whitespace-pre-line font-normal">
                    {locale === 'th' ? settings.contactDepartment.th : settings.contactDepartment.en}
                  </div>
                )}
                <div>
                </div>
                <div>
                  <span><FontAwesomeIcon icon={faPhone} className="mr-2" />{settings.contact.phone || t("tel")}</span>
                </div>
              </div>
            </div>
          </div>
        </nav>


      </aside>

    </div>
  );
}
