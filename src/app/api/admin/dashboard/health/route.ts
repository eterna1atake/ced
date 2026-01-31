
import { NextRequest, NextResponse } from "next/server";
import dbConnect, { getConnectionState } from "@/lib/mongoose";
import os from "os";

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        // Ensure connection
        await dbConnect();

        // 1. Get DB Status
        const dbState = getConnectionState(); // You'll need to export this helper or rely on mongoose.connection.readyState
        // mongoose.connection.readyState: 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting

        // 2. Get System Memory/Storage (Node.js level)
        // Note: fs.statfs is not available in Vercel/Edge easily, but os.freemem is available in Node runtime.
        // For real disk usage in cloud, you might need cloud specific SDKs.
        // We will simulate storage check or use os info for simple stats.
        const freeMem = os.freemem();
        const totalMem = os.totalmem();
        const memUsage = ((totalMem - freeMem) / totalMem) * 100;

        return NextResponse.json({
            database: {
                status: dbState === 1 ? 'Connected' : 'Disconnected',
                latency: Math.floor(Math.random() * 50) + 10 + 'ms', // Mock latency for now
            },
            system: {
                memoryUsage: Math.round(memUsage),
                // Mock storage for demo as we can't easily check cloud storage quota here
                storageUsage: 45,
                uptime: os.uptime()
            }
        });

    } catch (error) {
        console.error("System Health Error:", error);
        return NextResponse.json({ error: "Failed to fetch health" }, { status: 500 });
    }
}
