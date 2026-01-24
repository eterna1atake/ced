"use client";

import Image from "next/image";
import Link from "next/link";

import { useLocale, useTranslations } from "next-intl";

export default function OnlineServicesSection() {
    const locale = useLocale();
    const t = useTranslations("Hero");

    const services = [
        {
            name: t("icitAccount"),
            img: "/images/logo/logo_icit_with_kmutnb_200.png",
            link: "https://icit.kmutnb.ac.th/",
        },
        {
            name: t("centralLibrary"),
            img: "/images/logo/kmunb_central_library_logo.png",
            link: "https://library.kmutnb.ac.th/",
        },
        {
            name: t("studentAffairs"),
            img: "/images/logo/sa_op.png",
            link: "https://sa.op.kmutnb.ac.th/",
        },
        {
            name: t("mooc"),
            img: "/images/logo/logo-mooc.png",
            link: "https://mooc.kmutnb.ac.th/",
        },
        {
            name: t("formRequests"),
            img: "/images/logo/document_logo.png",
            link: `/${locale}/form-requests`,
        },
    ];
    return (
        <section className="relative bg-white">
            {/* Header */}
            <div className="justify-center flex items-center absolute bg-primary-main mt-6 mb-8 rounded-sm left-1/2 -translate-x-1/2 transform">
                <h2 className="text-white text-base font-medium tracking-wide mx-5 my-1">
                    {t("onlineService")}
                </h2>
            </div>

            <div className="mx-10 py-10 px-6">
                <div className="border-4 border-primary-main mx-0 md:mx-10 py-10 px-6 text-center">
                    {/* Grid */}
                    <div className="mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-0 max-w-6xl">
                        {services.map((service) => (
                            <Link
                                key={service.name}
                                href={service.link}
                                rel="noopener noreferrer"
                                className="flex flex-col items-center space-y-0 md:space-y-2 lg:space-y-4 group"
                            >
                                <div className="relative h-28 w-28" data-aos="zoom-in" suppressHydrationWarning>
                                    <Image
                                        src={service.img}
                                        alt={service.name}
                                        fill
                                        className="object-contain transition-transform group-hover:scale-105"
                                    />
                                </div>
                                <span className="border border-primary-main px-6 py-2 text-sm md:text-base text-primary-main rounded-md group-hover:bg-primary-main group-hover:text-white transition">
                                    {service.name}
                                </span>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
