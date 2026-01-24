"use client";

import Image from "next/image";
import type { Service } from "@/types/service";
import { useLocale } from "next-intl";
import { LocalizedString } from "@/types/common";

interface ServiceCardProps {
    service: Service;
}

export default function ServiceCard({ service }: ServiceCardProps) {
    const locale = useLocale();
    const lang = locale as keyof LocalizedString;

    return (
        <div
            className="group cursor-pointer overflow-hidden rounded-2xl bg-white shadow-md transition-all duration-200 hover:shadow-xl"
            data-aos="fade-up"
            suppressHydrationWarning
        >
            {/* Card Content */}
            <div className="flex flex-col items-center p-8">
                {/* Icon */}
                <div className="relative h-24 w-24 mb-6">
                    <Image
                        src={service.icon}
                        alt={service.title[lang]}
                        fill
                        className="object-contain"
                    />
                </div>

                {/* Title */}
                <h3 className="text-center text-base font-semibold text-slate-800 mb-6 min-h-[3rem] flex items-center">
                    {service.title[lang]}
                </h3>

                {/* View More Button */}
                <a
                    href={service.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-2 rounded-full border-2 border-[#35622F] text-[#35622F] font-medium text-sm transition-all duration-300 hover:bg-[#35622F] hover:text-white hover:shadow-lg"
                >
                    {lang === 'th' ? "ดูเพิ่มเติม" : "View More"}
                </a>
            </div>
        </div>
    );
}
