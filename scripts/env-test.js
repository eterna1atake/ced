const nodemailer = require('nodemailer');
const { MongoClient } = require('mongodb');
const { BetaAnalyticsDataClient } = require('@google-analytics/data');
require('dotenv').config({ path: '.env.local' });

async function testAll() {
  console.log('\n--- 🧪 STARTING ENV CONNECTION TEST ---\n');

  // 1. Test MongoDB
  try {
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    console.log('✅ MongoDB: Connection Successful!');
    await client.close();
  } catch (err) {
    console.error('❌ MongoDB: FAILED -', err.message);
  }

  // 2. Test SMTP (Nodemailer)
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    await transporter.verify();
    console.log('✅ SMTP: Connection Successful (Gmail App Password is OK)!');
  } catch (err) {
    console.error('❌ SMTP: FAILED -', err.message);
  }

  // 3. Test GA4 (Google Analytics)
  try {
    const analyticsClient = new BetaAnalyticsDataClient({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.split('\\n').join('\n'), // Fix escaped newlines
      },
    });

    const [response] = await analyticsClient.runReport({
      property: `properties/${process.env.GA_PROPERTY_ID}`,
      dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
      metrics: [{ name: 'activeUsers' }],
    });
    console.log('✅ GA4: Connection Successful (Fetched data)!');
  } catch (err) {
    console.error('❌ GA4: FAILED -', err.message);
  }

  console.log('\n--- 🧪 TEST FINISHED ---\n');
}

testAll();
