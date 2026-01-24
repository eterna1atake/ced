"use client";
// แถบเมนูนำทางหลักของเว็บไซต์ รองรับการสลับภาษาและปุ่มเมนู

import Image from "next/image";
import { useState, useEffect, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faMagnifyingGlass,
  faXmark,
  faPhone
} from "@fortawesome/free-solid-svg-icons";

import Link from 'next/link'

import { useLocale, useTranslations } from 'next-intl';

import LanguageSwitch from "./LanguageSwitch";


export default function Navbar() {
  const t = useTranslations('Navbar');
  const locale = useLocale();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuItems = [
    { label: t("menuItem1") ?? "Menu item 1", href: `/${locale}` },
    { label: t("menuItem2") ?? "Menu item 2", href: `/${locale}/personnel` },
    { label: t("menuItem3") ?? "Menu item 3", href: "#" },
    { label: t("menuItem4") ?? "Menu item 4", href: "https://research.kmutnb.ac.th" },
    { label: t("menuItem5") ?? "Menu item 5", href: `/${locale}/newsandevents` },
    { label: t("menuItem6") ?? "Menu item 6", href: `/${locale}/about` },
    { label: t("menuItem7") ?? "Menu item 7", href: `/${locale}/contact-us` },
  ];

  const getLocalizedPath = (path: string) => {
    if (path === "/") {
      return `/${locale}`;
    }

    return `/${locale}${path}`;
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
    document.body.style.overflow = isMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  return (
    <div className="w-full shadow-xl" role="banner">
      <div className="flex justify-between bg-primary-nav py-4 px-6 lg:px-16">
        <Link href="/">
          <Image
            src="/images/logo/logo_1.png"
            alt="CED Logo"
            width={180}
            height={40}
            priority
          />
        </Link>
        <ul className="flex space-x-2 items-center lg:space-x-4 text-black">
          <LanguageSwitch />
          <li>
            <button><FontAwesomeIcon icon={faMagnifyingGlass} width={16} height={16} /></button>
          </li>
          <li>
            <button className="flex items-center space-x-2" onClick={toggleMenu}>
              <p>{t("menu")}</p>
              <FontAwesomeIcon icon={faBars} width={22} height={22} />
            </button>
          </li>
        </ul>
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
          "fixed inset-y-0 right-0 z-50 w-80 max-w-full bg-primary-main shadow-2xl transform transition-transform duration-300 ease-out",
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
                <div>
                  <span>{t("line1")}</span><br />
                  <span>{t("line2")}</span><br />
                  <span>{t("line3")}</span><br />
                </div>
                <div>
                  <span><FontAwesomeIcon icon={faPhone} className="mr-2" />{t("tel")}</span>
                </div>
              </div>
            </div>
          </div>
        </nav>


      </aside>

    </div>
  );
}
