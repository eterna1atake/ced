import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect, { getConnectionState } from "@/lib/mongoose";
import { auth } from "@/lib/auth";
import os from "os";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const session = await auth();
        if (!session || session.user.role !== "superuser") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();
        const dbState = getConnectionState();

        let dbLatency = null;
        let dbSize = null;
        let dbSizePercent = 0;

        if (dbState === 1 && mongoose.connection.db) {
            const start = performance.now();
            await mongoose.connection.db.admin().ping();
            const end = performance.now();
            dbLatency = Math.round(end - start);

            // Get DB Stats
            try {
                const stats = await mongoose.connection.db.stats();
                const usedSize = (stats.dataSize / (1024 * 1024)); // Value in MB
                const limitSize = parseInt(process.env.MONGODB_STORAGE_LIMIT_MB || '512', 10);

                const usedSizeStr = usedSize.toFixed(2);
                dbSize = `${usedSizeStr} MB / ${limitSize} MB`;
                dbSizePercent = (usedSize / limitSize) * 100;
            } catch (e) {
                console.error('Failed to get db stats:', e);
            }
        }

        // 2. Get System Memory (Node.js level)
        const freeMem = os.freemem();
        const totalMem = os.totalmem();
        const usedMem = (totalMem - freeMem) / (1024 * 1024 * 1024);
        const totalMemGb = totalMem / (1024 * 1024 * 1024);

        const memUsage = `${usedMem.toFixed(2)} GB / ${totalMemGb.toFixed(2)} GB`;
        const memUsagePercent = ((totalMem - freeMem) / totalMem) * 100;

        return NextResponse.json({
            database: {
                status: dbState === 1 ? 'Connected' : 'Disconnected',
                latency: dbLatency !== null ? `${dbLatency}ms` : 'N/A',
            },
            system: {
                memoryUsage: memUsage,
                memoryUsagePercent: Math.round(memUsagePercent),
                storageUsage: dbSize || '0 MB / 512 MB',
                storageUsagePercent: Math.round(dbSizePercent || 0),
                uptime: os.uptime()
            }
        });

    } catch (error) {
        console.error("System Health Error:", error);
        return NextResponse.json({ error: "Failed to fetch health" }, { status: 500 });
    }
}
