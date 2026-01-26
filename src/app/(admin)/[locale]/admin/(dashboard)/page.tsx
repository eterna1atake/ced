"use client";

import { useEffect, useState } from "react";
import {
    Grid,
    Col,
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
import { faRotate } from "@fortawesome/free-solid-svg-icons";

// Mock data generator for realtime effect
const generateMockTraffic = () => {
    const data = [];
    const now = new Date();
    for (let i = 24; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 60 * 60 * 1000);
        data.push({
            time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            "Visitors": Math.floor(Math.random() * 100) + 50,
            "Page Views": Math.floor(Math.random() * 200) + 100,
        });
    }
    return data;
};

export default function AdminDashboardPage() {
    const t = useTranslations("Admin.pages.dashboard");
    const [trafficData, setTrafficData] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [dateString, setDateString] = useState("");

    // Initialize data
    useEffect(() => {
        setTrafficData(generateMockTraffic());
        setDateString(new Date().toLocaleString());
        setIsLoading(false);

        // Update time every second
        const interval = setInterval(() => {
            setDateString(new Date().toLocaleString());
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const refreshData = () => {
        setIsLoading(true);
        setTimeout(() => {
            setTrafficData(generateMockTraffic());
            setIsLoading(false);
        }, 500);
    };

    const categories = [
        { title: "News Posts", metric: "24", sub: "+2 this week", color: "blue" },
        { title: "Personnel", metric: "18", sub: "Active Staff", color: "emerald" },
        { title: "Pending Forms", metric: "5", sub: "To Review", color: "amber" },
        { title: "System Status", metric: "Online", sub: "99.9% Uptime", color: "indigo" },
    ];

    const contentBreakdown = [
        { name: "News", value: 45 },
        { name: "Activities", value: 30 },
        { name: "Announcements", value: 15 },
        { name: "Others", value: 10 },
    ];

    const recentLogs = [
        { action: "Admin Login", user: "superuser", time: "2 mins ago", status: "success" },
        { action: "Update News", user: "editor", time: "15 mins ago", status: "success" },
        { action: "Update Personnel", user: "admin", time: "1 hour ago", status: "success" },
        { action: "Failed Login", user: "unknown", time: "3 hours ago", status: "failed" },
        { action: "Backup Created", user: "system", time: "1 day ago", status: "success" },
    ];

    return (
        <main className="p-2 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <Title className="text-2xl font-bold dark:text-slate-100">{t("title")}</Title>
                    <Text className="dark:text-slate-400">Real-time system monitor & analytics</Text>
                </div>
                <div className="flex items-center gap-4">
                    <Text className="font-mono text-sm dark:text-slate-400">{dateString}</Text>
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
                    <Card key={item.title} decoration="top" decorationColor={item.color as any}>
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
                    <Title>Website Traffic (Last 24 Hours)</Title>
                    <Text>Visitors and Page Views trend</Text>
                    <AreaChart
                        className="h-72 mt-4"
                        data={trafficData}
                        index="time"
                        categories={["Visitors", "Page Views"]}
                        colors={["indigo", "cyan"]}
                        valueFormatter={(number) => Intl.NumberFormat("us").format(number).toString()}
                        showAnimation={true}
                    />
                </Card>

                {/* Content Stats Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                        <Title>Content Distribution</Title>
                        <DonutChart
                            className="mt-6 h-60"
                            data={contentBreakdown}
                            category="value"
                            index="name"
                            valueFormatter={(number) => `${number}%`}
                            colors={["slate", "violet", "indigo", "rose"]}
                        />
                    </Card>
                    <Card>
                        <Title>Engagement by Category</Title>
                        <BarChart
                            className="mt-6 h-60"
                            data={[
                                { topic: "Academic", "Views": 450 },
                                { topic: "Events", "Views": 320 },
                                { topic: "Research", "Views": 210 },
                                { topic: "General", "Views": 150 },
                            ]}
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
                    <Title>Recent Activity Logs</Title>
                    <List className="mt-4">
                        {recentLogs.map((log, idx) => (
                            <ListItem key={idx}>
                                <div className="flex items-center space-x-4">
                                    <div className="flex flex-col">
                                        <Text className="font-medium truncate text-slate-900 dark:text-slate-100">{log.action}</Text>
                                        <Text className="truncate">by {log.user}</Text>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <Text>{log.time}</Text>
                                    <Badge color={log.status === 'success' ? 'emerald' : 'rose'}>
                                        {log.status}
                                    </Badge>
                                </div>
                            </ListItem>
                        ))}
                    </List>
                </Card>
            </div>
        </main>
    );
}
