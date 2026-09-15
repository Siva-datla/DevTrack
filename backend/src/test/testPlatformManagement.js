import 'dotenv/config';
import http from 'http';
import app from '../app.js';
import { connectDB } from '../config/db.js';
import User from '../models/User.js';
import PlatformAccount from '../models/PlatformAccount.js';
import Submission from '../models/Submission.js';

async function runPlatformManagementTests() {
  console.log('🚀 Starting Platform Account Management Test Suite...\n');

  // 1. Connect to DB
  await connectDB();

  // 2. Start server
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}`;
  console.log(`📡 Test server running on ${baseUrl}\n`);

  const testEmail = `platform_user_${Date.now()}@example.com`;
  const testPassword = 'Password123!';
  let accessToken = '';
  let userId = '';

  try {
    // Step 0: Register a fresh user
    console.log('Step 0: Registering test user');
    const regRes = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Platform Tester',
        email: testEmail,
        password: testPassword,
      }),
    });
    const regData = await regRes.json();
    accessToken = regData.data.tokens.accessToken;
    userId = regData.data.user.id;
    console.log(`  Registered user ID: ${userId}\n`);

    // Test 1: GET /api/platforms (Empty list initially)
    console.log('Test 1: GET /api/platforms (Initially empty)');
    const res1 = await fetch(`${baseUrl}/api/platforms`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const data1 = await res1.json();
    console.log(`  Status: ${res1.status}`);
    console.log(`  Count: ${data1.count}`);
    if (res1.status !== 200 || data1.count !== 0) {
      throw new Error(`Expected empty list, got: ${JSON.stringify(data1)}`);
    }
    console.log('  ✅ Initially zero linked platforms.\n');

    // Test 2: POST /api/platforms (Link HackerRank account 'sivaD')
    console.log('Test 2: POST /api/platforms (Link and sync HackerRank "sivaD")');
    const res2 = await fetch(`${baseUrl}/api/platforms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        platform: 'HACKERRANK',
        username: 'sivaD',
      }),
    });
    const data2 = await res2.json();
    console.log(`  Status: ${res2.status}`);
    console.log(`  Message: ${data2.message}`);
    console.log(`  Account linked: ${data2.data?.account?.platform} @${data2.data?.account?.username}`);
    console.log(`  Total Solved: ${data2.data?.account?.totalSolved}`);
    if (res2.status !== 201 || !data2.success || data2.data?.account?.platform !== 'HACKERRANK') {
      throw new Error(`Failed to link platform: ${JSON.stringify(data2)}`);
    }
    console.log('  ✅ Platform linked and initial sync completed.\n');

    // Test 3: GET /api/platforms (Now contains 1 platform)
    console.log('Test 3: GET /api/platforms (Verify linked account appears)');
    const res3 = await fetch(`${baseUrl}/api/platforms`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const data3 = await res3.json();
    console.log(`  Status: ${res3.status}`);
    console.log(`  Platforms count: ${data3.count}`);
    console.log(`  Platform: ${data3.data[0]?.platform}, username: ${data3.data[0]?.username}`);
    if (data3.count !== 1 || data3.data[0]?.username !== 'sivaD') {
      throw new Error(`Platform verification failed: ${JSON.stringify(data3)}`);
    }
    console.log('  ✅ Linked platform retrieved in list.\n');

    // Test 4: GET /api/platforms/hackerrank/status
    console.log('Test 4: GET /api/platforms/hackerrank/status');
    const res4 = await fetch(`${baseUrl}/api/platforms/hackerrank/status`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const data4 = await res4.json();
    console.log(`  Status: ${res4.status}`);
    console.log(`  Sync Status: ${data4.data?.syncStatus}`);
    console.log(`  Total Solved: ${data4.data?.totalSolved}`);
    if (res4.status !== 200 || data4.data?.syncStatus !== 'SUCCESS') {
      throw new Error(`Status check failed: ${JSON.stringify(data4)}`);
    }
    console.log('  ✅ Platform status verified.\n');

    // Test 5: POST /api/platforms/hackerrank/sync-account (Manual re-sync)
    console.log('Test 5: POST /api/platforms/hackerrank/sync-account (Trigger re-sync)');
    const res5 = await fetch(`${baseUrl}/api/platforms/hackerrank/sync-account`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const data5 = await res5.json();
    console.log(`  Status: ${res5.status}`);
    console.log(`  Sync Message: ${data5.message}`);
    if (res5.status !== 200 || !data5.success) {
      throw new Error(`Re-sync failed: ${JSON.stringify(data5)}`);
    }
    console.log('  ✅ Manual re-sync executed successfully.\n');

    // Test 6: DELETE /api/platforms/hackerrank (Unlink platform)
    console.log('Test 6: DELETE /api/platforms/hackerrank (Unlink account)');
    const res6 = await fetch(`${baseUrl}/api/platforms/hackerrank`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const data6 = await res6.json();
    console.log(`  Status: ${res6.status}`);
    console.log(`  Message: ${data6.message}`);
    console.log(`  Purged Submissions: ${data6.purgedSubmissions}`);
    if (res6.status !== 200 || !data6.success) {
      throw new Error(`Unlink failed: ${JSON.stringify(data6)}`);
    }
    console.log('  ✅ Platform unlinked successfully.\n');

    // Test 7: GET /api/platforms (Verify empty again)
    console.log('Test 7: GET /api/platforms (Verify empty after unlinking)');
    const res7 = await fetch(`${baseUrl}/api/platforms`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const data7 = await res7.json();
    console.log(`  Status: ${res7.status}`);
    console.log(`  Platforms count: ${data7.count}`);
    if (data7.count !== 0) {
      throw new Error(`Expected 0 platforms after unlink, got: ${data7.count}`);
    }
    console.log('  ✅ Account list is clean after unlinking.\n');

    console.log('🎉 ALL PLATFORM ACCOUNT MANAGEMENT TESTS PASSED! 🎉\n');
  } finally {
    // Clean up test user & accounts
    if (userId) {
      await User.findByIdAndDelete(userId);
      await PlatformAccount.deleteMany({ userId });
      await Submission.deleteMany({ userId });
    }
    server.close();
    process.exit(0);
  }
}

runPlatformManagementTests().catch((err) => {
  console.error('❌ Test failed with error:', err);
  process.exit(1);
});
