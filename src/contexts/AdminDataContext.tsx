
"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

// Types matching API response
interface DashboardStats {
    stats: {
        news: number;
        personnel: number;
        awards: number;
        services: number;
    };
    logs: {
        _id: string;
        action: string;
        actor: string;
        timestamp: string;
        status?: string;
        details?: string;
    }[];
    traffic: {
        time: string;
        "Visitors": number;
        "Page Views": number;
    }[];
    engagement: {
        topic: string;
        "Views": number;
    }[];
}

interface HealthData {
    database: {
        status: string;
        latency: string;
    };
    system: {
        storageUsage: string;
        storageUsagePercent: number;
        uptime: number;
    };
    cloudinary?: {
        storage: string;
        percent: number;
    };
}

interface AdminDataContextType {
    stats: DashboardStats | null;
    health: HealthData | null;
    isLoading: boolean;
    lastUpdated: string;
    refresh: () => Promise<void>;
}

const AdminDataContext = createContext<AdminDataContextType | undefined>(undefined);

export function AdminDataProvider({ children }: { children: ReactNode }) {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [health, setHealth] = useState<HealthData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [lastUpdated, setLastUpdated] = useState("");
    const [hasFetched, setHasFetched] = useState(false);

    const fetchAllData = useCallback(async (isSilent = false) => {
        if (!isSilent) setIsLoading(true);
        try {
            const [statsRes, healthRes] = await Promise.all([
                fetch('/cedweb/api/ced-portal/dashboard/stats'),
                fetch('/cedweb/api/ced-portal/dashboard/health')
            ]);

            if (statsRes.ok) {
                const statsJson = await statsRes.json();
                setStats(statsJson);
            }

            if (healthRes.ok) {
                const healthJson = await healthRes.json();
                setHealth(healthJson);
            }

            setLastUpdated(new Date().toLocaleTimeString());
            setHasFetched(true);
        } catch (error) {
            console.error("Failed to fetch admin data", error);
        } finally {
            if (!isSilent) setIsLoading(false);
        }
    }, []);

    // Initial fetch only once per layout mount
    useEffect(() => {
        if (!hasFetched) {
            fetchAllData();
        }
    }, [hasFetched, fetchAllData]);

    const refresh = useCallback(async () => {
        await fetchAllData();
    }, [fetchAllData]);

    return (
        <AdminDataContext.Provider value={{ stats, health, isLoading, lastUpdated, refresh }}>
            {children}
        </AdminDataContext.Provider>
    );
}

export function useAdminData() {
    const context = useContext(AdminDataContext);
    if (context === undefined) {
        throw new Error("useAdminData must be used within an AdminDataProvider");
    }
    return context;
}
