import "dotenv/config";
import { MongoClient } from "mongodb";
import argon2 from "argon2";

async function main() {
    console.log("🔍 Starting Auth Diagnostic...");

    // 1. Check Env Vars
    const uri = process.env.MONGODB_URI;
    const dbName = process.env.MONGODB_DB_NAME;
    const secret = process.env.AUTH_SECRET;

    console.log("Checking Env Vars:");
    console.log(`- MONGODB_URI: ${uri ? "OK (Hidden)" : "MISSING ❌"}`);
    console.log(`- MONGODB_DB_NAME: ${dbName ? dbName : "MISSING ❌"}`);
    console.log(`- AUTH_SECRET: ${secret ? "OK (Hidden)" : "MISSING ❌"}`);

    if (!uri) {
        console.error("❌ Critical: MONGODB_URI is missing.");
        process.exit(1);
    }

    // 2. Test MongoDB Connection
    console.log("\nTesting MongoDB Connection...");
    let client;
    try {
        client = new MongoClient(uri);
        await client.connect();
        const db = client.db(dbName);
        const ping = await db.command({ ping: 1 });
        console.log("✅ MongoDB Connected Successfully!");
        console.log("Ping Result:", ping);

        if (dbName) {
            const userCount = await db.collection("users").countDocuments();
            console.log(`User Count in 'users' collection: ${userCount}`);
        }

    } catch (error) {
        console.error("❌ MongoDB Connection Failed:", error);
    } finally {
        if (client) await client.close();
    }

    // 3. Test Argon2
    console.log("\nTesting Argon2 Hashing...");
    try {
        const password = "password123";
        const hash = await argon2.hash(password);
        console.log("✅ Argon2 Hashing Success!");
        console.log("Sample Hash:", hash);
        const verify = await argon2.verify(hash, password);
        console.log("✅ Argon2 Verify Success:", verify);
    } catch (error) {
        console.error("❌ Argon2 Failed:", error);
    }

    console.log("\nDiagnostic Complete.");
}

main();
