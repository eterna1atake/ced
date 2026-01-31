import { getRealtimeTraffic } from "../src/lib/analytics";
import dotenv from "dotenv";
import path from "path";

// Load environment variables manually
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

async function testAnalytics() {
    console.log("🔍 Checking Environment Variables...");
    console.log("GA_PROPERTY_ID:", process.env.GA_PROPERTY_ID ? "✅ Loaded" : "❌ Missing");
    console.log("GOOGLE_CLIENT_EMAIL:", process.env.GOOGLE_CLIENT_EMAIL ? "✅ Loaded" : "❌ Missing");
    console.log("GOOGLE_PRIVATE_KEY:", process.env.GOOGLE_PRIVATE_KEY ? "✅ Loaded" : "❌ Missing");

    if (!process.env.GA_PROPERTY_ID || !process.env.GOOGLE_CLIENT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
        console.error("\n❌ Error: Missing credentials in .env file.");
        return;
    }

    console.log("\n📡 Connecting to Google Analytics 4...");
    try {
        const data = await getRealtimeTraffic();

        if (data.length > 0) {
            console.log("\n✅ Success! Retrieved data from GA4:");
            console.table(data);
        } else {
            console.log("\n⚠️ Connection successful, but no data returned (empty array). This might be normal for a new property.");
            console.log("Check if the Service Account Email is added to GA4 Property Access Management.");
        }
    } catch (error) {
        console.error("\n❌ Connection Failed:", error);
    }
}

testAnalytics();
