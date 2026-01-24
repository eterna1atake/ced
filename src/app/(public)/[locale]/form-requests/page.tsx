import { getApiBaseUrl } from "@/lib/api-config";
import FormRequestPageClient from "./FormRequestPageClient";

async function getFormRequests() {
    const baseUrl = getApiBaseUrl();
    try {
        const res = await fetch(`${baseUrl}/api/public/form-requests`, { cache: 'no-store' });
        if (!res.ok) return [];
        return res.json();
    } catch (error) {
        console.error("Failed to fetch form requests:", error);
        return [];
    }
}

export default async function FormRequestPage() {
    const initialForms = await getFormRequests();

    return <FormRequestPageClient initialForms={initialForms} />;
}
