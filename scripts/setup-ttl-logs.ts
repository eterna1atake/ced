import "dotenv/config";
import clientPromise from "../src/lib/mongodb";

async function setupTTL() {
    console.log("--- Setting up TTL Index for Logs (180 Days) ---");
    
    try {
        const client = await clientPromise;
        const db = client.db(process.env.MONGODB_DB_NAME);

        const expireAfterSeconds = 180 * 24 * 60 * 60; // 180 days in seconds

        console.log(`Setting expiration to: ${expireAfterSeconds} seconds (180 days)`);

        // 1. สำหรับ Login Logs (audit_login_logs)
        // Check if index already exists to avoid conflict if configuration changed
        try {
            await db.collection("audit_login_logs").dropIndex("timestamp_1");
        } catch (e) {
            // Index might not exist, ignore error
        }
        
        await db.collection("audit_login_logs").createIndex(
            { timestamp: 1 }, 
            { expireAfterSeconds: expireAfterSeconds, name: "timestamp_1" }
        );
        console.log("✅ TTL Index created for audit_login_logs");

        // 2. สำหรับ System Logs (audit_system_logs)
        try {
            await db.collection("audit_system_logs").dropIndex("timestamp_1");
        } catch (e) {
            // Index might not exist, ignore error
        }

        await db.collection("audit_system_logs").createIndex(
            { timestamp: 1 }, 
            { expireAfterSeconds: expireAfterSeconds, name: "timestamp_1" }
        );
        console.log("✅ TTL Index created for audit_system_logs");

        console.log("--- Setup Complete ---");
        console.log("MongoDB will now automatically delete logs older than 180 days.");
        process.exit(0);
    } catch (error) {
        console.error("❌ Error setting up TTL:", error);
        process.exit(1);
    }
}

setupTTL();
