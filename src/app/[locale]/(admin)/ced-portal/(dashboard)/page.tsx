"use client";

import {
    Grid,
    Card,
    Text,
    Metric,
    Title,
    AreaChart,
    BarChart,
    List,
    ListItem,
    Badge,
} from "@tremor/react";
import { useTranslations } from "next-intl";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRotate, faServer, faExternalLink } from "@fortawesome/free-solid-svg-icons";
import { Link } from "@/i18n/navigation";
import { useAdminData } from "@/contexts/AdminDataContext";

export default function AdminDashboardPage() {
    const t = useTranslations("Admin.pages.dashboard");
    const { stats, health: healthData, isLoading, lastUpdated, refresh: refreshData } = useAdminData();
    const data = stats;

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
                    <div className="flex justify-between">
                        <div>
                            <Title>{t("traffic.title")}</Title>
                            <Text>{t("traffic.subtitle")}</Text>
                        </div>
                        <Link href={"https://analytics.google.com"} target="_blank" rel="noopener noreferrer">
                            <Text className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-500">{t("traffic.viewAnalytics")}</Text>
                        </Link>
                    </div>
                    <AreaChart
                        className="h-72 mt-4"
                        data={(data?.traffic || []).map((item) => ({
                            ...item,
                            [t("traffic.visitors")]: item["Visitors"],
                            [t("traffic.pageViews")]: item["Page Views"]
                        }))}
                        index="time"
                        categories={[t("traffic.visitors"), t("traffic.pageViews")]}
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
                                        <div className="flex items-center gap-2">
                                            <Text className="font-medium text-slate-900 dark:text-slate-200">{t("health.mongodb")}</Text>
                                            <Link href="https://cloud.mongodb.com" target="_blank" rel="noopener noreferrer">
                                                <FontAwesomeIcon icon={faExternalLink} className="text-[10px] text-green-600" />
                                            </Link>
                                        </div>
                                        <Text className="text-xs">{healthData?.system.storageUsage}</Text>
                                    </div>
                                </div>
                                <div className="w-24 bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                                    <div className={`h-2.5 rounded-full ${healthData && healthData.system.storageUsagePercent > 80 ? 'bg-red-500' : 'bg-blue-500'}`} style={{ width: `${healthData?.system.storageUsagePercent || 0}%` }}></div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <FontAwesomeIcon icon={faServer} className="text-slate-400" />
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2">
                                            <Text className="font-medium text-slate-900 dark:text-slate-200">{t("health.cloudinary")}</Text>
                                            <Link href="https://console.cloudinary.com/app" target="_blank" rel="noopener noreferrer">
                                                <FontAwesomeIcon icon={faExternalLink} className="text-[10px] text-blue-500" />
                                            </Link>
                                        </div>
                                        <Text className="text-xs">{healthData?.cloudinary?.storage}</Text>
                                    </div>
                                </div>
                                <div className="w-24 bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 relative overflow-hidden">
                                    <div
                                        className={`h-2.5 rounded-full transition-all duration-500 ${healthData?.cloudinary && healthData.cloudinary.percent > 80 ? 'bg-red-500' : 'bg-cyan-500'}`}
                                        style={{ width: `${Math.min(100, healthData?.cloudinary?.percent || 0)}%` }}
                                    ></div>
                                </div>
                            </div>
                            {/* Cloudinary deletion note */}
                            <div className="mt-2 text-[11.5px] text-yellow-800 dark:text-yellow-500 leading-relaxed italic dark:bg-blue-900/10 border-blue-100/50 dark:border-blue-800/20">
                                {t("health.storageNote")}
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
                    <div className="flex justify-between">
                        <Title>{t("logs.title")}</Title>
                        <Link href="/ced-portal/login-history" >
                            <Text className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-500">{t("logs.viewAll")}</Text>
                        </Link>
                    </div>
                    <List className="mt-4">
                        {data?.logs.map((log) => (
                            <ListItem key={log._id}>
                                <div className="flex items-center space-x-4">
                                    <div className="flex flex-col">
                                        <Text className="font-medium truncate text-slate-900 dark:text-slate-100">
                                            {log.action.replace('_', ' ')}
                                        </Text>
                                        <Text className="truncate text-xs text-slate-500">
                                            by {log.actor}
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
