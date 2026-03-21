
"use client";
import { getCsrfToken } from "@/utils/cookie";

import { ActionButtons } from "@/components/admin/common/ActionButtons";
import { AddButton } from "@/components/admin/common/AddButton";
import Image from "next/image";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import type { NewsSeedItem } from "@/types/news";
import Loading from "../loading";
import { useTranslations } from "next-intl";
import Pagination from "@/components/common/Pagination";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faThumbtack, faThumbtackSlash } from "@fortawesome/free-solid-svg-icons";

const ITEMS_PER_PAGE = 10;
const MAX_PINNED = 3;

export default function NewsListPage() {
    const tAlert = useTranslations("Admin.alerts");
    const t = useTranslations("Admin.pages.news");
    const [news, setNews] = useState<NewsSeedItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [currentPage, setCurrentPage] = useState(1);

    const sortAndSeparate = (items: NewsSeedItem[], order: 'asc' | 'desc') => {
        // Separate pinned and unpinned
        const pinned = items.filter(n => n.isPinned).sort((a, b) => {
            const dateA = new Date(a.pinnedAt || 0).getTime();
            const dateB = new Date(b.pinnedAt || 0).getTime();
            return dateB - dateA; // Most recently pinned first
        });
        const unpinned = items.filter(n => !n.isPinned).sort((a, b) => {
            const dateA = new Date(a.date).getTime();
            const dateB = new Date(b.date).getTime();
            return order === 'asc' ? dateA - dateB : dateB - dateA;
        });
        return [...pinned, ...unpinned];
    };

    const fetchNews = async () => {
        setIsLoading(true);
        try {
            // Add cache: 'no-store' and a timestamp to prevent stale data
            const res = await fetch(`/api/ced-portal/news?t=${Date.now()}`, {
                cache: 'no-store'
            });
            if (!res.ok) throw new Error("Failed to fetch news");
            const data = await res.json();
            console.log(`[DEBUG] NewsListPage - Raw API data:`, data.slice(0, 5));
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const mappedData = data.map((item: any) => ({
                ...item,
                id: item._id || item.id,
                isPinned: !!item.isPinned, // Ensure boolean
            }));
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            setNews(sortAndSeparate(mappedData as any, sortOrder));
        } catch (error) {
            console.error("Error fetching news:", error);
            Swal.fire(tAlert("error"), tAlert("failedToLoad"), "error");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchNews();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const toggleSort = () => {
        const newOrder = sortOrder === 'desc' ? 'asc' : 'desc';
        setSortOrder(newOrder);
        setCurrentPage(1);
        setNews(prev => sortAndSeparate(prev, newOrder));
    };

    const totalPages = Math.max(1, Math.ceil(news.length / ITEMS_PER_PAGE));
    const paginatedNews = news.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    const pinnedCount = news.filter(n => n.isPinned).length;

    const handleTogglePin = async (item: NewsSeedItem) => {
        // If trying to pin and already at max
        if (!item.isPinned && pinnedCount >= MAX_PINNED) {
            Swal.fire({
                icon: "warning",
                title: t("pinLimitTitle"),
                text: t("pinLimitText", { max: MAX_PINNED }),
            });
            return;
        }

        // Confirm before pinning/unpinning
        const confirmResult = await Swal.fire({
            title: item.isPinned ? tAlert("unpinConfirmTitle") : tAlert("pinConfirmTitle"),
            text: item.isPinned ? tAlert("unpinConfirmText") : tAlert("pinConfirmText"),
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#f59e0b",
            cancelButtonColor: "#94a3b8",
            confirmButtonText: tAlert("confirm"),
            cancelButtonText: tAlert("cancel"),
        });

        if (!confirmResult.isConfirmed) return;

        try {
            const csrfToken = getCsrfToken();

            console.log(`[DEBUG] handleTogglePin for item: ${item.id}, current isPinned: ${item.isPinned}`);
            const res = await fetch(`/api/ced-portal/news/${item.id}/pin`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "x-csrf-token": csrfToken || "",
                },
            });

            if (!res.ok) {
                const errorData = await res.json();
                if (errorData.code === "MAX_PINNED") {
                    Swal.fire({
                        icon: "warning",
                        title: t("pinLimitTitle"),
                        text: t("pinLimitText", { max: MAX_PINNED }),
                    });
                    return;
                }
                throw new Error("Failed to toggle pin");
            }

            const resData = await res.json();
            console.log(`[DEBUG] Toggle pin response:`, resData);

            // Fetch the latest news to ensure the list is correct and sorted
            await fetchNews();

            const toast = Swal.mixin({
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 2000,
                timerProgressBar: true
            });
            toast.fire({
                icon: 'success',
                title: item.isPinned ? t("unpinned") : t("pinned"),
            });

        } catch (error) {
            console.error("Pin error:", error);
            Swal.fire(tAlert("error"), tAlert("updateFailed"), "error");
        }
    };

    const handleDelete = async (id: string) => {
        const result = await Swal.fire({
            title: tAlert("deleteConfirmTitle"),
            text: tAlert("deleteConfirmText"),
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: tAlert("deleteConfirmButton"),
            cancelButtonText: tAlert("cancelButton"),
        });

        if (result.isConfirmed) {
            try {
                const csrfToken = getCsrfToken();

                const res = await fetch(`/api/ced-portal/news/${id}`, {
                    method: "DELETE",
                    headers: {
                        "x-csrf-token": csrfToken || "",
                    },
                });
                if (!res.ok) throw new Error("Failed to delete");

                await Swal.fire({ title: tAlert("deleted"), text: tAlert("deletedText"), icon: "success" });
                fetchNews();
            } catch (error) {
                console.error("Delete error:", error);
                Swal.fire(tAlert("error"), tAlert("deleteFailed"), "error");
            }
        }
    };

    const handleToggleArchive = async (item: NewsSeedItem) => {
        const targetStatus = item.status === 'archived' ? 'published' : 'archived';

        // Confirm before archiving/unarchiving
        const confirmResult = await Swal.fire({
            title: targetStatus === 'archived' ? tAlert("archiveConfirmTitle") : tAlert("unarchiveConfirmTitle"),
            text: targetStatus === 'archived' ? tAlert("archiveConfirmText") : tAlert("unarchiveConfirmText"),
            icon: targetStatus === 'archived' ? "warning" : "question",
            showCancelButton: true,
            confirmButtonColor: targetStatus === 'archived' ? "#94a3b8" : "#22c55e",
            cancelButtonColor: "#e2e8f0",
            confirmButtonText: tAlert("confirm"),
            cancelButtonText: tAlert("cancel"),
        });

        if (!confirmResult.isConfirmed) return;

        try {

            const updatedItem = { ...item, status: targetStatus };

            const csrfToken = getCsrfToken();

            const res = await fetch(`/api/ced-portal/news/${item.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "x-csrf-token": csrfToken || "",
                },
                body: JSON.stringify(updatedItem)
            });

            if (!res.ok) throw new Error("Failed to update status");

            fetchNews();

            const toast = Swal.mixin({
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true
            });
            toast.fire({
                icon: 'success',
                title: tAlert("updated"),
            });

        } catch (error) {
            console.error("Archive error:", error);
            Swal.fire(tAlert("error"), tAlert("updateFailed"), "error");
        }
    };


    return (


        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{t("title")}</h1>
                    <p className="text-slate-500 dark:text-slate-400">{t("description")}</p>
                </div>
                <div className="flex gap-2 items-center">
                    <span className="text-xs text-slate-400 dark:text-slate-500 mr-2">
                        📌 {pinnedCount}/{MAX_PINNED}
                    </span>
                    <AddButton
                        href="/ced-portal/news/create"
                        label={t("add")}
                    />
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border dark:border-slate-800 overflow-hidden">
                <table className="w-full text-left border-collapse table-fixed">
                    <thead>
                        <tr className="bg-slate-50 dark:bg-slate-800 border-b dark:border-slate-700 text-slate-600 dark:text-slate-200 text-sm uppercase tracking-wider">
                            <th className="p-4 font-semibold whitespace-nowrap w-[50px] text-center">📌</th>
                            <th className="p-4 font-semibold whitespace-nowrap w-[80px]">Image</th>
                            <th className="p-4 font-semibold whitespace-nowrap w-auto">Title</th>
                            <th className="p-4 font-semibold whitespace-nowrap w-[180px]">Category</th>
                            <th className="p-4 font-semibold whitespace-nowrap w-[110px]">Status</th>
                            <th className="p-4 font-semibold whitespace-nowrap w-[110px] cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" onClick={toggleSort}>
                                <div className="flex items-center gap-2">
                                    Date
                                    {sortOrder === 'desc' ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                        </svg>
                                    )}
                                </div>
                            </th>
                            <th className="p-4 font-semibold text-right whitespace-nowrap w-[240px]">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {isLoading ? (
                            <tr>
                                <td colSpan={7} className="p-12 text-center">
                                    <div className="flex justify-center items-center gap-3 text-slate-500">
                                        <Loading />
                                    </div>
                                </td>
                            </tr>
                        ) : news.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="p-12 text-center text-slate-500">
                                    No news found. Create one to get started.
                                </td>
                            </tr>
                        ) : (
                            paginatedNews.map((item) => (
                                <tr key={item.id} className={`hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${item.isPinned ? 'bg-amber-50/50 dark:bg-amber-900/10' : ''}`}>
                                    <td className="p-4 w-10">
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                handleTogglePin(item);
                                            }}
                                            className={`p-1.5 rounded-full transition-all ${item.isPinned
                                                ? "text-amber-500 hover:text-amber-700 hover:bg-amber-100 dark:hover:bg-amber-900/30"
                                                : "text-slate-300 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                                                }`}
                                            title={item.isPinned ? t("unpin") : t("pin")}
                                        >
                                            <FontAwesomeIcon
                                                icon={item.isPinned ? faThumbtackSlash : faThumbtack}
                                                className="w-4 h-4"
                                            />
                                        </button>
                                    </td>
                                    <td className="p-4">
                                        <div className="w-16 h-10 relative rounded overflow-hidden bg-slate-100 dark:bg-slate-800">
                                            {item.imageSrc ? (
                                                <Image
                                                    src={item.imageSrc}
                                                    alt={item.title.en}
                                                    fill
                                                    className="object-contain"
                                                />
                                            ) : (
                                                <div className="flex items-center justify-center h-full text-xs text-slate-400">No Img</div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-4 overflow-hidden">
                                        <div className="flex flex-col gap-1 w-full overflow-hidden">
                                            <div className="flex items-center gap-2 overflow-hidden">
                                                {item.isPinned && (
                                                    <span className="inline-flex items-center gap-1 flex-shrink-0 whitespace-nowrap px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                                                        <span>📌</span>
                                                        <span>{t("pin")}</span>
                                                    </span>
                                                )}
                                                <div className="font-medium text-slate-900 dark:text-slate-100 truncate">{item.title.th}</div>
                                            </div>
                                            <div className="text-xs text-slate-400 truncate">{item.content.th}</div>
                                        </div>
                                    </td>
                                    <td className="p-4 text-sm text-slate-500 dark:text-slate-300 overflow-hidden">
                                        <span className="px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 truncate block text-center">
                                            {item.category?.replace(/&amp;/g, '&')}
                                        </span>
                                    </td>
                                    <td className="p-4 overflow-hidden">
                                        <span
                                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize truncate
                          ${item.status === 'published' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' : ''}
                          ${item.status === 'draft' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300' : ''}
                          ${item.status === 'archived' ? 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300' : ''}
                        `}
                                        >
                                            {item.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-sm text-slate-500 dark:text-slate-400 overflow-hidden">
                                        <span className="truncate">{new Date(item.date).toLocaleDateString("en-GB")}</span>
                                    </td>
                                    <td className="p-4 text-right whitespace-nowrap">
                                        <div className="flex items-center justify-end gap-2 text-sm">
                                            <button
                                                onClick={() => handleToggleArchive(item)}
                                                className={`font-medium inline-flex items-center gap-1.5 p-1.5 rounded transition-colors ${item.status === 'archived'
                                                    ? "text-amber-600 hover:text-amber-800 hover:bg-amber-50 dark:hover:bg-amber-900/30"
                                                    : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                                                    }`}
                                                title={item.status === 'archived' ? "Unarchive" : "Archive"}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                                    <path d="M2 3a1 1 0 00-1 1v1a1 1 0 001 1h16a1 1 0 001-1V4a1 1 0 00-1-1H2z" />
                                                    <path fillRule="evenodd" d="M2 7.5h16l-.811 7.71a2 2 0 01-1.99 1.79H4.802a2 2 0 01-1.99-1.79L2 7.5zm5.22 1.72a.75.75 0 011.06 0L10 10.94l1.72-1.72a.75.75 0 111.06 1.06l-2.25 2.25a.75.75 0 01-1.06 0l-2.25-2.25a.75.75 0 010-1.06z" clipRule="evenodd" />
                                                </svg>
                                                <span>{item.status === 'archived' ? "Unarchive" : "Archive"}</span>
                                            </button>
                                            <ActionButtons
                                                editUrl={`/ced-portal/news/${item.id}`}
                                                onDelete={() => handleDelete(item.id)}
                                            />
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>

            {totalPages > 1 && (
                <div className="p-4 border-t dark:border-slate-800">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                        className="flex justify-center"
                    />
                </div>
            )}
        </div>
        </div > 
    );
}