import PersonnelDetailPageClient from "./PersonnelDetailPageClient";
import { notFound } from "next/navigation";
import { getApiBaseUrl } from "@/lib/api-config";

async function getPersonnelById(id: string) {
    const baseUrl = getApiBaseUrl();
    console.log(`Fetching Personnel: ${baseUrl}/api/public/personnel/${id}`);
    try {
        const res = await fetch(`${baseUrl}/api/public/personnel/${id}`, {
            cache: 'no-store'
        });
        console.log(`Fetch Status: ${res.status}`);
        if (!res.ok) {
            const txt = await res.text();
            console.log(`Fetch Error Response: ${txt}`);
            return null;
        }
        return res.json();
    } catch (error) {
        console.error("Failed to fetch personnel:", error);
        return null;
    }
}

export default async function PersonnelDetailPage({
    params,
}: {
    params: Promise<{ id: string; locale: string }>;
}) {
    const { id } = await params;
    const person = await getPersonnelById(id);

    if (!person) {
        notFound();
    }

    return <PersonnelDetailPageClient person={person} />;
}
