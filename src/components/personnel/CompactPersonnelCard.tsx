"use client";

import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { PersonnelCardProps } from "./PersonnelCard";


// Define CompactPersonnelCardProps by extending PersonnelCardProps and adding new fields
interface CompactPersonnelCardProps extends PersonnelCardProps {
    slug?: string;
}

export default function CompactPersonnelCard({
    id,
    imageSrc,
    name,
    position,
    email,
    slug
}: CompactPersonnelCardProps) {
    return (
        <Link
            href={`/personnel/${slug || id}`}
            className="group flex w-full flex-col gap-3 transition-opacity hover:opacity-80"
        >
            {/* Avatar Image - 3:4 Portrait (Wider) */}
            <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg border-4 border-white shadow-md ring-1 ring-slate-200">
                <Image
                    src={imageSrc}
                    alt={name}
                    fill
                    className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                    sizes="(min-width: 640px) 250px, 100vw"
                />
            </div>

            {/* Content */}
            <div className="w-full text-center">
                <h3 className="text-lg lg:text-xl font-bold text-slate-900 group-hover:text-primary-main mb-2">
                    {name}
                </h3>
                <p className="text-sm lg:text-base font-medium text-slate-500">
                    {position}
                </p>
                <p className="text-xs lg:text-base text-slate-400 truncate">
                    {email}
                </p>
            </div>
        </Link>
    );
}
