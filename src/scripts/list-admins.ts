import "dotenv/config";
import clientPromise from "@/lib/mongodb";

async function main() {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME);
    const users = await db.collection("users").find({ role: "superuser" }).toArray();

    console.log("Superusers found:");
    users.forEach(u => console.log(`- ${u.email}`));
    process.exit(0);
}

main().catch(console.error);
