import 'dotenv/config';
import http from 'http';
import app from '../app.js';
import { connectDB } from '../config/db.js';
import User from '../models/User.js';

async function runAuthTests() {
  console.log('🚀 Starting Authentication Flow Test Suite...\n');

  // 1. Connect to DB
  await connectDB();

  // 2. Start temporary server on an open port
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}`;
  console.log(`📡 Test server running on ${baseUrl}\n`);

  const testEmail = `testuser_${Date.now()}@example.com`;
  const testPassword = 'Password123!';
  let accessToken = '';
  let refreshToken = '';

  try {
    // Clean up any test user beforehand
    await User.deleteMany({ email: { $regex: /^testuser_/ } });

    // Test 1: Register New User
    console.log('Test 1: User Registration');
    const regRes = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Coder',
        email: testEmail,
        password: testPassword,
      }),
    });
    const regData = await regRes.json();
    console.log(`  Status: ${regRes.status}`);
    console.log(`  Success: ${regData.success}`);
    if (regRes.status !== 201 || !regData.data?.tokens?.accessToken) {
      throw new Error(`Registration failed: ${JSON.stringify(regData)}`);
    }
    console.log('  ✅ User registered successfully with tokens.\n');

    // Test 2: Duplicate Registration Check
    console.log('Test 2: Duplicate Email Rejection');
    const dupRes = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Another User',
        email: testEmail,
        password: testPassword,
      }),
    });
    const dupData = await dupRes.json();
    console.log(`  Status: ${dupRes.status} (Expected 409)`);
    if (dupRes.status !== 409) {
      throw new Error(`Duplicate registration should return 409: ${JSON.stringify(dupData)}`);
    }
    console.log('  ✅ Duplicate email rejected with 409 Conflict.\n');

    // Test 3: Invalid Login Credentials
    console.log('Test 3: Invalid Password Login');
    const badLoginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'wrong_password',
      }),
    });
    const badLoginData = await badLoginRes.json();
    console.log(`  Status: ${badLoginRes.status} (Expected 401)`);
    if (badLoginRes.status !== 401) {
      throw new Error(`Invalid login should return 401: ${JSON.stringify(badLoginData)}`);
    }
    console.log('  ✅ Invalid password correctly rejected.\n');

    // Test 4: Valid Login
    console.log('Test 4: Valid Login');
    const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
      }),
    });
    const loginData = await loginRes.json();
    console.log(`  Status: ${loginRes.status}`);
    console.log(`  User: ${loginData.data?.user?.email}`);
    if (loginRes.status !== 200 || !loginData.data?.tokens?.accessToken) {
      throw new Error(`Login failed: ${JSON.stringify(loginData)}`);
    }
    accessToken = loginData.data.tokens.accessToken;
    refreshToken = loginData.data.tokens.refreshToken;
    console.log('  ✅ Logged in successfully.\n');

    // Test 5: Protected Route Without Token
    console.log('Test 5: Access Protected Route Without Token');
    const noTokenRes = await fetch(`${baseUrl}/api/users/me`);
    console.log(`  Status: ${noTokenRes.status} (Expected 401)`);
    if (noTokenRes.status !== 401) {
      throw new Error(`Protected route without token should return 401: ${noTokenRes.status}`);
    }
    console.log('  ✅ Protected route correctly blocked unauthenticated request.\n');

    // Test 6: Protected Route With Token (/api/users/me)
    console.log('Test 6: Access Protected Route With Token');
    const meRes = await fetch(`${baseUrl}/api/users/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const meData = await meRes.json();
    console.log(`  Status: ${meRes.status}`);
    console.log(`  Profile: Name="${meData.data?.user?.name}", Email="${meData.data?.user?.email}"`);
    if (meRes.status !== 200 || meData.data?.user?.email !== testEmail) {
      throw new Error(`Protected route failed: ${JSON.stringify(meData)}`);
    }
    console.log('  ✅ Protected route returned current user profile.\n');

    // Test 7: Refresh Token
    console.log('Test 7: Refresh Access Token');
    const refreshRes = await fetch(`${baseUrl}/api/auth/refresh-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    const refreshData = await refreshRes.json();
    console.log(`  Status: ${refreshRes.status}`);
    console.log(`  New Token received: ${Boolean(refreshData.data?.tokens?.accessToken)}`);
    if (refreshRes.status !== 200 || !refreshData.data?.tokens?.accessToken) {
      throw new Error(`Token refresh failed: ${JSON.stringify(refreshData)}`);
    }
    accessToken = refreshData.data.tokens.accessToken;
    console.log('  ✅ Access token successfully refreshed.\n');

    // Test 8: Update Profile Name
    console.log('Test 8: Update Profile Name');
    const updateRes = await fetch(`${baseUrl}/api/users/me`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ name: 'Updated Test Coder' }),
    });
    const updateData = await updateRes.json();
    console.log(`  Status: ${updateRes.status}`);
    console.log(`  Updated Name: "${updateData.data?.user?.name}"`);
    if (updateRes.status !== 200 || updateData.data?.user?.name !== 'Updated Test Coder') {
      throw new Error(`Update profile failed: ${JSON.stringify(updateData)}`);
    }
    console.log('  ✅ Profile successfully updated.\n');

    // Test 9: Logout
    console.log('Test 9: Logout Endpoint');
    const logoutRes = await fetch(`${baseUrl}/api/auth/logout`, { method: 'POST' });
    const logoutData = await logoutRes.json();
    console.log(`  Status: ${logoutRes.status}`);
    if (logoutRes.status !== 200) {
      throw new Error(`Logout failed: ${JSON.stringify(logoutData)}`);
    }
    console.log('  ✅ Logout endpoint succeeded.\n');

    console.log('🎉 ALL AUTHENTICATION TESTS PASSED SUCCESSFULLY! 🎉\n');
  } finally {
    // Cleanup
    await User.deleteMany({ email: { $regex: /^testuser_/ } });
    server.close();
    process.exit(0);
  }
}

runAuthTests().catch((err) => {
  console.error('❌ Test failed with error:', err);
  process.exit(1);
});
