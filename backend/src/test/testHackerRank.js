import 'dotenv/config';
import http from 'http';
import app from '../app.js';
import { connectDB } from '../config/db.js';
import PlatformAccount from '../models/PlatformAccount.js';
import Submission from '../models/Submission.js';
import HackerRankService from '../services/platforms/hackerrankService.js';
import SyncService from '../services/syncService.js';

async function runHackerRankTests() {
  console.log('🚀 Starting HackerRank Integration Test Suite...\n');

  // 1. Connect to DB
  await connectDB();

  // 2. Start server
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}`;
  console.log(`📡 Test server running on ${baseUrl}\n`);

  const testUsername = 'sivaD';

  try {
    // Test 1: HackerRankService.getUserProfile
    console.log(`Test 1: HackerRankService.getUserProfile("${testUsername}")`);
    const profile = await HackerRankService.getUserProfile(testUsername);
    console.log(`  Username: ${profile.username}`);
    console.log(`  Name: ${profile.name}`);
    console.log(`  Country: ${profile.country}`);
    if (!profile.username) throw new Error('Failed to fetch profile username');
    console.log('  ✅ Profile fetched successfully.\n');

    // Test 2: HackerRankService.getBadges
    console.log(`Test 2: HackerRankService.getBadges("${testUsername}")`);
    const badges = await HackerRankService.getBadges(testUsername);
    console.log(`  Badges count: ${badges.length}`);
    badges.forEach((b) => {
      console.log(`    - ${b.badge_name}: ${b.stars} stars, ${b.solved} solved, points: ${b.current_points}`);
    });
    if (!Array.isArray(badges) || badges.length === 0) throw new Error('Expected at least one badge');
    console.log('  ✅ Badges fetched successfully.\n');

    // Test 3: HackerRankService.getScores
    console.log(`Test 3: HackerRankService.getScores("${testUsername}")`);
    const scores = await HackerRankService.getScores(testUsername);
    console.log(`  Scores count: ${scores.length}`);
    console.log('  ✅ Scores fetched successfully.\n');

    // Test 4: HackerRankService.getRecentChallenges
    console.log(`Test 4: HackerRankService.getRecentChallenges("${testUsername}")`);
    const challenges = await HackerRankService.getRecentChallenges(testUsername, 10);
    console.log(`  Recent challenges fetched: ${challenges.length}`);
    if (challenges.length > 0) {
      console.log(`    Sample: ${challenges[0].name} (${challenges[0].ch_slug})`);
    }
    console.log('  ✅ Recent challenges fetched successfully.\n');

    // Test 5: API Endpoint GET /api/platforms/hackerrank/:username
    console.log(`Test 5: GET ${baseUrl}/api/platforms/hackerrank/${testUsername}`);
    const apiRes = await fetch(`${baseUrl}/api/platforms/hackerrank/${testUsername}`);
    const apiData = await apiRes.json();
    console.log(`  Status: ${apiRes.status}`);
    console.log(`  Total Solved across badges: ${apiData.data?.totalSolved}`);
    console.log(`  Badges returned: ${apiData.data?.badges?.length}`);
    if (apiRes.status !== 200 || !apiData.success) {
      throw new Error(`API returned error: ${JSON.stringify(apiData)}`);
    }
    console.log('  ✅ Normalized profile API endpoint returned successfully.\n');

    // Test 6: Sync HackerRank into MongoDB
    console.log(`Test 6: POST /api/platforms/hackerrank/sync`);
    const syncRes = await fetch(`${baseUrl}/api/platforms/hackerrank/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: testUsername }),
    });
    const syncData = await syncRes.json();
    console.log(`  Status: ${syncRes.status}`);
    console.log(`  Sync result:`, syncData.data);
    if (syncRes.status !== 200 || !syncData.success) {
      throw new Error(`Sync failed: ${JSON.stringify(syncData)}`);
    }
    console.log('  ✅ HackerRank sync endpoint completed.\n');

    // Test 7: Verify DB state in MongoDB
    console.log('Test 7: Verify MongoDB PlatformAccount & Submission documents');
    const account = await PlatformAccount.findOne({ platform: 'HACKERRANK' });
    console.log(`  PlatformAccount in DB: username="${account?.username}", totalSolved=${account?.totalSolved}, status=${account?.syncStatus}`);
    if (!account || account.syncStatus !== 'SUCCESS') {
      throw new Error('PlatformAccount not found or syncStatus is not SUCCESS');
    }

    const savedSubsCount = await Submission.countDocuments({ platform: 'HACKERRANK' });
    console.log(`  Submissions saved in DB for HACKERRANK: ${savedSubsCount}`);
    console.log('  ✅ DB records verified successfully.\n');

    console.log('🎉 ALL HACKERRANK INTEGRATION TESTS PASSED SUCCESSFULLY! 🎉\n');
  } finally {
    server.close();
    process.exit(0);
  }
}

runHackerRankTests().catch((err) => {
  console.error('❌ Test failed with error:', err);
  process.exit(1);
});
