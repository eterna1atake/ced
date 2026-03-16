
import { MongoClient } from "mongodb";
import argon2 from "argon2";
import dotenv from "dotenv";
import readline from "readline";

// Load .env
dotenv.config({ path: ".env" });

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const question = (query: string): Promise<string> => {
    return new Promise((resolve) => rl.question(query, resolve));
};

async function main() {
    console.log("🚀 Admin User Creation Script");
    console.log("-----------------------------");

    const uri = process.env.MONGODB_URI;
    const dbName = process.env.MONGODB_DB_NAME;

    if (!uri) {
        console.error("❌ MONGODB_URI is missing in .env");
        process.exit(1);
    }

    console.log(`target DB: ${dbName}`);

    // Ask for username (Admin Alias)
    const username = await question("Enter Admin Alias (Username): ");
    if (!username || username.length < 3) {
        console.error("❌ Username must be at least 3 characters.");
        process.exit(1);
    }

    // Ask for password
    const password = await question("Enter Admin Password: ");
    if (!password || password.length < 8) {
        console.error("❌ Password must be at least 8 characters.");
        process.exit(1);
    }

    console.log("Connecting to Database...");
    const client = new MongoClient(uri);

    try {
        await client.connect();
        const db = client.db(dbName);
        const users = db.collection("users");

        // Hash Password
        console.log("Hashing password...");
        const passwordHash = await argon2.hash(password);

        // Check if user exists by username (Alias)
        const existingUser = await users.findOne({ username: username.toLowerCase() });

        const userData = {
            username: username.toLowerCase(),
            passwordHash: passwordHash,
            role: "superuser",
            isActive: true,
            failedLoginAttempts: 0,
            lockoutUntil: null,
            emailVerified: new Date(),
        };

        if (existingUser) {
            console.log(`User Alias: ${username} exists. Updating...`);
            await users.updateOne(
                { username: username.toLowerCase() },
                { $set: userData }
            );
            console.log("✅ User Updated Successfully!");
        } else {
            console.log(`User Alias: ${username} not found. Creating...`);
            // For new users, we use alias as a placeholder for email if not provided
            await users.insertOne({
                ...userData,
                email: `${username.toLowerCase()}@internal.ced`, // Placeholder for legacy field
                createdAt: new Date(),
            });
            console.log("✅ User Created Successfully!");
        }

    } catch (error) {
        console.error("❌ Error:", error);
    } finally {
        await client.close();
        rl.close();
    }
}

main();
