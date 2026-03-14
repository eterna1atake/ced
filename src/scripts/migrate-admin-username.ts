
import { MongoClient, ObjectId } from 'mongodb';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME;
const ADMIN_EMAIL = process.argv[2] || process.env.ADMIN_EMAIL;
const NEW_USERNAME = process.env.ADMIN_USERNAME || "ced_master_admin";

if (!MONGODB_URI || !MONGODB_DB_NAME) {
  console.error("Missing required environment variables (MONGODB_URI, MONGODB_DB_NAME)");
  process.exit(1);
}

if (!ADMIN_EMAIL) {
  console.error("Please provide ADMIN_EMAIL as an argument or in .env (legacy)");
  console.log("Usage: npm run migrate-admin-username <email>");
  process.exit(1);
}

async function migrate() {
  const client = new MongoClient(MONGODB_URI as string);
  try {
    await client.connect();
    console.log("Connected to MongoDB");
    const db = client.db(MONGODB_DB_NAME);
    const users = db.collection('users');

    const adminUser = await users.findOne({ email: ADMIN_EMAIL!.toLowerCase().trim() });
    if (!adminUser) {
      console.error(`Admin user not found with email: ${ADMIN_EMAIL}`);
      return;
    }

    const result = await users.updateOne(
      { _id: adminUser._id },
      { $set: { username: NEW_USERNAME } }
    );

    if (result.modifiedCount > 0) {
      console.log(`Successfully added username '${NEW_USERNAME}' to user ${ADMIN_EMAIL}`);
    } else {
      console.log(`User ${ADMIN_EMAIL} already has a username or update failed.`);
    }
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await client.close();
  }
}

migrate();
