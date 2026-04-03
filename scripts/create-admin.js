const { MongoClient } = require('mongodb');
const argon2 = require('argon2');
require('dotenv').config({ path: '.env.local' });

async function createAdmin() {
  // --- กำหนดข้อมูลแอดมินคนแรกที่นี่! ---
  const adminEmail = 'admin';
  const adminPassword = 'password';
  const adminName = 'CED System Admin';
  // ------------------------------

  console.log('\n--- 🛠️ CREATING FIRST ADMIN USER ---\n');

  try {
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    console.log('✅ Connected to MongoDB at', process.env.MONGODB_URI);

    const db = client.db(process.env.MONGODB_DB_NAME || 'ced_portal_db');
    const usersCollection = db.collection('users');

    // 1. ตรวจสอบว่ามี Admin อยู่หรือยัง
    const existingUser = await usersCollection.findOne({ email: adminEmail });
    if (existingUser) {
      console.log('⚠️ User with this email already exists!');
      await client.close();
      return;
    }

    // 2. Hash Password ด้วย argon2 (สอดคล้องกับที่แอปใช้)
    const hashedPassword = await argon2.hash(adminPassword);

    // 3. สร้าง User Object
    const newUser = {
      name: adminName,
      email: adminEmail,
      password: hashedPassword,
      role: 'admin', // กำหนดเป็นแอดมิน
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // 4. บันทึกลงฐานข้อมูล
    await usersCollection.insertOne(newUser);
    console.log('🚀 SUCCESS: Admin user created successfully!');
    console.log('📧 Email:', adminEmail);
    console.log('🔑 Password:', adminPassword);

    await client.close();
  } catch (err) {
    console.error('❌ ERROR: Could not create admin -', err.message);
  }

  console.log('\n--- 🏁 SCRIPT FINISHED ---\n');
}

createAdmin();
