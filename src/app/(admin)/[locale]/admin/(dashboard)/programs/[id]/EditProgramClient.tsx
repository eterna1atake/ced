
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import ProgramForm from "@/components/admin/programs/ProgramForm";
import ProgramDetailsForm from "@/components/admin/programs/ProgramDetailsForm";
import ProgramPreviewPanel from "@/components/admin/programs/ProgramPreviewPanel";
import type { ProgramItem, ProgramDetailData } from "@/types/program";
import { getProgramDetail } from "@/data/program-details";
import Swal from "sweetalert2";

export default function EditProgramClient({
    initialData,
    initialDetailData
}: {
    initialData: ProgramItem,
    initialDetailData?: ProgramDetailData
}) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'general' | 'detail'>('general');
    const [showPreview, setShowPreview] = useState(true);
    const [previewData, setPreviewData] = useState<Partial<ProgramDetailData>>({});

    // Data is now passed from Server Component
    const detailsData = initialDetailData;

    const handleGeneralSubmit = async (data: ProgramItem) => {
        setIsLoading(true);
        try {
            const csrfToken = document.cookie
                .split("; ")
                .find((row) => row.startsWith("ced_csrf_token="))
                ?.split("=")[1];

            const response = await fetch(`/api/admin/programs/${initialData.id}/general`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-csrf-token': csrfToken || ""
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const errorData = await response.json();
                const errorMessage = errorData.message || errorData.error || 'Failed to update general information';
                throw new Error(errorMessage);
            }

            await Swal.fire({
                title: "Success!",
                text: "Program General Info updated successfully.",
                icon: "success",
                timer: 1500,
                showConfirmButton: false
            });
            router.refresh();
        } catch (error: any) {
            console.error("Error updating program:", error);
            Swal.fire("Error", error.message || "Failed to update program", "error");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDetailSubmit = async (data: ProgramDetailData) => {
        setIsLoading(true);
        try {
            const csrfToken = document.cookie
                .split("; ")
                .find((row) => row.startsWith("ced_csrf_token="))
                ?.split("=")[1];

            const response = await fetch(`/api/admin/programs/${initialData.id}/detail`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-csrf-token': csrfToken || ""
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const errorData = await response.json();
                const errorMessage = errorData.message || errorData.error || 'Failed to update detailed content';
                throw new Error(errorMessage);
            }

            await Swal.fire({
                title: "Success!",
                text: "Program Details updated successfully.",
                icon: "success",
                timer: 1500,
                showConfirmButton: false
            });
            router.refresh();
        } catch (error: any) {
            console.error("Error updating details:", error);
            Swal.fire("Error", error.message || "Failed to update details", "error");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <button
                        onClick={() => router.back()}
                        className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 mb-2 flex items-center gap-1"
                    >
                        ← Back to Programs
                    </button>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Edit Program: {initialData.en.title}</h1>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <nav className="-mb-px flex space-x-8 overflow-x-auto pb-px w-full sm:w-auto no-scrollbar" aria-label="Tabs">
                    <button
                        onClick={() => setActiveTab('general')}
                        className={`
                            whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                            ${activeTab === 'general'
                                ? 'border-primary-main text-primary-main'
                                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600'}
                        `}
                    >
                        General Information
                    </button>
                    <button
                        onClick={() => setActiveTab('detail')}
                        className={`
                            whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                            ${activeTab === 'detail'
                                ? 'border-primary-main text-primary-main'
                                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600'}
                        `}
                    >
                        Detailed Content
                    </button>
                </nav>

                {/* Preview Toggle - only show on detail tab */}
                {activeTab === 'detail' && (
                    <div className="flex w-full sm:w-auto justify-end pb-2 sm:pb-0">
                        <button
                            type="button"
                            onClick={() => setShowPreview(!showPreview)}
                            className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${showPreview
                                ? 'bg-primary-main text-white'
                                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                                }`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
                            {showPreview ? 'Hide Preview' : 'Show Preview'}
                        </button>
                    </div>
                )}
            </div>

            {activeTab === 'general' ? (
                <ProgramForm
                    initialData={initialData}
                    onSubmit={handleGeneralSubmit}
                    isLoading={isLoading}
                />
            ) : (
                <div className={`grid gap-6 ${showPreview ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
                    <div className="min-w-0">
                        <ProgramDetailsForm
                            initialData={detailsData as any}
                            generalData={initialData}
                            onSubmit={handleDetailSubmit}
                            isLoading={isLoading}
                            onFormDataChange={setPreviewData}
                        />
                    </div>
                    {showPreview && (
                        <div className="min-w-0 lg:sticky lg:top-4 lg:self-start">
                            <ProgramPreviewPanel data={previewData} />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
