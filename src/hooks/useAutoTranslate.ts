import { useState } from "react";
import { useTranslations } from "next-intl";

export type TranslationField = "title" | "summary" | "content" | "name" | "description" | "project" | "department" | "position";

export function useAutoTranslate() {
    const [isTranslating, setIsTranslating] = useState<Record<string, boolean>>({});
    const tAlert = useTranslations("Admin.alerts");

    const translate = async (
        field: TranslationField | string,
        text: string,
        onSuccess: (translatedText: string) => void
    ) => {
        if (!text) return;

        setIsTranslating(prev => ({ ...prev, [field]: true }));
        try {
            const csrfToken = document.cookie
                .split("; ")
                .find((row) => row.startsWith("ced_csrf_token="))
                ?.split("=")[1];

            const res = await fetch("/cedweb/api/ced-portal/translate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-csrf-token": csrfToken || "",
                },
                body: JSON.stringify({ text }),
            });

            if (!res.ok) throw new Error("Translation failed");

            const data = await res.json();
            onSuccess(data.translatedText);
        } catch (error) {
            console.error("Translation error:", error);
            const Swal = (await import("sweetalert2")).default;
            Swal.fire({
                title: tAlert("translationFailed"),
                text: tAlert("translationFailedDesc"),
                icon: "error",
                timer: 3000,
                toast: true,
                position: 'top-end',
                showConfirmButton: false
            });
        } finally {
            setIsTranslating(prev => ({ ...prev, [field]: false }));
        }
    };

    return { translate, isTranslating };
}
