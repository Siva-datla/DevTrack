import 'dotenv/config';
import http from 'http';
import app from '../app.js';
import { connectDB } from '../config/db.js';
import User from '../models/User.js';
import Goal from '../models/Goal.js';
import Problem from '../models/Problem.js';
import Submission from '../models/Submission.js';
import PlatformAccount from '../models/PlatformAccount.js';

async function runCompletionTests() {
  console.log('🚀 Starting DevTrack Backend Completion Test Suite...\n');

  // 1. Connect to DB
  await connectDB();

  // 2. Start server on dynamic port
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}`;
  console.log(`📡 Test server running on ${baseUrl}\n`);

  const timestamp = Date.now();
  const regularEmail = `regular_${timestamp}@example.com`;
  const adminEmail = `admin_${timestamp}@example.com`;
  const password = 'Password123!';

  let regularToken = '';
  let adminToken = '';
  let regularUserId = '';
  let adminUserId = '';

  try {
    // ----------------------------------------------------
    // SETUP: Register Regular User & Admin User
    // ----------------------------------------------------
    console.log('--- SETUP: Creating Test Users ---');
    const regRes1 = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Regular Dev', email: regularEmail, password }),
    });
    const regData1 = await regRes1.json();
    regularToken = regData1.data?.tokens?.accessToken;
    regularUserId = regData1.data?.user?.id;

    const regRes2 = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Admin Dev', email: adminEmail, password }),
    });
    const regData2 = await regRes2.json();
    adminToken = regData2.data?.tokens?.accessToken;
    adminUserId = regData2.data?.user?.id;

    // Promote admin user in DB
    await User.findByIdAndUpdate(adminUserId, { role: 'ADMIN' });
    console.log(`  ✅ Regular User (${regularUserId}) and Admin User (${adminUserId}) ready.\n`);

    // Create a mock platform account and submissions for regular user
    await PlatformAccount.create({
      userId: regularUserId,
      platform: 'CODEFORCES',
      username: `coder_${timestamp}`,
      syncStatus: 'SUCCESS',
      rating: 1450,
      totalSolved: 3,
    });

    const sampleProblems = [
      {
        platform: 'CODEFORCES',
        externalId: `CF_101A_${timestamp}`,
        title: 'Watermelon Deluxe',
        difficulty: 'EASY',
        url: 'https://codeforces.com/contest/101/problem/A',
        tags: ['math', 'brute force'],
      },
      {
        platform: 'CODEFORCES',
        externalId: `CF_101B_${timestamp}`,
        title: 'Way Too Long Words',
        difficulty: 'EASY',
        url: 'https://codeforces.com/contest/101/problem/B',
        tags: ['strings', 'implementation'],
      },
      {
        platform: 'LEETCODE',
        externalId: `two-sum_${timestamp}`,
        title: 'Two Sum',
        difficulty: 'EASY',
        url: 'https://leetcode.com/problems/two-sum/',
        tags: ['array', 'hash table'],
      },
      {
        platform: 'LEETCODE',
        externalId: `median-of-arrays_${timestamp}`,
        title: 'Median of Two Sorted Arrays',
        difficulty: 'HARD',
        url: 'https://leetcode.com/problems/median-of-two-sorted-arrays/',
        tags: ['binary search', 'array'],
      },
    ];
    await Problem.insertMany(sampleProblems);

    // Regular user submissions
    await Submission.create([
      {
        userId: regularUserId,
        platform: 'CODEFORCES',
        platformSubmissionId: `sub_1_${timestamp}`,
        problemId: `CF_101A_${timestamp}`,
        problemName: 'Watermelon Deluxe',
        difficulty: 'EASY',
        verdict: 'ACCEPTED',
        submittedAt: new Date(),
      },
      {
        userId: regularUserId,
        platform: 'CODEFORCES',
        platformSubmissionId: `sub_2_${timestamp}`,
        problemId: `CF_101B_${timestamp}`,
        problemName: 'Way Too Long Words',
        difficulty: 'EASY',
        verdict: 'ACCEPTED',
        submittedAt: new Date(Date.now() - 86400000), // yesterday
      },
      {
        userId: regularUserId,
        platform: 'LEETCODE',
        platformSubmissionId: `sub_3_${timestamp}`,
        problemId: `median-of-arrays_${timestamp}`,
        problemName: 'Median of Two Sorted Arrays',
        difficulty: 'HARD',
        verdict: 'WRONG_ANSWER', // attempted
        submittedAt: new Date(),
      },
    ]);

    console.log('  ✅ Seeded mock platform account, problems, and submissions.\n');

    // ----------------------------------------------------
    // SECTION 1: GOALS API TESTS
    // ----------------------------------------------------
    console.log('--- SECTION 1: Goals Management API ---');

    // Test 1.1: Create Goal
    console.log('Test 1.1: POST /api/goals (Create SOLVE_PROBLEMS goal)');
    const createGoalRes = await fetch(`${baseUrl}/api/goals`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${regularToken}`,
      },
      body: JSON.stringify({
        title: 'Solve 10 Problems',
        type: 'SOLVE_PROBLEMS',
        target: 10,
        deadline: new Date(Date.now() + 7 * 86400000).toISOString(),
      }),
    });
    const createGoalData = await createGoalRes.json();
    console.log(`  Status: ${createGoalRes.status}`);
    console.log(`  Goal Title: "${createGoalData.data?.title}"`);
    console.log(`  Current Progress: ${createGoalData.data?.currentValue} / ${createGoalData.data?.target}`);
    if (createGoalRes.status !== 201 || !createGoalData.data?._id || createGoalData.data.currentValue !== 2) {
      throw new Error(`Create goal failed or progress not evaluated: ${JSON.stringify(createGoalData)}`);
    }
    const createdGoalId = createGoalData.data._id;
    console.log('  ✅ Goal created with live progress dynamically computed (2 solved).\n');

    // Test 1.2: GET /api/goals
    console.log('Test 1.2: GET /api/goals');
    const getGoalsRes = await fetch(`${baseUrl}/api/goals`, {
      headers: { Authorization: `Bearer ${regularToken}` },
    });
    const getGoalsData = await getGoalsRes.json();
    console.log(`  Status: ${getGoalsRes.status}`);
    console.log(`  Total Goals: ${getGoalsData.data?.length}`);
    if (getGoalsRes.status !== 200 || !Array.isArray(getGoalsData.data) || getGoalsData.data.length === 0) {
      throw new Error(`Get goals failed: ${JSON.stringify(getGoalsData)}`);
    }
    console.log('  ✅ Goals list retrieved successfully.\n');

    // Test 1.3: GET /api/goals/:id
    console.log(`Test 1.3: GET /api/goals/${createdGoalId}`);
    const getSingleGoalRes = await fetch(`${baseUrl}/api/goals/${createdGoalId}`, {
      headers: { Authorization: `Bearer ${regularToken}` },
    });
    const singleGoalData = await getSingleGoalRes.json();
    console.log(`  Status: ${getSingleGoalRes.status}`);
    if (getSingleGoalRes.status !== 200 || singleGoalData.data?._id !== createdGoalId) {
      throw new Error(`Get single goal failed: ${JSON.stringify(singleGoalData)}`);
    }
    console.log('  ✅ Single goal retrieved successfully.\n');

    // Test 1.4: PUT /api/goals/:id (Update Target)
    console.log(`Test 1.4: PUT /api/goals/${createdGoalId}`);
    const updateGoalRes = await fetch(`${baseUrl}/api/goals/${createdGoalId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${regularToken}`,
      },
      body: JSON.stringify({ target: 2 }), // Lower target to 2, should complete!
    });
    const updateGoalData = await updateGoalRes.json();
    console.log(`  Status: ${updateGoalRes.status}`);
    console.log(`  New Target: ${updateGoalData.data?.target}, Status: ${updateGoalData.data?.status}`);
    if (updateGoalRes.status !== 200 || updateGoalData.data?.status !== 'COMPLETED') {
      throw new Error(`Update goal did not complete: ${JSON.stringify(updateGoalData)}`);
    }
    console.log('  ✅ Goal updated and status automatically marked COMPLETED.\n');

    // Test 1.5: DELETE /api/goals/:id
    console.log(`Test 1.5: DELETE /api/goals/${createdGoalId}`);
    const delGoalRes = await fetch(`${baseUrl}/api/goals/${createdGoalId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${regularToken}` },
    });
    const delGoalData = await delGoalRes.json();
    console.log(`  Status: ${delGoalRes.status}`);
    if (delGoalRes.status !== 200 || !delGoalData.success) {
      throw new Error(`Delete goal failed: ${JSON.stringify(delGoalData)}`);
    }
    console.log('  ✅ Goal deleted successfully.\n');

    // ----------------------------------------------------
    // SECTION 2: PROBLEMS CATALOG API TESTS
    // ----------------------------------------------------
    console.log('--- SECTION 2: Problems Catalog API ---');

    // Test 2.1: Query all problems
    console.log('Test 2.1: GET /api/problems (default)');
    const problemsRes = await fetch(`${baseUrl}/api/problems`);
    const problemsData = await problemsRes.json();
    console.log(`  Status: ${problemsRes.status}`);
    console.log(`  Total Problems: ${problemsData.pagination?.total}`);
    if (problemsRes.status !== 200 || !Array.isArray(problemsData.data) || problemsData.data.length < 4) {
      throw new Error(`Problems list failed: ${JSON.stringify(problemsData)}`);
    }
    console.log('  ✅ Problems list and pagination verified.\n');

    // Test 2.2: Platform & Difficulty Filter
    console.log('Test 2.2: GET /api/problems?platform=CODEFORCES&difficulty=EASY');
    const filterProbRes = await fetch(`${baseUrl}/api/problems?platform=CODEFORCES&difficulty=EASY`);
    const filterProbData = await filterProbRes.json();
    console.log(`  Status: ${filterProbRes.status}`);
    console.log(`  Matches: ${filterProbData.data?.length}`);
    const allCFEasy = filterProbData.data.every((p) => p.platform === 'CODEFORCES' && p.difficulty === 'EASY');
    if (!allCFEasy || filterProbData.data.length === 0) {
      throw new Error('Platform and difficulty filter failed');
    }
    console.log('  ✅ Platform and difficulty filtering verified.\n');

    // Test 2.3: User Solve Status Annotation
    console.log('Test 2.3: GET /api/problems with Bearer Auth (verify solve status)');
    const authProbRes = await fetch(`${baseUrl}/api/problems`, {
      headers: { Authorization: `Bearer ${regularToken}` },
    });
    const authProbData = await authProbRes.json();
    console.log(`  Status: ${authProbRes.status}`);
    const watermelon = authProbData.data.find((p) => p.externalId.startsWith('CF_101A'));
    const median = authProbData.data.find((p) => p.externalId.startsWith('median-of-arrays'));
    const twoSum = authProbData.data.find((p) => p.externalId.startsWith('two-sum'));
    console.log(`  Watermelon status: ${watermelon?.userStatus} (Expected: SOLVED)`);
    console.log(`  Median status: ${median?.userStatus} (Expected: ATTEMPTED)`);
    console.log(`  Two Sum status: ${twoSum?.userStatus} (Expected: UNSOLVED)`);
    if (watermelon?.userStatus !== 'SOLVED' || median?.userStatus !== 'ATTEMPTED' || twoSum?.userStatus !== 'UNSOLVED') {
      throw new Error('User solve status annotation failed');
    }
    console.log('  ✅ User solve status accurately annotated.\n');

    // Test 2.4: Single Problem Details & Submissions
    console.log(`Test 2.4: GET /api/problems/:id with externalId "${watermelon?.externalId}"`);
    const singleProbRes = await fetch(`${baseUrl}/api/problems/${watermelon?.externalId}`, {
      headers: { Authorization: `Bearer ${regularToken}` },
    });
    const singleProbData = await singleProbRes.json();
    console.log(`  Status: ${singleProbRes.status}`);
    console.log(`  Problem Title: ${singleProbData.data?.title}`);
    console.log(`  Recent Submissions for Problem: ${singleProbData.data?.recentSubmissions?.length}`);
    if (singleProbRes.status !== 200 || singleProbData.data?.userStatus !== 'SOLVED' || singleProbData.data?.recentSubmissions?.length === 0) {
      throw new Error('Single problem retrieval failed');
    }
    console.log('  ✅ Single problem details with user submission history verified.\n');

    // ----------------------------------------------------
    // SECTION 3: CONTESTS & RATING HISTORY API TESTS
    // ----------------------------------------------------
    console.log('--- SECTION 3: Contests & Rating History API ---');

    // Test 3.1: GET /api/contests
    console.log('Test 3.1: GET /api/contests');
    const contestsRes = await fetch(`${baseUrl}/api/contests`);
    const contestsData = await contestsRes.json();
    console.log(`  Status: ${contestsRes.status}`);
    console.log(`  Total Upcoming Contests: ${contestsData.count}`);
    if (contestsRes.status !== 200 || !Array.isArray(contestsData.data) || contestsData.count === 0) {
      throw new Error(`Contests endpoint failed: ${JSON.stringify(contestsData)}`);
    }
    console.log(`  Sample Contest: "${contestsData.data[0].name}" on ${contestsData.data[0].platform}`);
    console.log('  ✅ Multi-platform contest calendar verified.\n');

    // Test 3.2: GET /api/contests/rating-history
    console.log(`Test 3.2: GET /api/contests/rating-history?userId=${regularUserId}`);
    const ratingRes = await fetch(`${baseUrl}/api/contests/rating-history?userId=${regularUserId}`);
    const ratingData = await ratingRes.json();
    console.log(`  Status: ${ratingRes.status}`);
    console.log(`  Connected Platforms: ${ratingData.data?.connectedPlatforms?.length}`);
    if (ratingRes.status !== 200 || !Array.isArray(ratingData.data?.history)) {
      throw new Error(`Rating history failed: ${JSON.stringify(ratingData)}`);
    }
    console.log('  ✅ Unified rating history timeline response verified.\n');

    // ----------------------------------------------------
    // SECTION 4: LEADERBOARD API TESTS
    // ----------------------------------------------------
    console.log('--- SECTION 4: Leaderboard API ---');

    // Test 4.1: GET /api/leaderboard (default by solved)
    console.log('Test 4.1: GET /api/leaderboard?sortBy=solved');
    const lbRes1 = await fetch(`${baseUrl}/api/leaderboard?sortBy=solved`);
    const lbData1 = await lbRes1.json();
    console.log(`  Status: ${lbRes1.status}`);
    console.log(`  Total Ranked Users: ${lbData1.pagination?.total}`);
    console.log(`  Top User: "${lbData1.data[0]?.name}" (Solved: ${lbData1.data[0]?.totalSolved}, Rank: #${lbData1.data[0]?.rank})`);
    if (lbRes1.status !== 200 || !Array.isArray(lbData1.data) || lbData1.data.length === 0) {
      throw new Error('Leaderboard default query failed');
    }
    console.log('  ✅ Leaderboard ranked by problems solved verified.\n');

    // Test 4.2: GET /api/leaderboard?sortBy=rating
    console.log('Test 4.2: GET /api/leaderboard?sortBy=rating');
    const lbRes2 = await fetch(`${baseUrl}/api/leaderboard?sortBy=rating`);
    const lbData2 = await lbRes2.json();
    console.log(`  Status: ${lbRes2.status}`);
    console.log(`  Top Rating: ${lbData2.data[0]?.peakRating} by ${lbData2.data[0]?.name}`);
    if (lbRes2.status !== 200 || typeof lbData2.data[0]?.peakRating !== 'number' || lbData2.data[0]?.peakRating < (lbData2.data[1]?.peakRating || 0)) {
      throw new Error('Leaderboard by rating failed');
    }
    console.log('  ✅ Leaderboard ranked by peak rating verified.\n');

    // Test 4.3: GET /api/leaderboard?sortBy=streak
    console.log('Test 4.3: GET /api/leaderboard?sortBy=streak');
    const lbRes3 = await fetch(`${baseUrl}/api/leaderboard?sortBy=streak`);
    const lbData3 = await lbRes3.json();
    console.log(`  Status: ${lbRes3.status}`);
    console.log(`  Top Streak: ${lbData3.data[0]?.currentStreak} days`);
    if (lbRes3.status !== 200 || typeof lbData3.data[0]?.currentStreak !== 'number') {
      throw new Error('Leaderboard by streak failed');
    }
    console.log('  ✅ Leaderboard ranked by streak verified.\n');

    // ----------------------------------------------------
    // SECTION 5: TOPIC ANALYTICS API TESTS
    // ----------------------------------------------------
    console.log('--- SECTION 5: Topic Analytics API ---');

    // Test 5.1: GET /api/dashboard/topics
    console.log(`Test 5.1: GET /api/dashboard/topics?userId=${regularUserId}`);
    const topicsRes = await fetch(`${baseUrl}/api/dashboard/topics?userId=${regularUserId}`);
    const topicsData = await topicsRes.json();
    console.log(`  Status: ${topicsRes.status}`);
    console.log(`  Total Topics: ${topicsData.data?.totalTopics}`);
    console.log(`  Topics Breakdown:`, topicsData.data?.topics);
    if (topicsRes.status !== 200 || !Array.isArray(topicsData.data?.topics) || topicsData.data?.totalTopics === 0) {
      throw new Error(`Topic analytics failed: ${JSON.stringify(topicsData)}`);
    }
    console.log('  ✅ Topic breakdown, frequency, and mastery levels verified.\n');

    // ----------------------------------------------------
    // SECTION 6: ADMIN SUITE API TESTS
    // ----------------------------------------------------
    console.log('--- SECTION 6: Admin Management Suite ---');

    // Test 6.1: Non-admin access should be rejected with 403
    console.log('Test 6.1: Regular User accesses /api/admin/stats (Expect 403)');
    const forbiddenRes = await fetch(`${baseUrl}/api/admin/stats`, {
      headers: { Authorization: `Bearer ${regularToken}` },
    });
    const forbiddenData = await forbiddenRes.json();
    console.log(`  Status: ${forbiddenRes.status}`);
    if (forbiddenRes.status !== 403 || forbiddenData.error?.code !== 'FORBIDDEN') {
      throw new Error(`Expected 403 Forbidden for non-admin: ${JSON.stringify(forbiddenData)}`);
    }
    console.log('  ✅ Non-admin correctly blocked from admin route.\n');

    // Test 6.2: Admin access to /api/admin/stats
    console.log('Test 6.2: Admin User accesses /api/admin/stats');
    const adminStatsRes = await fetch(`${baseUrl}/api/admin/stats`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const adminStatsData = await adminStatsRes.json();
    console.log(`  Status: ${adminStatsRes.status}`);
    console.log(`  Total Users: ${adminStatsData.data?.users?.total}`);
    console.log(`  Platform Accounts: ${adminStatsData.data?.platforms?.totalAccounts}`);
    console.log(`  Total Submissions: ${adminStatsData.data?.submissions?.total}`);
    if (adminStatsRes.status !== 200 || adminStatsData.data?.users?.total < 2) {
      throw new Error(`Admin stats failed: ${JSON.stringify(adminStatsData)}`);
    }
    console.log('  ✅ Admin platform system statistics verified.\n');

    // Test 6.3: Admin GET /api/admin/users
    console.log('Test 6.3: Admin User accesses /api/admin/users');
    const adminUsersRes = await fetch(`${baseUrl}/api/admin/users`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const adminUsersData = await adminUsersRes.json();
    console.log(`  Status: ${adminUsersRes.status}`);
    console.log(`  Users returned: ${adminUsersData.data?.length}`);
    if (adminUsersRes.status !== 200 || !Array.isArray(adminUsersData.data) || adminUsersData.data.length < 2) {
      throw new Error(`Admin users query failed: ${JSON.stringify(adminUsersData)}`);
    }
    console.log('  ✅ Admin user list with platform counts verified.\n');

    // Test 6.4: Admin PATCH /api/admin/users/:id/status
    console.log(`Test 6.4: Admin promotes regular user (${regularUserId}) to ADMIN`);
    const patchRes = await fetch(`${baseUrl}/api/admin/users/${regularUserId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ role: 'ADMIN' }),
    });
    const patchData = await patchRes.json();
    console.log(`  Status: ${patchRes.status}`);
    console.log(`  Updated Role: ${patchData.data?.role}`);
    if (patchRes.status !== 200 || patchData.data?.role !== 'ADMIN') {
      throw new Error(`Admin patch failed: ${JSON.stringify(patchData)}`);
    }
    console.log('  ✅ User role successfully updated by admin.\n');

    // Test 6.5: Admin GET /api/admin/sync-logs
    console.log('Test 6.5: Admin User accesses /api/admin/sync-logs');
    const logsRes = await fetch(`${baseUrl}/api/admin/sync-logs`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const logsData = await logsRes.json();
    console.log(`  Status: ${logsRes.status}`);
    console.log(`  Sync Logs returned: ${logsData.data?.length}`);
    if (logsRes.status !== 200 || !Array.isArray(logsData.data)) {
      throw new Error(`Admin sync logs failed: ${JSON.stringify(logsData)}`);
    }
    console.log('  ✅ Admin synchronization logs verified.\n');

    console.log('🎉 ALL BACKEND COMPLETION TESTS PASSED ACCURATELY! 🎉\n');
  } finally {
    // Cleanup created test records
    await User.deleteMany({ email: { $in: [regularEmail, adminEmail] } });
    await Goal.deleteMany({ userId: { $in: [regularUserId, adminUserId] } });
    await Submission.deleteMany({ userId: { $in: [regularUserId, adminUserId] } });
    await PlatformAccount.deleteMany({ userId: { $in: [regularUserId, adminUserId] } });
    await Problem.deleteMany({ externalId: { $regex: new RegExp(`_${timestamp}$`) } });

    server.close();
    process.exit(0);
  }
}

runCompletionTests().catch((err) => {
  console.error('❌ Test suite failed with error:', err);
  process.exit(1);
});
