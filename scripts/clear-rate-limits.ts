import "dotenv/config";
import clientPromise from "@/lib/mongodb";

async function main() {
    console.log("Connecting to MongoDB...");
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME);

    console.log("Clearing rate limit collections...");
    const collections = ["login_fail_short", "login_fail_medium", "login_fail_long", "rlflx", "login_fail_limits"];

    for (const col of collections) {
        try {
            const res = await db.collection(col).deleteMany({});
            console.log(`- ${col}: Deleted ${res.deletedCount} records.`);
        } catch {
            console.log(`- ${col}: Error or not found.`);
        }
    }

    // Also clear OTPs just in case
    console.log("Clearing OTPs from users...");
    const userResult = await db.collection("users").updateMany(
        {},
        { $unset: { loginOtpHash: "", loginOtpExpires: "" } }
    );
    console.log(`Cleared OTPs for ${userResult.modifiedCount} users.`);

    process.exit(0);
}

main().catch(console.error);
