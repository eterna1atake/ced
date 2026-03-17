import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import clientPromise from "@/lib/mongodb";
import News from "@/collections/News";
import Personnel from "@/collections/Personnel";
import Award from "@/collections/Award";
import StudentService from "@/collections/StudentService";
import { getRealtimeTraffic, getPageEngagement } from "@/lib/analytics";
import { globalRateLimit as rateLimit } from '@/lib/rate-limit';
import { auth } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const rateLimitError = await rateLimit(request);
        if (rateLimitError) return rateLimitError;

        const session = await auth();
        if (!session || session.user.role !== "superuser") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();

        // 1. Fetch Counts in Parallel
        const [newsCount, personnelCount, awardCount, serviceCount] = await Promise.all([
            News.countDocuments({ status: 'published' }),
            Personnel.countDocuments({}),
            Award.countDocuments({}),
            StudentService.countDocuments({})
        ]);

        // 2. Fetch Recent Logs using MongoDB Aggregation for efficiency
        const client = await clientPromise;
        const db = client.db(process.env.MONGODB_DB_NAME);

        const recentLogs = await db.collection("audit_system_logs").aggregate([
            {
                $project: {
                    action: 1,
                    actor: 1,
                    timestamp: 1,
                    details: 1,
                    status: { $literal: "SUCCESS" },
                    type: { $literal: "system" }
                }
            },
            {
                $unionWith: {
                    coll: "audit_login_logs",
                    pipeline: [
                        {
                            $project: {
                                action: { $literal: "LOGIN" },
                                actor: "$username",
                                timestamp: 1,
                                status: 1,
                                details: {
                                    $cond: {
                                        if: { $eq: ["$status", "SUCCESS"] },
                                        then: "Login Successful",
                                        else: "Login Failed"
                                    }
                                },
                                type: { $literal: "login" }
                            }
                        }
                    ]
                }
            },
            { $sort: { timestamp: -1 } },
            { $limit: 10 }
        ]).toArray();

        // Ensure IDs are strings and take top 5
        const formattedLogs = recentLogs.map(log => ({
            ...log,
            _id: log._id.toString()
        })).slice(0, 5);

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
            logs: formattedLogs,
            traffic: trafficData,
            engagement: engagementData
        });

    } catch (error) {
        console.error("Dashboard Stats Error:", error);
        return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
    }
}
