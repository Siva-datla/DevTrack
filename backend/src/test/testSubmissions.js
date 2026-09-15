import 'dotenv/config';
import http from 'http';
import app from '../app.js';
import { connectDB } from '../config/db.js';

async function runSubmissionsTests() {
  console.log('🚀 Starting Submissions API Test Suite...\n');

  // 1. Connect to DB
  await connectDB();

  // 2. Start server
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}`;
  console.log(`📡 Test server running on ${baseUrl}\n`);

  try {
    // Test 1: GET /api/submissions (Default query)
    console.log('Test 1: Default paginated submissions query');
    const res1 = await fetch(`${baseUrl}/api/submissions`);
    const data1 = await res1.json();
    console.log(`  Status: ${res1.status}`);
    console.log(`  Total items: ${data1.pagination?.total}`);
    console.log(`  Page limit: ${data1.pagination?.limit}`);
    console.log(`  Items returned: ${data1.data?.length}`);
    if (res1.status !== 200 || !data1.success || !Array.isArray(data1.data)) {
      throw new Error(`Failed default query: ${JSON.stringify(data1)}`);
    }
    console.log('  ✅ Default query returned valid pagination and records.\n');

    // Test 2: Platform Filter (HACKERRANK)
    console.log('Test 2: Filter by platform=HACKERRANK');
    const res2 = await fetch(`${baseUrl}/api/submissions?platform=HACKERRANK`);
    const data2 = await res2.json();
    console.log(`  Status: ${res2.status}`);
    console.log(`  HackerRank submissions: ${data2.data?.length}`);
    const allHackerRank = data2.data.every((s) => s.platform === 'HACKERRANK');
    if (!allHackerRank) throw new Error('Found non-HackerRank submission in filtered result');
    console.log('  ✅ Platform filtering is strictly accurate.\n');

    // Test 3: Platform Filter (CODEFORCES)
    console.log('Test 3: Filter by platform=CODEFORCES');
    const res3 = await fetch(`${baseUrl}/api/submissions?platform=CODEFORCES&limit=10`);
    const data3 = await res3.json();
    console.log(`  Status: ${res3.status}`);
    console.log(`  Codeforces submissions: ${data3.data?.length}`);
    const allCodeforces = data3.data.every((s) => s.platform === 'CODEFORCES');
    if (!allCodeforces) throw new Error('Found non-Codeforces submission in filtered result');
    console.log('  ✅ Codeforces platform filtering verified.\n');

    // Test 4: Search filter by substring
    const sampleItem = data1.data[0];
    if (sampleItem) {
      const searchTerm = sampleItem.problemName.slice(0, 5);
      console.log(`Test 4: Search by substring "${searchTerm}"`);
      const res4 = await fetch(`${baseUrl}/api/submissions?search=${encodeURIComponent(searchTerm)}`);
      const data4 = await res4.json();
      console.log(`  Status: ${res4.status}`);
      console.log(`  Matches found: ${data4.data?.length}`);
      if (res4.status !== 200 || data4.data.length === 0) {
        throw new Error('Search did not return expected matches');
      }
      console.log(`  First match: "${data4.data[0].problemName}"`);
      console.log('  ✅ Search filter successfully matched problem titles.\n');
    }

    // Test 5: Custom Pagination (page=2, limit=5)
    console.log('Test 5: Pagination check (page=2, limit=5)');
    const res5 = await fetch(`${baseUrl}/api/submissions?page=2&limit=5`);
    const data5 = await res5.json();
    console.log(`  Status: ${res5.status}`);
    console.log(`  Current Page: ${data5.pagination?.page}`);
    console.log(`  Items count: ${data5.data?.length}`);
    if (data5.pagination?.page !== 2 || data5.data?.length > 5) {
      throw new Error(`Pagination failed: ${JSON.stringify(data5.pagination)}`);
    }
    console.log('  ✅ Pagination page offset and page limit verified.\n');

    // Test 6: Single Submission Retrieval by ID
    if (sampleItem) {
      console.log(`Test 6: GET /api/submissions/:id with ID "${sampleItem._id}"`);
      const res6 = await fetch(`${baseUrl}/api/submissions/${sampleItem._id}`);
      const data6 = await res6.json();
      console.log(`  Status: ${res6.status}`);
      console.log(`  Fetched: "${data6.data?.problemName}" on ${data6.data?.platform}`);
      if (res6.status !== 200 || data6.data?._id !== sampleItem._id) {
        throw new Error('Single submission retrieval failed');
      }
      console.log('  ✅ Single submission retrieved accurately by ID.\n');
    }

    // Test 7: Submissions Summary Stats
    console.log('Test 7: GET /api/submissions/stats');
    const res7 = await fetch(`${baseUrl}/api/submissions/stats`);
    const data7 = await res7.json();
    console.log(`  Status: ${res7.status}`);
    console.log(`  Total: ${data7.data?.totalSubmissions}`);
    console.log(`  Accepted: ${data7.data?.acceptedSubmissions}`);
    console.log(`  By Platform:`, data7.data?.byPlatform);
    console.log(`  By Difficulty:`, data7.data?.byDifficulty);
    if (res7.status !== 200 || !data7.success || typeof data7.data?.totalSubmissions !== 'number') {
      throw new Error(`Stats endpoint failed: ${JSON.stringify(data7)}`);
    }
    console.log('  ✅ Aggregated submission metrics returned successfully.\n');

    console.log('🎉 ALL SUBMISSIONS API TESTS PASSED SUCCESSFULLY! 🎉\n');
  } finally {
    server.close();
    process.exit(0);
  }
}

runSubmissionsTests().catch((err) => {
  console.error('❌ Test failed with error:', err);
  process.exit(1);
});
