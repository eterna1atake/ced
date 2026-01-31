import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import clientPromise from "@/lib/mongodb";
import News from "@/collections/News";
import Personnel from "@/collections/Personnel";
import Award from "@/collections/Award";
import StudentService from "@/collections/StudentService";
import { getRealtimeTraffic, getPageEngagement } from "@/lib/analytics";

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        await dbConnect();

        // 1. Fetch Counts
        const newsCount = await News.countDocuments({ status: 'published' });
        const personnelCount = await Personnel.countDocuments({});
        const awardCount = await Award.countDocuments({});
        const serviceCount = await StudentService.countDocuments({});

        // 2. Fetch Recent Logs (Mix of System & Login)
        const client = await clientPromise;
        const db = client.db(process.env.MONGODB_DB_NAME);

        const systemLogsCollection = db.collection("audit_system_logs");
        const loginLogsCollection = db.collection("audit_login_logs");

        // Fetch top 5 from both then merge (efficient enough for dashboard)
        const systemLogs = await systemLogsCollection.find({})
            .sort({ timestamp: -1 })
            .limit(5)
            .project({ action: 1, actorEmail: 1, timestamp: 1, details: 1, ip: 1 })
            .toArray();

        const loginLogs = await loginLogsCollection.find({})
            .sort({ timestamp: -1 })
            .limit(5)
            .project({ email: 1, status: 1, timestamp: 1, ip: 1 })
            .toArray();

        // Normalize and Merge
        const normalizedSystemLogs = systemLogs.map(log => ({
            _id: log._id.toString(),
            action: log.action,
            actorEmail: log.actorEmail,
            timestamp: log.timestamp,
            status: 'SUCCESS', // System logs are usually success actions
            details: log.details,
            type: 'system'
        }));

        const normalizedLoginLogs = loginLogs.map(log => ({
            _id: log._id.toString(),
            action: 'LOGIN',
            actorEmail: log.email,
            timestamp: log.timestamp,
            status: log.status,
            details: log.status === 'SUCCESS' ? 'Login Successful' : 'Login Failed',
            type: 'login'
        }));

        const recentLogs = [...normalizedSystemLogs, ...normalizedLoginLogs]
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, 5);

        // 3. Traffic & Engagement Data (GA4 Only)
        const trafficData = await getRealtimeTraffic();
        const engagementData = await getPageEngagement();

        return NextResponse.json({
            stats: {
                news: newsCount,
                personnel: personnelCount,
                awards: awardCount,
                services: serviceCount
            },
            logs: recentLogs,
            traffic: trafficData,
            engagement: engagementData
        });

    } catch (error) {
        console.error("Dashboard Stats Error:", error);
        return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
    }
}
