
"use client";

import { useState, useRef } from "react";
import Image from "next/image";

type FileUploadProps = {
    label?: string;
    value?: string;           // The current URL
    onChange: (url: string) => void;
    accept?: string;          // e.g. "image/*", ".pdf"
    maxSizeMB?: number;       // default 5
    helperText?: string;
    folder?: string;          // Cloudinary folder
};

export default function FileUpload({
    label = "Upload File",
    value,
    onChange,
    accept = "image/*",
    maxSizeMB = 5,
    helperText,
    folder
}: FileUploadProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const validateAndUpload = async (file: File) => {
        setError(null);

        // Security & Format Validation
        const allowedExtensions = accept.split(",").map(ext => ext.trim());
        const fileExt = `.${file.name.split(".").pop()?.toLowerCase()}`;

        const isValidType = allowedExtensions.some(ext => {
            if (ext.startsWith("image/")) {
                return file.type.startsWith("image/");
            }
            if (ext.startsWith(".")) {
                return fileExt === ext;
            }
            if (ext === "application/pdf" && file.type === "application/pdf") {
                return true;
            }
            return file.type === ext;
        });

        if (!isValidType && accept !== "*") {
            setError(`Invalid file type. Expected: ${accept}`);
            return;
        }

        if (file.size > maxSizeMB * 1024 * 1024) {
            setError(`File size exceeds ${maxSizeMB}MB`);
            return;
        }

        setIsUploading(true);
        const formData = new FormData();
        formData.append("file", file);
        if (folder) formData.append("folder", folder);

        // [Fix] Add CSRF Token to headers
        const csrfToken = document.cookie
            .split("; ")
            .find((row) => row.startsWith("ced_csrf_token="))
            ?.split("=")[1];

        try {
            const res = await fetch("/api/upload", {
                method: "POST",
                headers: {
                    "x-csrf-token": csrfToken || "",
                },
                body: formData,
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Upload failed");
            }

            const data = await res.json();
            onChange(data.url);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Upload failed");
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) validateAndUpload(file);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) validateAndUpload(file);
    };

    const clearFile = () => {
        onChange("");
        setError(null);
    };

    const isImage = value && (value.match(/\.(jpeg|jpg|gif|png|webp|svg)$/i) || accept.includes("image/"));
    const isPdf = value && value.toLowerCase().endsWith(".pdf");
    const isWord = value && (value.toLowerCase().endsWith(".doc") || value.toLowerCase().endsWith(".docx"));
    const isExcel = value && (value.toLowerCase().endsWith(".xls") || value.toLowerCase().endsWith(".xlsx"));


    return (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{label}</label>

            {value ? (
                <div className="relative group border rounded-md overflow-hidden bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                    {isImage ? (
                        <div className="relative w-full h-48 bg-slate-200 dark:bg-slate-900">
                            <Image
                                src={value}
                                alt="Preview"
                                fill
                                className="object-contain"
                                unoptimized
                            />
                        </div>
                    ) : (
                        <div className="p-4 flex items-center gap-3">
                            <div className={`w-10 h-10 rounded flex items-center justify-center text-white font-bold uppercase text-[10px] ${isPdf ? "bg-red-500" :
                                isWord ? "bg-blue-600" :
                                    isExcel ? "bg-emerald-600" :
                                        "bg-slate-400"
                                }`}>
                                {isPdf ? "PDF" : isWord ? "WORD" : isExcel ? "EXCEL" : "FILE"}
                            </div>
                            <a
                                href={value}
                                target="_blank"
                                rel="noreferrer"
                                className="text-sm text-blue-600 dark:text-blue-400 hover:underline truncate max-w-xs block"
                            >
                                {value}
                            </a>
                        </div>
                    )}

                    <button
                        type="button"
                        onClick={clearFile}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full shadow-md hover:bg-red-600 transition-colors"
                        title="Remove file"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            ) : (
                <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`
                        border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center cursor-pointer transition-all
                        ${isUploading ? "bg-slate-50 dark:bg-slate-800/50 border-slate-300 dark:border-slate-700 pointer-events-none" : ""}
                        ${isDragging
                            ? "bg-indigo-50 dark:bg-indigo-900/10 border-indigo-500 dark:border-indigo-500 scale-[1.02]"
                            : "hover:bg-indigo-50 dark:hover:bg-slate-800 hover:border-indigo-300 dark:hover:border-slate-500 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"}
                    `}
                >
                    {isUploading ? (
                        <div className="flex flex-col items-center text-indigo-600 animate-pulse">
                            <svg className="animate-spin h-6 w-6 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span className="text-sm font-medium">Uploading...</span>
                        </div>
                    ) : (
                        <>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-10 h-10 mb-2 transition-colors ${isDragging ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400 dark:text-slate-500"}`}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                            </svg>
                            <span className="text-sm text-slate-600 dark:text-slate-300 font-medium">
                                {isDragging ? "Drop to upload" : "Click or drag file here"}
                            </span>
                            <span className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                                {helperText || `${accept.replace(/\*/g, "")} files, max ${maxSizeMB}MB`}
                            </span>
                        </>
                    )}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept={accept}
                        onChange={handleFileChange}
                        disabled={isUploading}
                        className="hidden"
                    />
                </div>
            )
            }

            {error && <p className="text-xs text-red-500 mt-1 font-medium">{error}</p>}
        </div >
    );
}
