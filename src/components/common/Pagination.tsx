"use client";

import { useTranslations } from "next-intl";

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    className?: string;
}

export default function Pagination({
    currentPage,
    totalPages,
    onPageChange,
    className = "",
}: PaginationProps) {
    const t = useTranslations("Common");

    if (totalPages <= 1) return null;

    const handlePrevious = () => {
        onPageChange(Math.max(1, currentPage - 1));
    };

    const handleNext = () => {
        onPageChange(Math.min(totalPages, currentPage + 1));
    };

    const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

    return (
        <nav
            className={`flex flex-col items-center gap-3 sm:flex-row sm:justify-between ${className}`}
            aria-label={t("paginationLabel")}
        >
            <p className="text-sm font-medium text-slate-500">
                {t("pageInfo", { current: currentPage, total: totalPages })}
            </p>

            <div className="flex items-center gap-2">
                <button
                    type="button"
                    onClick={handlePrevious}
                    disabled={currentPage === 1}
                    className="inline-flex items-center rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors duration-200 hover:border-primary-main hover:text-primary-main focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-main/40 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {t("previous")}
                </button>

                {pageNumbers.map((page) => (
                    <button
                        key={page}
                        type="button"
                        onClick={() => onPageChange(page)}
                        aria-current={page === currentPage ? "page" : undefined}
                        className={`inline-flex min-w-[2.5rem] items-center justify-center rounded-lg px-3 py-2 text-sm font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-main/40 ${page === currentPage
                                ? "border border-primary-main bg-primary-main text-white shadow"
                                : "border border-slate-200 text-slate-700 hover:border-primary-main hover:text-primary-main"
                            }`}
                    >
                        {page}
                    </button>
                ))}

                <button
                    type="button"
                    onClick={handleNext}
                    disabled={currentPage === totalPages}
                    className="inline-flex items-center rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors duration-200 hover:border-primary-main hover:text-primary-main focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-main/40 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {t("next")}
                </button>
            </div>
        </nav>
    );
}
