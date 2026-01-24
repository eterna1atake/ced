"use client";

import { useState, useEffect } from "react";
import ProgramDetailTemplate from "@/components/programs/ProgramDetailTemplate";
import { notFound } from "next/navigation";
import { useTranslations } from "next-intl";

export default function PhDProgramPageClient() {
    const t = useTranslations("Breadcrumbs");
    const [programData, setProgramData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetch("/api/public/programs/phd")
            .then(res => res.json())
            .then(data => {
                setProgramData(data.detail);
                setIsLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch program detail:", err);
                setIsLoading(false);
            });
    }, []);

    if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

    if (!programData) {
        notFound();
    }

    return (
        <ProgramDetailTemplate
            data={programData}
            breadcrumbLabel={t("phd")}
        />
    );
}
