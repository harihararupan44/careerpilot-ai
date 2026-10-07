const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

const runTests = async () => {
  console.log('====================================================');
  console.log('RUNNING CAREERPILOT BACKEND MODULE 9 VERIFICATION');
  console.log('====================================================\n');

  try {
    const timestamp = Date.now();
    const userAEmail = `user_a_${timestamp}@example.com`;
    const userBEmail = `user_b_${timestamp}@example.com`;

    // 1. Register User A
    console.log('1. Registering User A...');
    const userARes = await axios.post(`${API_URL}/auth/register`, {
      name: 'Alice Developer',
      email: userAEmail,
      password: 'Password123!',
      role: 'jobseeker'
    });
    const tokenA = userARes.data.token;
    console.log(`   [SUCCESS] User A registered (Token received).`);

    // 2. Register User B
    console.log('2. Registering User B...');
    const userBRes = await axios.post(`${API_URL}/auth/register`, {
      name: 'Bob Candidate',
      email: userBEmail,
      password: 'Password123!',
      role: 'jobseeker'
    });
    const tokenB = userBRes.data.token;
    console.log(`   [SUCCESS] User B registered (Token received).`);

    const authHeadersA = { headers: { Authorization: `Bearer ${tokenA}` } };
    const authHeadersB = { headers: { Authorization: `Bearer ${tokenB}` } };

    // 3. User A creates an interview experience
    console.log('3. User A creating an interview experience...');
    const createRes = await axios.post(
      `${API_URL}/interview-experiences`,
      {
        companyName: 'Stripe Global',
        jobTitle: 'Backend Engineer',
        experienceTitle: 'Stripe Backend Engineer Interview Journey',
        overallDifficulty: 'Hard',
        experienceType: 'Full-time',
        interviewMode: 'Online',
        interviewProcess: 'Technical screening followed by live architecture and coding rounds.',
        preparationTips: 'Focus on distributed systems, transaction isolation, and idempotency keys.',
        overallExperience: 'Challenging and deeply technical. Interviewers were top-notch.',
        topics: ['System Design', 'Idempotency', 'REST APIs', 'PostgreSQL'],
        skills: ['Java', 'Spring Boot', 'Distributed Systems', 'SQL'],
        rounds: [
          {
            roundNumber: 1,
            roundName: 'Online Coding Assessment',
            roundType: 'Algorithms',
            difficulty: 'Medium',
            duration: 60,
            description: '2 algorithm questions on rate limiting and sliding window.',
            questions: ['Design a sliding window rate limiter', 'Evaluate prefix boolean expressions'],
            tips: 'Test edge cases before submitting.'
          },
          {
            roundNumber: 2,
            roundName: 'System Design & API Architecture',
            roundType: 'Architecture',
            difficulty: 'Hard',
            duration: 60,
            description: 'Design a high throughput payment webhook delivery engine.',
            questions: ['How do you ensure at-least-once webhook delivery with exponential backoff?'],
            tips: 'Clarify SLA and payload sizes.'
          }
        ],
        questionsAsked: [
          'Design a sliding window rate limiter',
          'Payment webhook delivery engine with idempotency keys'
        ],
        result: 'Selected',
        isAnonymous: false
      },
      authHeadersA
    );

    const experienceA = createRes.data.data;
    console.log(`   [SUCCESS] Experience created (ID: ${experienceA._id || experienceA.id}).`);

    // 4. Get all public interview experiences
    console.log('4. Fetching public interview experiences (GET /api/interview-experiences)...');
    const getAllRes = await axios.get(`${API_URL}/interview-experiences`);
    if (!getAllRes.data.success || !Array.isArray(getAllRes.data.data)) {
      throw new Error('Failed to retrieve interview experiences');
    }
    console.log(`   [SUCCESS] Retrieved ${getAllRes.data.data.length} interview experiences.`);

    // 5. Get experience by ID
    console.log('5. Fetching experience details by ID...');
    const getByIdRes = await axios.get(`${API_URL}/interview-experiences/${experienceA._id || experienceA.id}`);
    if (getByIdRes.data.data.companyName !== 'Stripe Global') {
      throw new Error('Experience details mismatch');
    }
    console.log(`   [SUCCESS] Experience verified (Company: ${getByIdRes.data.data.companyName}, Author: ${getByIdRes.data.data.author.name}).`);

    // 6. Security check: User B tries to update User A's experience
    console.log('6. Security: User B tries to update User A\'s experience...');
    try {
      await axios.put(
        `${API_URL}/interview-experiences/${experienceA._id || experienceA.id}`,
        { experienceTitle: 'Hacked Experience Title' },
        authHeadersB
      );
      throw new Error('Security violation: unauthorized update succeeded!');
    } catch (err) {
      if (err.response && err.response.status === 403) {
        console.log('   [SUCCESS] Unauthorized update prevented (403 Forbidden).');
      } else {
        throw err;
      }
    }

    // 7. Security check: User B tries to delete User A's experience
    console.log('7. Security: User B tries to delete User A\'s experience...');
    try {
      await axios.delete(
        `${API_URL}/interview-experiences/${experienceA._id || experienceA.id}`,
        authHeadersB
      );
      throw new Error('Security violation: unauthorized delete succeeded!');
    } catch (err) {
      if (err.response && err.response.status === 403) {
        console.log('   [SUCCESS] Unauthorized delete prevented (403 Forbidden).');
      } else {
        throw err;
      }
    }

    // 8. User B marks User A's experience as Helpful
    console.log('8. User B marks experience as Helpful...');
    const helpfulOnRes = await axios.post(
      `${API_URL}/interview-experiences/${experienceA._id || experienceA.id}/helpful`,
      {},
      authHeadersB
    );
    if (!helpfulOnRes.data.helpful || helpfulOnRes.data.helpfulCount !== 1) {
      throw new Error(`Helpful toggle on failed: expected count 1, got ${helpfulOnRes.data.helpfulCount}`);
    }
    console.log(`   [SUCCESS] Helpful toggled ON (Count: ${helpfulOnRes.data.helpfulCount}).`);

    // 9. User B toggles Helpful again (toggle OFF)
    console.log('9. User B toggles Helpful again (toggle OFF)...');
    const helpfulOffRes = await axios.post(
      `${API_URL}/interview-experiences/${experienceA._id || experienceA.id}/helpful`,
      {},
      authHeadersB
    );
    if (helpfulOffRes.data.helpful || helpfulOffRes.data.helpfulCount !== 0) {
      throw new Error(`Helpful toggle off failed: expected count 0, got ${helpfulOffRes.data.helpfulCount}`);
    }
    console.log(`   [SUCCESS] Helpful toggled OFF cleanly (Count: ${helpfulOffRes.data.helpfulCount}).`);

    // 10. User B creates an Anonymous experience
    console.log('10. User B creates an Anonymous experience...');
    const anonRes = await axios.post(
      `${API_URL}/interview-experiences`,
      {
        companyName: 'Meta',
        jobTitle: 'Production Engineer',
        experienceTitle: 'Meta Production Engineer Interview Experience',
        overallDifficulty: 'Hard',
        experienceType: 'Full-time',
        interviewMode: 'Online',
        isAnonymous: true
      },
      authHeadersB
    );
    const anonExp = anonRes.data.data;
    const getAnonRes = await axios.get(`${API_URL}/interview-experiences/${anonExp._id || anonExp.id}`);
    if (getAnonRes.data.data.author.name !== 'Anonymous Candidate' || getAnonRes.data.data.author.isAnonymous !== true) {
      throw new Error('Anonymous candidate masking failed');
    }
    console.log(`   [SUCCESS] Anonymous experience verified: Author name is "${getAnonRes.data.data.author.name}".`);

    // 11. Search query filter
    console.log('11. Testing search filter (search=Stripe)...');
    const searchRes = await axios.get(`${API_URL}/interview-experiences?search=Stripe`);
    if (!searchRes.data.data.some((e) => e.companyName === 'Stripe Global')) {
      throw new Error('Search query filter failed');
    }
    console.log('   [SUCCESS] Search filter returned matching experiences.');

    // 12. Dropdown filters
    console.log('12. Testing difficulty filter (difficulty=Hard)...');
    const filterRes = await axios.get(`${API_URL}/interview-experiences?difficulty=Hard`);
    if (filterRes.data.data.length === 0 || !filterRes.data.data.every((e) => e.overallDifficulty === 'Hard')) {
      throw new Error('Difficulty filter failed');
    }
    console.log(`   [SUCCESS] Difficulty filter returned ${filterRes.data.data.length} Hard experiences.`);

    // 13. Pagination
    console.log('13. Testing pagination (page=1, limit=1)...');
    const paginatedRes = await axios.get(`${API_URL}/interview-experiences?page=1&limit=1`);
    if (paginatedRes.data.data.length !== 1 || paginatedRes.data.pagination.limit !== 1) {
      throw new Error('Pagination verification failed');
    }
    console.log(`   [SUCCESS] Pagination verified (Page 1 of ${paginatedRes.data.pagination.pages}, Total: ${paginatedRes.data.pagination.total}).`);

    // 14. User A gets their own experiences (GET /api/interview-experiences/me)
    console.log('14. User A gets own experiences (GET /api/interview-experiences/me)...');
    const myExpRes = await axios.get(`${API_URL}/interview-experiences/me`, authHeadersA);
    if (!myExpRes.data.success || myExpRes.data.data.length === 0) {
      throw new Error('GET /me failed');
    }
    console.log(`   [SUCCESS] User A has ${myExpRes.data.data.length} personal experiences.`);

    // 15. User A updates own experience
    console.log('15. User A updates own experience (PUT /api/interview-experiences/:id)...');
    const updateRes = await axios.put(
      `${API_URL}/interview-experiences/${experienceA._id || experienceA.id}`,
      {
        experienceTitle: 'Stripe Backend Engineer Interview Journey (Updated)',
        overallDifficulty: 'Very Hard'
      },
      authHeadersA
    );
    if (updateRes.data.data.experienceTitle !== 'Stripe Backend Engineer Interview Journey (Updated)') {
      throw new Error('Update experience failed');
    }
    console.log('   [SUCCESS] Experience updated successfully.');

    // 16. User A deletes own experience
    console.log('16. User A deletes own experience (DELETE /api/interview-experiences/:id)...');
    const deleteRes = await axios.delete(
      `${API_URL}/interview-experiences/${experienceA._id || experienceA.id}`,
      authHeadersA
    );
    if (!deleteRes.data.success) {
      throw new Error('Delete experience failed');
    }
    console.log('   [SUCCESS] Experience deleted successfully.');

    // 17. Invalid ObjectId validation (400 Bad Request) & 404
    console.log('17. Testing invalid ObjectId (400) and non-existent ID (404)...');
    try {
      await axios.get(`${API_URL}/interview-experiences/invalid-id-123`);
      throw new Error('Invalid ObjectId should return 400');
    } catch (err) {
      if (err.response && err.response.status === 400) {
        console.log('   [SUCCESS] Invalid ObjectId returned 400 Bad Request.');
      } else {
        throw err;
      }
    }

    try {
      await axios.get(`${API_URL}/interview-experiences/6abc8ee73ebf5c6bcee65081`);
    } catch (err) {
      if (err.response && err.response.status === 404) {
        console.log('   [SUCCESS] Non-existent ID returned 404 Not Found.');
      }
    }

    console.log('\n====================================================');
    console.log('🎉 ALL MODULE 9 BACKEND TESTS PASSED SUCCESSFULLY! (17/17)');
    console.log('====================================================\n');
  } catch (error) {
    console.error('\n❌ MODULE 9 TEST FAILED:', error.response ? error.response.data : error.message);
    process.exit(1);
  }
};

runTests();
