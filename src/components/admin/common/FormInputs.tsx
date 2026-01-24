"use client";

import { memo } from "react";

// --- Types ---

export interface FormFieldProps {
    label: string;
    name: string;
    value: string | number;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    onBlur?: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    required?: boolean;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
    type?: string;
    error?: string;
    hint?: React.ReactNode;
    suffix?: React.ReactNode;
}

export interface FormSelectProps extends Omit<FormFieldProps, "type" | "placeholder"> {
    options: { value: string | number; label: string }[];
}

export interface FormTextareaProps extends FormFieldProps {
    rows?: number;
}

// --- Components ---

export const FormInput = memo(({
    label, name, value, onChange, onBlur, required, placeholder, className = "", disabled, type = "text", error, hint, ...props
}: FormFieldProps) => (
    <div className={className}>
        <label htmlFor={name} className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div className="relative">
            <input
                id={name}
                type={type}
                name={name}
                required={required}
                disabled={disabled}
                value={value}
                onChange={onChange}
                onBlur={onBlur}
                className={`w-full px-4 py-2 h-[42px] border rounded-lg outline-none transition-all 
        ${error ? "border-red-500 focus:ring-red-200 dark:focus:ring-red-900/50" : "border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary-main/20 focus:border-primary-main hover:border-slate-300 dark:hover:border-slate-600"}
        ${disabled ? "bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-500 cursor-not-allowed" : "bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"}
        ${props.suffix ? "pr-10" : ""}
      `}
                placeholder={placeholder}
            />
            {props.suffix && (
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    {props.suffix}
                </div>
            )}
        </div>
        {hint && <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">{hint}</div>}
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
));

FormInput.displayName = "FormInput";

export const FormTextarea = memo(({
    label, name, value, onChange, rows = 4, placeholder, className = "", disabled, required, error, hint
}: FormTextareaProps) => (
    <div className={className}>
        <label htmlFor={name} className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <textarea
            id={name}
            name={name}
            rows={rows}
            required={required}
            disabled={disabled}
            value={value}
            onChange={onChange}
            className={`w-full px-4 py-2 border rounded-lg outline-none transition-all resize-y
        ${error ? "border-red-500 focus:ring-red-200 dark:focus:ring-red-900/50" : "border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary-main/20 focus:border-primary-main hover:border-slate-300 dark:hover:border-slate-600"}
        ${disabled ? "bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-500 cursor-not-allowed" : "bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"}
      `}
            placeholder={placeholder}
        />
        {hint && <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">{hint}</div>}
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
));

FormTextarea.displayName = "FormTextarea";

export const FormSelect = memo(({
    label, name, value, onChange, options, required, className = "", disabled, error, hint
}: FormSelectProps) => (
    <div className={className}>
        <label htmlFor={name} className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <select
            id={name}
            name={name}
            required={required}
            disabled={disabled}
            value={value}
            onChange={onChange}
            className={`w-full px-4 py-2 h-[42px] border rounded-lg outline-none transition-all bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100
        ${error ? "border-red-500 focus:ring-red-200 dark:focus:ring-red-900/50" : "border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary-main/20 focus:border-primary-main hover:border-slate-300 dark:hover:border-slate-600"}
        ${disabled ? "bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-500 cursor-not-allowed" : ""}
      `}
        >
            {options.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">
                    {opt.label}
                </option>
            ))}
        </select>
        {hint && <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">{hint}</div>}
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
));

FormSelect.displayName = "FormSelect";
