import Image from "next/image";
import { Link } from "@/i18n/navigation";

export interface ProgramCardProps {
    title: string;
    subtitle: string;
    description: string;
    imageSrc: string;
    imageAlt: string;
    degree: string;
    buttonText?: string;
    buttonLink?: string;
}

export default function ProgramCard({
    title,
    subtitle,
    description,
    imageSrc,
    imageAlt,
    degree,
    buttonText = "รายละเอียดหลักสูตร",
    buttonLink = "#",
}: ProgramCardProps) {
    return (
        <div className="flex flex-col gap-8 overflow-hidden md:flex-row md:items-start" data-aos="fade-left" suppressHydrationWarning>
            {/* Image Section */}
            <div className="relative aspect-video w-full shrink-0 overflow-hidden rounded-lg md:w-1/2 lg:w-5/12">
                <Image
                    src={imageSrc}
                    alt={imageAlt}
                    fill
                    className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            </div>

            {/* Content Section */}
            <div className="flex flex-col gap-4 md:w-1/2 lg:w-7/12">
                <div>
                    <span className="text-sm font-medium text-slate-500">{degree}</span>
                    <h3 className="mt-1 text-xl md:text-2xl font-bold text-slate-900">{title}</h3>
                    <h4 className="text-base md:text-lg font-semibold text-slate-700">{subtitle}</h4>
                    <div className="mt-2 h-1 w-20 bg-primary-main/80"></div>
                </div>

                <p className="text-base md:text-lg leading-relaxed text-slate-600">{description}</p>

                <div className="mt-2">
                    <Link
                        href={buttonLink}
                        className="inline-flex items-center justify-center rounded-lg bg-primary-main border border-primary-main px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-white hover:text-primary-main"
                    >
                        {buttonText}
                    </Link>
                </div>
            </div>
        </div>
    );
}