"use client";

import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { useLocale } from "next-intl";

export interface PersonnelCardProps {
    id: string;
    name: string;
    position: string;
    email: string;
    imageSrc: string;
    phone?: string;
    slug?: string;
}

export default function PersonnelCard({
    id,
    name,
    position,
    email,
    imageSrc,
    slug
}: PersonnelCardProps) {
    const locale = useLocale();

    return (
        <Link href={`/personnel/${slug || id}`} className="block group relative h-[400px] mt-10 w-full overflow-hidden rounded-2xl shadow-md transition-all duration-300 hover:shadow-xl">
            {/* Image */}
            <Image
                src={imageSrc}
                alt={name}
                fill
                className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-80 transition-opacity duration-300 group-hover:opacity-90" />

            {/* Content */}
            <div className="absolute bottom-0 left-0 w-full p-6 text-white">
                <h3 className="text-lg font-bold leading-tight md:text-xl mb-1">
                    {name}
                </h3>
                <p className="mb-2 text-base font-medium text-gray-200">
                    {position}
                </p>
                <div className="flex items-center gap-2 text-sm text-gray-300">
                    <span className="font-semibold">{locale === 'th' ? "อีเมล:" : "Email:"}</span>
                    <span className="truncate hover:text-primary-main hover:underline">
                        {email}
                    </span>
                </div>
            </div>
        </Link>
    );
}
