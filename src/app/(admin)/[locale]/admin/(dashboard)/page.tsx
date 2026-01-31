"use client";

import { useEffect, useState } from "react";
import {
    Grid,
    Card,
    Text,
    Metric,
    Title,
    AreaChart,
    BarChart,
    DonutChart,
    List,
    ListItem,
    Badge
} from "@tremor/react";
import { useTranslations } from "next-intl";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRotate, faServer } from "@fortawesome/free-solid-svg-icons";

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
        actorEmail: string;
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
        memoryUsage: number;
        storageUsage: number;
        uptime: number;
    };
}

export default function AdminDashboardPage() {
    const t = useTranslations("Admin.pages.dashboard");
    const [data, setData] = useState<DashboardStats | null>(null);
    const [healthData, setHealthData] = useState<HealthData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [lastUpdated, setLastUpdated] = useState("");

    const fetchStats = async () => {
        try {
            setIsRefreshing(true);
            const res = await fetch('/api/admin/dashboard/stats');
            if (res.ok) {
                const jsonData = await res.json();
                setData(jsonData);
                setLastUpdated(new Date().toLocaleTimeString());
            }

            // Fetch health data
            const healthRes = await fetch('/api/admin/dashboard/health');
            if (healthRes.ok) {
                const healthJson = await healthRes.json();
                setHealthData(healthJson);
            }

        } catch (error) {
            console.error("Failed to fetch dashboard stats", error);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    // Initialize data
    useEffect(() => {
        fetchStats();
    }, []);

    const refreshData = () => {
        fetchStats();
    };

    const categories = [
        {
            title: t("stats.news"),
            metric: data?.stats.news ?? 0,
            sub: t("stats.sub.news"),
            color: "blue"
        },
        {
            title: t("stats.personnel"),
            metric: data?.stats.personnel ?? 0,
            sub: t("stats.sub.personnel"),
            color: "emerald"
        },
        {
            title: t("stats.awards"),
            metric: data?.stats.awards ?? 0,
            sub: t("stats.sub.awards"),
            color: "amber"
        },
        {
            title: t("stats.services"),
            metric: data?.stats.services ?? 0,
            sub: t("stats.sub.services"),
            color: "indigo"
        },
    ];

    return (
        <main className="p-2 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <Title className="text-2xl font-bold dark:text-slate-100">{t("title")}</Title>
                    <Text className="dark:text-slate-400">Real-time system monitor & analytics</Text>
                </div>
                <div className="flex items-center gap-4">
                    <Text className="font-mono text-sm dark:text-slate-400">{lastUpdated}</Text>
                    <button
                        onClick={refreshData}
                        className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                        title="Refresh Data"
                    >
                        <FontAwesomeIcon icon={faRotate} className={`w-4 h-4 text-slate-600 dark:text-slate-300 ${isLoading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <Grid numItems={1} numItemsSm={2} numItemsLg={4} className="gap-6">
                {categories.map((item) => (
                    <Card key={item.title} decoration="top" decorationColor={item.color}>
                        <Text>{item.title}</Text>
                        <Metric>{item.metric}</Metric>
                        <Text className="mt-2 text-slate-500">{item.sub}</Text>
                    </Card>
                ))}
            </Grid>

            {/* Dashboard Sections */}
            <div className="mt-6 space-y-6">
                {/* Traffic Section */}
                <Card>
                    <Title>{t("traffic.title")}</Title>
                    <Text>{t("traffic.subtitle")}</Text>
                    <AreaChart
                        className="h-72 mt-4"
                        data={data?.traffic || []}
                        index="time"
                        categories={["Visitors", "Page Views"]}
                        colors={["indigo", "cyan"]}
                        valueFormatter={(number) => Intl.NumberFormat("us").format(number).toString()}
                        showAnimation={true}
                    />
                </Card>

                {/* System Stats Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                        <Title>{t("health.title")}</Title>
                        <div className="mt-4 space-y-4">
                            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className={`w-3 h-3 rounded-full ${healthData?.database.status === 'Connected' ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                                    <div className="flex flex-col">
                                        <Text className="font-medium text-slate-900 dark:text-slate-200">{t("health.database")}</Text>
                                        <Text className="text-xs">
                                            {healthData?.database.status === 'Connected' ? t("health.connected") : t("health.disconnected") || healthData?.database.status}
                                        </Text>
                                    </div>
                                </div>
                                <Badge size="xs" color={healthData?.database.status === 'Connected' ? 'emerald' : 'rose'}>
                                    {healthData?.database.latency}
                                </Badge>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <FontAwesomeIcon icon={faServer} className="text-slate-400" />
                                    <div className="flex flex-col">
                                        <Text className="font-medium text-slate-900 dark:text-slate-200">{t("health.storage")}</Text>
                                        <Text className="text-xs">{healthData?.system.storageUsage}% {t("health.used")}</Text>
                                    </div>
                                </div>
                                <div className="w-24 bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                                    <div className={`h-2.5 rounded-full ${healthData && healthData.system.storageUsage > 80 ? 'bg-red-500' : 'bg-blue-500'}`} style={{ width: `${healthData?.system.storageUsage || 0}%` }}></div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <FontAwesomeIcon icon={faServer} className="text-slate-400" />
                                    <div className="flex flex-col">
                                        <Text className="font-medium text-slate-900 dark:text-slate-200">{t("health.memory")}</Text>
                                        <Text className="text-xs">{healthData?.system.memoryUsage}% {t("health.used")}</Text>
                                    </div>
                                </div>
                                <div className="w-24 bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                                    <div className={`h-2.5 rounded-full ${healthData && healthData.system.memoryUsage > 80 ? 'bg-red-500' : 'bg-purple-500'}`} style={{ width: `${healthData?.system.memoryUsage || 0}%` }}></div>
                                </div>
                            </div>
                        </div>
                    </Card>
                    <Card>
                        <Title>{t("engagement.title")}</Title>
                        <BarChart
                            className="mt-6 h-60"
                            data={data?.engagement || []}
                            index="topic"
                            categories={["Views"]}
                            colors={["blue"]}
                            layout="vertical"
                            valueFormatter={(number) => Intl.NumberFormat("us").format(number).toString()}
                        />
                    </Card>
                </div>

                {/* System Logs Section */}
                <Card>
                    <Title>{t("logs.title")}</Title>
                    <List className="mt-4">
                        {data?.logs.map((log) => (
                            <ListItem key={log._id}>
                                <div className="flex items-center space-x-4">
                                    <div className="flex flex-col">
                                        <Text className="font-medium truncate text-slate-900 dark:text-slate-100">
                                            {log.action.replace('_', ' ')}
                                        </Text>
                                        <Text className="truncate text-xs text-slate-500">
                                            by {log.actorEmail}
                                        </Text>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <Text className="text-xs text-slate-400">
                                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </Text>
                                    <Badge size="xs" color={
                                        log.status === 'SUCCESS' ? 'emerald' :
                                            log.status === 'FAILED' ? 'rose' : 'blue'
                                    }>
                                        {log.status || 'INFO'}
                                    </Badge>
                                </div>
                            </ListItem>
                        ))}
                        {(!data?.logs || data.logs.length === 0) && (
                            <div className="text-center py-4 text-slate-400 text-sm">{t("logs.noActivity")}</div>
                        )}
                    </List>
                </Card>
            </div>
        </main>
    );
}
