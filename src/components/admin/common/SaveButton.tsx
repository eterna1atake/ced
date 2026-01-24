import React from 'react';

interface SaveButtonProps {
    isLoading?: boolean;
    label?: string;
    loadingLabel?: string;
    onClick?: () => void;
    type?: "submit" | "button";
    disabled?: boolean;
    className?: string;
}

export default function SaveButton({
    isLoading = false,
    label = "Save",
    loadingLabel = "Saving...",
    onClick,
    type = "submit",
    disabled = false,
    className = ""
}: SaveButtonProps) {
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={isLoading || disabled}
            className={`
                bg-primary-main hover:bg-primary-hover text-white px-4 py-2 rounded-lg font-medium shadow-lg 
                transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2
                ${className}
            `}
        >
            {isLoading && (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            )}
            {isLoading ? loadingLabel : label}
        </button>
    );
}
