"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faTrash, faEdit } from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";
import Loading from "@/components/common/Loading";
import { useTranslations, useLocale } from "next-intl";

type HeroCarouselImage = {
    _id: string;
    src: string;
    alt?: string | { en?: string; th?: string };
};

export default function HeroListPage() {
    const t = useTranslations("Admin.pages.hero");
    const [heroes, setHeroes] = useState<HeroCarouselImage[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchHeroes = async () => {
        try {
            const res = await fetch("/api/admin/hero");
            if (!res.ok) throw new Error("Failed to fetch");
            const data = await res.json();
            setHeroes(data);
        } catch (error) {
            console.error(error);
            Swal.fire("Error", "Failed to load hero images", "error");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchHeroes();
    }, []);

    const handleDelete = async (id: string) => {
        const result = await Swal.fire({
            title: "Are you sure?",
            text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes, delete it!"
        });

        if (result.isConfirmed) {
            try {
                // [Fix] Add CSRF Token to headers
                const csrfToken = document.cookie
                    .split("; ")
                    .find((row) => row.startsWith("ced_csrf_token="))
                    ?.split("=")[1];

                const res = await fetch(`/api/admin/hero/${id}`, {
                    method: "DELETE",
                    headers: {
                        "x-csrf-token": csrfToken || "",
                    },
                });

                if (res.ok) {
                    Swal.fire("Deleted!", "Your file has been deleted.", "success");
                    fetchHeroes();
                } else {
                    throw new Error("Failed to delete");
                }
            } catch (error) {
                console.error(error);
                Swal.fire("Error", "Failed to delete image", "error");
            }
        }
    };

    const locale = useLocale();

    const getAltText = (alt: string | { en?: string; th?: string } | undefined) => {
        if (!alt) return "";
        if (typeof alt === "string") return alt;
        // @ts-expect-error - safe to access by key although type is loose
        return alt[locale] || alt?.en || alt?.th || "";
    };

    if (isLoading) return (
        <div className="flex h-[50vh] items-center justify-center">
            <Loading />
        </div>
    );


    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{t("title")}</h1>
                    <p className="text-slate-500 dark:text-slate-400">{t("description")}</p>
                </div>
                <Link
                    href="/admin/hero/create"
                    className="bg-primary-main/90 hover:bg-primary-hover text-white px-4 py-2 rounded-md font-medium transition-colors flex items-center gap-2"
                >
                    <span className="hidden md:block"><FontAwesomeIcon icon={faPlus} /> {t("add")}</span>
                    <span className="block md:hidden"><FontAwesomeIcon icon={faPlus} /></span>
                </Link>
            </div>

            {heroes.length === 0 ? (
                <div className="text-center py-10 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-dashed dark:border-slate-700">
                    <p className="text-slate-500 dark:text-slate-400">No hero images found.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {heroes.map((item) => (
                        <div key={item._id} className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border dark:border-slate-800 overflow-hidden group">
                            <div className="relative aspect-video bg-slate-100 dark:bg-slate-800">
                                <Image
                                    src={item.src}
                                    alt={getAltText(item.alt) || "Hero Image"}
                                    fill
                                    className="object-cover transition-transform group-hover:scale-105"
                                    unoptimized // Allow local uploads
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <Link
                                        href={`/admin/hero/${item._id}`}
                                        className="bg-white text-slate-900 px-3 py-1.5 rounded-full text-sm font-medium hover:bg-slate-100 flex items-center gap-1"
                                    >
                                        <FontAwesomeIcon icon={faEdit} className="w-3 h-3" /> Edit
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(item._id)}
                                        className="bg-red-500 text-white px-3 py-1.5 rounded-full text-sm font-medium hover:bg-red-600 flex items-center gap-1"
                                    >
                                        <FontAwesomeIcon icon={faTrash} className="w-3 h-3" /> Delete
                                    </button>
                                </div>
                            </div>
                            <div className="p-3">
                                <div className="text-xs text-slate-500 dark:text-slate-400 font-mono truncate">{item._id}</div>
                                <div className="text-sm text-slate-700 dark:text-slate-200 font-medium truncate">{getAltText(item.alt) || "No description"}</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
