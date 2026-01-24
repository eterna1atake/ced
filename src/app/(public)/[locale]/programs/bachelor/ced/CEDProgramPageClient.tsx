"use client";

import { useState, useEffect } from "react";
import ProgramDetailTemplate from "@/components/programs/ProgramDetailTemplate";
import { useTranslations } from "next-intl";
import { notFound } from "next/navigation";

export default function CEDProgramPageClient() {
    const breadcrumb = useTranslations("Breadcrumbs");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [programData, setProgramData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetch("/api/public/programs/ced")
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
            breadcrumbLabel={breadcrumb("ced")}
        />
    );
}