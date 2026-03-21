import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect, { getConnectionState } from "@/lib/mongoose";
import { auth } from "@/lib/auth";
import os from "os";

// We use require for cloudinary to ensure stability in ESM environments for Next.js routes
import { v2 as cloudinary } from "cloudinary";

export const dynamic = 'force-dynamic';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

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

        // 2. Get Cloudinary Usage
        let cloudinaryUsage = {
            storage: 'N/A',
            percent: 0
        };

        try {
            const usage = await cloudinary.api.usage();
            
            if (usage) {
                const usedBytes = usage.storage?.usage || 0;
                let limitBytes = usage.storage?.limit || 0;

                // Fallback to credits if storage limit is zero
                if (limitBytes === 0 && usage.credits) {
                    limitBytes = usage.credits.limit || 0;
                }

                // If limit is small (e.g., 25), it's likely in GB units from the credits plan
                if (limitBytes > 0 && limitBytes < 1024) {
                    limitBytes = limitBytes * 1024 * 1024 * 1024;
                }

                // Final fallback if everything is 0
                if (limitBytes === 0) {
                    limitBytes = 25 * 1024 * 1024 * 1024; // 25 GB default
                }

                const formatSize = (bytes: number) => {
                    if (bytes < 1024 * 1024 * 1024) {
                        return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
                    }
                    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
                };

                const calcPercent = limitBytes > 0 ? Math.round((usedBytes / limitBytes) * 100) : 0;

                cloudinaryUsage = {
                    storage: `${formatSize(usedBytes)} / ${formatSize(limitBytes)}`,
                    percent: Math.min(calcPercent, 100)
                };
            }
        } catch (e: unknown) {
            console.error('Failed to fetch Cloudinary usage:', e);
        }

        // 3. Get Database Status/Stats
        return NextResponse.json({
            database: {
                status: dbState === 1 ? 'Connected' : 'Disconnected',
                latency: dbLatency !== null ? `${dbLatency}ms` : 'N/A',
            },
            system: {
                storageUsage: dbSize || '0 MB / 512 MB',
                storageUsagePercent: Math.round(dbSizePercent || 0),
                uptime: os.uptime()
            },
            cloudinary: cloudinaryUsage
        });

    } catch (error) {
        console.error("System Health Error:", error);
        return NextResponse.json({ error: "Failed to fetch health" }, { status: 500 });
    }
}
