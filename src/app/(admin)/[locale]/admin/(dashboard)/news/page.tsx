
"use client";

import { ActionButtons } from "@/components/admin/common/ActionButtons";
import { AddButton } from "@/components/admin/common/AddButton";
import Image from "next/image";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import type { NewsSeedItem } from "@/types/news";
import Loading from "../loading";
import { useTranslations } from "next-intl";

export default function NewsListPage() {
    const t = useTranslations("Admin.pages.news");
    const [news, setNews] = useState<NewsSeedItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    const fetchNews = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/admin/news");
            if (!res.ok) throw new Error("Failed to fetch news");
            const data = await res.json();
            // Map _id to id if necessary, or ensure type compatibility
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const mappedData = data.map((item: any) => ({
                ...item,
                id: item._id || item.id, // Handle both cases
            }));
            // Sort by date desc initially
            const sortedData = mappedData.sort((a: NewsSeedItem, b: NewsSeedItem) =>
                new Date(b.date).getTime() - new Date(a.date).getTime()
            );
            setNews(sortedData);
        } catch (error) {
            console.error("Error fetching news:", error);
            Swal.fire("Error", "Failed to load news items", "error");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchNews();
    }, []);

    const toggleSort = () => {
        const newOrder = sortOrder === 'desc' ? 'asc' : 'desc';
        setSortOrder(newOrder);

        const sortedNews = [...news].sort((a, b) => {
            const dateA = new Date(a.date).getTime();
            const dateB = new Date(b.date).getTime();
            return newOrder === 'asc' ? dateA - dateB : dateB - dateA;
        });

        setNews(sortedNews);
    };

    const handleDelete = async (id: string) => {
        const result = await Swal.fire({
            title: "Are you sure?",
            text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes, delete it!",
        });

        if (result.isConfirmed) {
            try {
                // [Fix] Add CSRF Token to headers
                const csrfToken = document.cookie
                    .split("; ")
                    .find((row) => row.startsWith("ced_csrf_token="))
                    ?.split("=")[1];

                const res = await fetch(`/api/admin/news/${id}`, {
                    method: "DELETE",
                    headers: {
                        "x-csrf-token": csrfToken || "",
                    },
                });
                if (!res.ok) throw new Error("Failed to delete");

                await Swal.fire("Deleted!", "Your news item has been deleted.", "success");
                fetchNews(); // Refresh list
            } catch (error) {
                console.error("Delete error:", error);
                Swal.fire("Error", "Failed to delete item", "error");
            }
        }
    };

    const handleToggleArchive = async (item: NewsSeedItem) => {
        // newStatus was unused. Logic depends on current status.

        // If it was draft, maybe stick to published or draft? 
        // Logic: If archived -> unarchive to DRAFT or PUBLISHED? 
        // Let's assume unarchive -> draft is safer, or back to previous status if we tracked it.
        // Simple logic for now: Archive <-> Published (or Draft).
        // Actually, if it's draft, archiving it makes sense. Unarchiving should probably go to draft to be safe.
        // But user might want quick publish. Let's ask via logic? No, simple toggle:
        // Archive -> Draft (Safe)
        // Published/Draft -> Archived

        // Wait, the UI button is 'Archive/Unarchive'.
        // If status is 'archived', unarchive to 'draft'.
        // If status is not 'archived', set to 'archived'.

        const targetStatus = item.status === 'archived' ? 'published' : 'archived';

        try {
            // We need to send the whole object for PUT usually due to validator, 
            // BUT we implemented PUT to validate the whole object schema. 
            // Although our PUT implementation accepts full body, we should probably fetch current object details then update?
            // Or... simply send what we have in `item` with updated status. `item` from list might be incomplete?
            // List usually has all fields for NewsSeedItem.
            // Let's try sending `item` with updated status.

            const updatedItem = { ...item, status: targetStatus };

            // [Fix] Add CSRF Token to headers
            const csrfToken = document.cookie
                .split("; ")
                .find((row) => row.startsWith("ced_csrf_token="))
                ?.split("=")[1];

            const res = await fetch(`/api/admin/news/${item.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "x-csrf-token": csrfToken || "",
                },
                body: JSON.stringify(updatedItem)
            });

            if (!res.ok) throw new Error("Failed to update status");

            // Optimistic update or refresh
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
                title: `Status updated to ${targetStatus}`
            });

        } catch (error) {
            console.error("Archive error:", error);
            Swal.fire("Error", "Failed to update status", "error");
        }
    };



    return (


        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{t("title")}</h1>
                    <p className="text-slate-500 dark:text-slate-400">{t("description")}</p>
                </div>
                <div className="flex gap-2">
                    <AddButton
                        href="/admin/news/create"
                        label={t("add")}
                    />
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border dark:border-slate-800 overflow-hidden">
                <div className="overflow-x-auto">
                    {isLoading ? (
                        <div className="flex h-[50vh] items-center justify-center">
                            <Loading />
                        </div>
                    ) : (
                        <table className="min-w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-800 border-b dark:border-slate-700 text-slate-600 dark:text-slate-200 text-sm uppercase tracking-wider">
                                    <th className="p-4 font-semibold whitespace-nowrap">Image</th>
                                    <th className="p-4 font-semibold whitespace-nowrap">Title</th>
                                    <th className="p-4 font-semibold whitespace-nowrap">Category</th>
                                    <th className="p-4 font-semibold whitespace-nowrap">Status</th>
                                    <th className="p-4 font-semibold whitespace-nowrap cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" onClick={toggleSort}>
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
                                    <th className="p-4 font-semibold text-right whitespace-nowrap">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {news.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                        <td className="p-4 w-24">
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
                                        <td className="p-4 min-w-[200px]">
                                            <div className="font-medium text-slate-900 dark:text-slate-100 line-clamp-1">{item.title.en}</div>
                                            <div className="text-xs text-slate-400 line-clamp-1">{item.summary.en}</div>
                                        </td>
                                        <td className="p-4 text-sm text-slate-600 dark:text-slate-300 whitespace-nowrap">
                                            <span className="px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                                                {item.category}
                                            </span>
                                        </td>
                                        <td className="p-4 whitespace-nowrap">
                                            <span
                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                          ${item.status === 'published' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' : ''}
                          ${item.status === 'draft' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300' : ''}
                          ${item.status === 'archived' ? 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300' : ''}
                        `}
                                            >
                                                {item.status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap">
                                            {new Date(item.date).toLocaleDateString("en-GB")}
                                        </td>
                                        <td className="p-4 text-right whitespace-nowrap">
                                            <div className="flex items-center justify-end gap-3">
                                                <button
                                                    onClick={() => handleToggleArchive(item)}
                                                    className={`text-sm font-medium inline-flex items-center gap-1.5 p-1.5 rounded transition-colors ${item.status === 'archived'
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
                                                    editUrl={`/admin/news/${item.id}`}
                                                    onDelete={() => handleDelete(item.id)}
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}

                    {!isLoading && news.length === 0 && (
                        <div className="p-8 text-center text-slate-500">
                            No news found. Create one to get started.
                        </div>
                    )}
                </div>
            </div>
        </div >
    );
}
