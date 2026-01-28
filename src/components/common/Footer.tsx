"use client";
// ส่วนท้ายเว็บไซต์ แสดงข้อมูลติดต่อ ลิงก์ด่วน และช่องทางโซเชียล

import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faFacebook,
    faYoutube,
    faTiktok,
    faGooglePlusG
} from "@fortawesome/free-brands-svg-icons";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useGlobalSettings } from "@/hooks/useGlobalSettings";

export default function Footer() {
    const t = useTranslations("Footer");
    const locale = useLocale();
    const { settings } = useGlobalSettings();
    const address = locale === 'th' ? settings.contact.address.th : settings.contact.address.en;
    const quickLinks = [
        { key: "aboutCed", path: "/about" },
        { key: "newsEvents", path: "/newsandevents" },
        { key: "admissions", path: "https://admission.kmutnb.ac.th/" },
        { key: "programs", path: "/programs" },
        { key: "research", path: "https://research.kmutnb.ac.th/researcher/" },
    ];

    const serviceLinks = [
        { key: "personnel", path: "/personnel" },
        { key: "research", path: "https://research.kmutnb.ac.th/researcher/" },
    ];

    const studentLinks = [
        { key: "timetable", path: "https://reg3.kmutnb.ac.th/registrar/home" },
        { key: "examSchedule", path: "https://exam.fte.kmutnb.ac.th/" },
        { key: "academicCalendar", path: "https://acdserv.kmutnb.ac.th/academic-calendar" },
        { key: "scholarships", path: "https://sa.op.kmutnb.ac.th/scholarship/" },
    ];

    const getLocalizedPath = (path: string) => {
        if (path === "/") {
            return `/${locale}`;
        }
        return `/${locale}${path}`;
    };

    return (
        <footer className="bg-gradient-to-b from-gray-900 to-black text-white border-t border-gray-700/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8 text-center md:text-left">
                    {/* Column 1: Logo and Address */}
                    <div className="flex flex-col items-center md:items-start space-y-4">
                        <Image
                            src="/images/logo/logo_1.png"
                            alt="CED Logo"
                            width={180}
                            height={70}
                            className="h-auto"
                        />
                        {/* Site Name */}
                        {(locale === 'th' ? settings.contactDepartment.th : settings.contactDepartment.en) && (
                            <p className="text-gray-400 text-base whitespace-pre-line">
                                {locale === 'th' ? settings.contactDepartment.th : settings.contactDepartment.en}
                            </p>
                        )}
                    </div>

                    {/* Column 2: Quick Links */}
                    <div className="flex flex-col items-center md:items-start">
                        <h3 className="text-xl font-semibold mb-4">
                            {t("quickLinksTitle")}
                        </h3>
                        <ul className="space-y-2">
                            {quickLinks.map((link) => (
                                <li key={link.key}>
                                    <Link
                                        href={getLocalizedPath(link.path)}
                                        className="text-gray-400 text-base hover:text-white hover:underline transition-colors duration-300"
                                    >
                                        {t(`links.${link.key}`)}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Column 3: Services */}
                    <div className="flex flex-col items-center md:items-start">
                        <h3 className="text-xl font-semibold mb-4">
                            {t("servicesTitle")}
                        </h3>
                        <ul className="space-y-2">
                            {serviceLinks.map((link) => (
                                <li key={link.key}>
                                    <Link
                                        href={getLocalizedPath(link.path)}
                                        className="text-gray-400 text-base hover:text-white hover:underline transition-colors duration-300"
                                    >
                                        {t(`links.${link.key}`)}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Column 4: For Students */}
                    <div className="flex flex-col items-center md:items-start">
                        <h3 className="text-xl font-semibold mb-4">
                            {t("studentsTitle")}
                        </h3>
                        <ul className="space-y-2">
                            {studentLinks.map((link) => (
                                <li key={link.key}>
                                    <Link
                                        href={getLocalizedPath(link.path)}
                                        className="text-gray-400 text-base hover:text-white hover:underline transition-colors duration-300"
                                    >
                                        {t(`links.${link.key}`)}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <hr className="border-gray-700/50 my-8" />

                <div className="flex flex-col items-center justify-between gap-6">

                    <div className="flex space-x-4">
                        {settings.socials.facebook && (
                            <a
                                href={settings.socials.facebook}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 rounded-full border border-gray-400 flex items-center justify-center text-gray-400 hover:text-white hover:border-blue-500 hover:bg-blue-500 transition-all duration-300"
                            >
                                <FontAwesomeIcon icon={faFacebook} className="w-5 h-5" />
                            </a>
                        )}
                        {settings.socials.youtube && (
                            <a
                                href={settings.socials.youtube}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 rounded-full border border-gray-400 flex items-center justify-center text-gray-400 hover:text-white hover:border-red-500 hover:bg-red-500 transition-all duration-300"
                            >
                                <FontAwesomeIcon icon={faYoutube} className="w-5 h-5" />
                            </a>
                        )}
                        {settings.socials.googlePlus && (
                            <a
                                href={settings.socials.googlePlus}
                                className="w-10 h-10 rounded-full border border-gray-400 flex items-center justify-center text-gray-400 hover:text-white hover:border-orange-500 hover:bg-orange-500 transition-all duration-300"
                            >
                                <FontAwesomeIcon icon={faGooglePlusG} className="w-5 h-5" />
                            </a>
                        )}
                        {settings.socials.tiktok && (
                            <a
                                href={settings.socials.tiktok}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 rounded-full border border-gray-400 flex items-center justify-center text-gray-400 hover:text-white hover:border-pink-500 hover:bg-pink-500 transition-all duration-300"
                            >
                                <FontAwesomeIcon icon={faTiktok} className="w-5 h-5" />
                            </a>
                        )}
                    </div>

                    <p className="text-gray-500 text-sm text-center md:text-left mb-4 md:mb-0">
                        {t("rights", { year: new Date().getFullYear() })}
                    </p>
                </div>
            </div>
        </footer>
    );
}
