"use client";

import Image from "next/image";
import { useLocale } from "next-intl";
import { LocalizedString } from "@/types";

interface PersonnelSidebarProps {
    imageSrc: string;
    name: string;
    description?: string; // fallback if needed
    position: string;
    email: string;
    room?: string;
    phone?: string;
}

const labels = {
    contact: { th: "ข้อมูลติดต่อ", en: "Contact Info" },
    room: { th: "ห้องพักอาจารย์", en: "Office Room" },
    phone: { th: "เบอร์ติดต่อ", en: "Phone" },
    email: { th: "อีเมล", en: "Email" }
};

export default function PersonnelSidebar({ imageSrc, name, position, email, room, phone }: PersonnelSidebarProps) {
    const locale = useLocale();
    const lang = locale as keyof LocalizedString;

    return (
        <div className="flex flex-col gap-6 lg:flex lg:flex-col lg:items-center lg:space-y-6">
            {/* Image - 3:4 Portrait with Frame */}
            <div className="relative mx-auto w-full max-w-[200px] lg:max-w-[260px]">
                <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg border-4 border-white shadow-lg ring-1 ring-slate-200">
                    <Image
                        src={imageSrc}
                        alt={name}
                        fill
                        className="object-cover object-top"
                        sizes="(min-width: 1024px) 260px, 200px"
                        priority
                    />
                </div>
            </div>

            {/* Mobile Header: Name & Position (Hidden on Desktop) */}
            <div className="text-center lg:hidden">
                <h1 className="text-2xl font-bold text-slate-900 mb-2">
                    {name}
                </h1>
                <p className="text-lg font-medium text-primary-main">
                    {position}
                </p>
            </div>

            {/* Contact Information */}
            <div className="w-full rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200/60 lg:w-full lg:max-w-[260px] lg:p-6">
                <h3 className="mb-4 flex items-center gap-2 text-base font-bold text-slate-900 border-b border-slate-100 pb-3 lg:mb-6 lg:gap-3 lg:text-lg lg:pb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-primary-main">
                        <path fillRule="evenodd" d="M1.5 4.5a3 3 0 013-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 01-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 006.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 011.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 01-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 5.25V4.5z" clipRule="evenodd" />
                    </svg>
                    {labels.contact[lang]}
                </h3>
                <div className="space-y-3 lg:space-y-5">
                    {room && (
                        <div className="group">
                            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400 lg:text-xs">{labels.room[lang]}</p>
                            <p className="text-sm font-medium text-slate-900 group-hover:text-primary-main transition-colors lg:text-base">{room}</p>
                        </div>
                    )}
                    {phone && (
                        <div className="group">
                            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400 lg:text-xs">{labels.phone[lang]}</p>
                            <p className="text-sm font-medium text-slate-900 group-hover:text-primary-main transition-colors lg:text-base">{phone}</p>
                        </div>
                    )}
                    <div className="group">
                        <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400 lg:text-xs">{labels.email[lang]}</p>
                        <a href={`mailto:${email}`} className="text-sm font-medium text-slate-900 hover:text-primary-main hover:underline transition-colors break-words lg:text-base">
                            {email}
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
