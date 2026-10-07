const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function runAuthVerification() {
  console.log('====================================================');
  console.log('CAREERPILOT AI — AUTHENTICATION & MODULE 9 TEST SUITE');
  console.log('====================================================\n');

  try {
    // 1. Fresh Login
    console.log('1. Testing Login (POST /api/auth/login)...');
    const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'alex.rivera@university.edu',
      password: 'demo123'
    });
    const { token, user } = loginRes.data;
    if (!token || !token.startsWith('eyJ')) {
      throw new Error('Login did not return a valid JWT format');
    }
    console.log(`   [SUCCESS] Logged in as ${user.name} (${user.email}). Valid JWT received.\n`);

    const authHeaders = { Authorization: `Bearer ${token}` };

    // 2. Auth /me verification
    console.log('2. Testing Get Current User (GET /api/auth/me)...');
    const meRes = await axios.get(`${BASE_URL}/auth/me`, { headers: authHeaders });
    if (meRes.data.user.email !== 'alex.rivera@university.edu') {
      throw new Error('Get /me returned unexpected user');
    }
    console.log(`   [SUCCESS] User profile retrieved: ${meRes.data.user.name}\n`);

    // 3. Module 9: Public Interview Experiences list
    console.log('3. Testing Public Experiences (GET /api/interview-experiences)...');
    const publicExpRes = await axios.get(`${BASE_URL}/interview-experiences`, { headers: authHeaders });
    console.log(`   [SUCCESS] Public experiences loaded (${publicExpRes.data.data.length} found).\n`);

    // 4. Module 9: Create Interview Experience
    console.log('4. Testing Create Experience (POST /api/interview-experiences)...');
    const newExpPayload = {
      companyName: 'AuthTest Corp',
      jobTitle: 'Senior Fullstack Engineer',
      experienceTitle: 'AuthTest Corp Interview Journey',
      overallDifficulty: 'Hard',
      experienceType: 'Direct',
      interviewMode: 'Online',
      interviewProcess: '3 technical rounds + HR discussion',
      preparationTips: 'Focus on LeetCode patterns and auth flows',
      overallExperience: 'Positive',
      topics: ['Authentication', 'JWT', 'React', 'Node.js'],
      skills: ['JWT', 'React', 'MongoDB'],
      rounds: [
        {
          roundNumber: 1,
          roundName: 'Technical Screen',
          durationMinutes: 45,
          roundType: 'Technical',
          description: 'DSA & security coding questions'
        }
      ],
      questionsAsked: [
        {
          questionText: 'How do you structure JWT authentication securely?',
          topic: 'Security',
          difficulty: 'Medium'
        }
      ],
      result: 'Offered',
      isAnonymous: false
    };
    const createExpRes = await axios.post(`${BASE_URL}/interview-experiences`, newExpPayload, { headers: authHeaders });
    const createdExpId = createExpRes.data.data.id || createExpRes.data.data._id;
    console.log(`   [SUCCESS] Experience created (ID: ${createdExpId}).\n`);

    // 5. Module 9: Get Experience Details
    console.log('5. Testing Get Experience by ID (GET /api/interview-experiences/:id)...');
    const expDetailRes = await axios.get(`${BASE_URL}/interview-experiences/${createdExpId}`, { headers: authHeaders });
    console.log(`   [SUCCESS] Experience details retrieved for company: ${expDetailRes.data.data.companyName}\n`);

    // 6. Module 9: Toggle Helpful
    console.log('6. Testing Toggle Helpful (POST /api/interview-experiences/:id/helpful)...');
    const helpfulRes = await axios.post(`${BASE_URL}/interview-experiences/${createdExpId}/helpful`, {}, { headers: authHeaders });
    console.log(`   [SUCCESS] Helpful toggled: ${helpfulRes.data.helpful}, Count: ${helpfulRes.data.helpfulCount}\n`);

    // 7. Module 9: Get User Personal Experiences
    console.log('7. Testing Get My Experiences (GET /api/interview-experiences/me)...');
    const myExpRes = await axios.get(`${BASE_URL}/interview-experiences/me`, { headers: authHeaders });
    console.log(`   [SUCCESS] User has ${myExpRes.data.data.length} personal experiences.\n`);

    // 8. Module 9: Update Experience
    console.log('8. Testing Update Experience (PUT /api/interview-experiences/:id)...');
    const updateRes = await axios.put(`${BASE_URL}/interview-experiences/${createdExpId}`, {
      overallDifficulty: 'Medium'
    }, { headers: authHeaders });
    console.log(`   [SUCCESS] Experience updated difficulty to: ${updateRes.data.data.overallDifficulty}\n`);

    // 9. Module 9: Delete Experience
    console.log('9. Testing Delete Experience (DELETE /api/interview-experiences/:id)...');
    const deleteRes = await axios.delete(`${BASE_URL}/interview-experiences/${createdExpId}`, { headers: authHeaders });
    console.log(`   [SUCCESS] Experience deleted: ${deleteRes.data.message}\n`);

    // 10. Regression Check across all modules
    console.log('10. Regression Testing Modules 1-8...');

    // Profile
    const profileRes = await axios.get(`${BASE_URL}/users/profile`, { headers: authHeaders });
    console.log('    ✓ Profile API (GET /users/profile): OK');

    // Resumes
    const resumesRes = await axios.get(`${BASE_URL}/resumes`, { headers: authHeaders });
    console.log('    ✓ Resumes API (GET /resumes): OK');

    // Jobs
    const jobsRes = await axios.get(`${BASE_URL}/jobs`, { headers: authHeaders });
    console.log('    ✓ Jobs API (GET /jobs): OK');

    // Saved Jobs
    const savedJobsRes = await axios.get(`${BASE_URL}/jobs/saved`, { headers: authHeaders });
    console.log('    ✓ Saved Jobs API (GET /jobs/saved): OK');

    // Applications & Stats (The simultaneous calls)
    const [appsRes, statsRes] = await Promise.all([
      axios.get(`${BASE_URL}/applications`, { headers: authHeaders }),
      axios.get(`${BASE_URL}/applications/stats`, { headers: authHeaders })
    ]);
    console.log('    ✓ Applications & Stats (GET /applications + stats): OK');

    // Interviews
    const interviewsRes = await axios.get(`${BASE_URL}/interviews`, { headers: authHeaders });
    console.log('    ✓ Interviews API (GET /interviews): OK');

    // Mock Interviews
    const mockRes = await axios.get(`${BASE_URL}/mock-interviews`, { headers: authHeaders });
    console.log('    ✓ Mock Interviews API (GET /mock-interviews): OK');

    // Community / People
    const peopleRes = await axios.get(`${BASE_URL}/people`, { headers: authHeaders });
    console.log('    ✓ People API (GET /people): OK\n');

    // 11. Security Check: Invalid token rejection
    console.log('11. Security Check: Testing invalid token rejection...');
    try {
      await axios.get(`${BASE_URL}/applications`, {
        headers: { Authorization: 'Bearer invalid_demo_token_12345' }
      });
      throw new Error('Server unexpectedly accepted invalid token');
    } catch (err) {
      if (err.response && err.response.status === 401 && err.response.data.message === 'Not authorized, invalid token') {
        console.log('   [SUCCESS] Invalid token properly rejected with 401 "Not authorized, invalid token".\n');
      } else {
        throw err;
      }
    }

    console.log('====================================================');
    console.log('🎉 ALL AUTHENTICATION & MODULE 9 TESTS PASSED! (11/11)');
    console.log('====================================================');
  } catch (error) {
    console.error('❌ Verification Error:', error.response ? error.response.data : error.message);
    process.exit(1);
  }
}

runAuthVerification();
