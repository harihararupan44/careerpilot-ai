const axios = require('axios');
const mongoose = require('mongoose');

const BASE_URL = 'http://localhost:5000/api';

async function runRealUserGuidanceTest() {
  console.log('====================================================');
  console.log('TESTING REAL USER CAREER GUIDANCE PROVIDER FLOW');
  console.log('====================================================\n');

  const timestamp = Date.now();
  const userAEmail = `user_a_mentor_${timestamp}@test.com`;
  const userBEmail = `user_b_student_${timestamp}@test.com`;
  const password = 'Password123!';

  try {
    // 1. Register User A
    console.log('1. Registering User A (Normal registered user)...');
    const regResA = await axios.post(`${BASE_URL}/auth/register`, {
      name: 'User A Provider',
      email: userAEmail,
      password: password
    });
    const tokenA = regResA.data.token;
    const userAId = regResA.data.user.id || regResA.data.user._id;
    console.log(`   [SUCCESS] User A registered. ID: ${userAId}`);

    const clientA = axios.create({
      baseURL: BASE_URL,
      headers: { Authorization: `Bearer ${tokenA}` }
    });

    // TEST A: User A updates profile with Career Guidance = ON
    console.log('\n2. User A updates profile (PUT /api/users/profile)...');
    console.log('   Setting openToGuidance = true, topics = ["Java", "DSA", "Placement Preparation"], bio & experience...');
    const updateResA = await clientA.put('/users/profile', {
      name: 'User A Provider',
      college: 'National Institute of Technology',
      degree: 'B.Tech',
      branch: 'Computer Science',
      graduationYear: 2024,
      location: 'Bangalore, India',
      targetRole: 'Software Engineer',
      placementStatus: 'Google',
      skills: ['Java', 'DSA', 'Spring Boot', 'System Design'],
      openToGuidance: true,
      guidanceTopics: ['Java', 'DSA', 'Placement Preparation'],
      guidanceBio: 'I can help students prepare for Java and DSA problem patterns.',
      guidanceExperience: 'Software Engineer placement preparation, mentored 15+ juniors',
      preferredGuidanceMode: 'Online'
    });

    if (!updateResA.data.success || !updateResA.data.profile.openToGuidance) {
      throw new Error('TEST A FAILED: Profile did not save openToGuidance as true');
    }
    console.log('   [SUCCESS] TEST A PASSED: User A profile saved with openToGuidance = true.');

    // TEST B: Verify Profile contains openToGuidance: true, guidanceTopics, guidanceBio, guidanceExperience
    console.log('\n3. TEST B: Fetching User A Profile (GET /api/users/profile)...');
    const getProfA = await clientA.get('/users/profile');
    const profA = getProfA.data.profile;

    if (
      profA.openToGuidance !== true ||
      !profA.guidanceTopics.includes('Java') ||
      !profA.guidanceTopics.includes('DSA') ||
      profA.guidanceBio !== 'I can help students prepare for Java and DSA problem patterns.' ||
      profA.guidanceExperience !== 'Software Engineer placement preparation, mentored 15+ juniors' ||
      profA.preferredGuidanceMode !== 'Online'
    ) {
      throw new Error(`TEST B FAILED: Profile fields mismatch: ${JSON.stringify(profA)}`);
    }
    console.log('   [SUCCESS] TEST B PASSED: MongoDB Profile document contains all guidance fields.');

    // TEST C: Open /api/guidance/people as User A -> User A should NOT appear
    console.log('\n4. TEST C: User A queries /api/guidance/people...');
    const guidanceForA = await clientA.get('/guidance/people');
    const peopleForA = guidanceForA.data.data;
    const isUserAInList = peopleForA.some((p) => p.userId === userAId || p._id === userAId || p.id === userAId);

    if (isUserAInList) {
      throw new Error('TEST C FAILED: User A appeared in their own guidance list!');
    }
    console.log(`   [SUCCESS] TEST C PASSED: User A is correctly excluded from their own guidance list (${peopleForA.length} other providers returned).`);

    // TEST D: Register/Login User B & Open /api/guidance/people -> User A SHOULD appear
    console.log('\n5. TEST D: Registering User B (Student)...');
    const regResB = await axios.post(`${BASE_URL}/auth/register`, {
      name: 'User B Student',
      email: userBEmail,
      password: password
    });
    const tokenB = regResB.data.token;
    const userBId = regResB.data.user.id || regResB.data.user._id;
    console.log(`   [SUCCESS] User B registered. ID: ${userBId}`);

    const clientB = axios.create({
      baseURL: BASE_URL,
      headers: { Authorization: `Bearer ${tokenB}` }
    });

    console.log('   User B queries /api/guidance/people...');
    const guidanceForB = await clientB.get('/guidance/people');
    const peopleForB = guidanceForB.data.data;
    const foundUserA = peopleForB.find((p) => p.userId === userAId || p._id === userAId || p.id === userAId);

    if (!foundUserA) {
      throw new Error('TEST D FAILED: User A was not found in User B guidance list!');
    }
    console.log(`   [SUCCESS] TEST D PASSED: User A is visible to User B as a real guidance provider.`);
    console.log(`   Provider Details: Name="${foundUserA.name}", Company="${foundUserA.company}", Topics=[${foundUserA.guidanceTopics.join(', ')}]`);

    // TEST E: User B opens User A guidance profile and sends request
    console.log('\n6. TEST E: User B sends guidance request to User A (POST /api/guidance/requests)...');
    const reqPayload = {
      mentorId: userAId,
      topic: 'Java and DSA',
      message: 'I would like guidance for placement preparation.',
      targetCompany: 'Google',
      targetRole: 'Software Engineer'
    };
    const reqRes = await clientB.post('/guidance/requests', reqPayload);
    if (!reqRes.data.success || reqRes.data.data.status !== 'Pending') {
      throw new Error('TEST E FAILED: Could not create guidance request');
    }
    const requestId = reqRes.data.data._id || reqRes.data.data.id;
    console.log(`   [SUCCESS] Guidance request created successfully. Request ID: ${requestId}`);

    // Verify User B's sent requests
    console.log('   Verifying in User B sent requests (GET /api/guidance/requests/sent)...');
    const sentListRes = await clientB.get('/guidance/requests/sent');
    const sentMatch = sentListRes.data.data.find((r) => r.id === requestId.toString() || r._id === requestId.toString());
    if (!sentMatch) {
      throw new Error('TEST E FAILED: Request not found in User B sent list');
    }
    console.log(`   [SUCCESS] Request appears in User B sent list with status: ${sentMatch.status}`);

    // Verify User A's received requests
    console.log('   Verifying in User A received requests (GET /api/guidance/requests/received)...');
    const recListRes = await clientA.get('/guidance/requests/received');
    const recMatch = recListRes.data.data.find((r) => r.id === requestId.toString() || r._id === requestId.toString());
    if (!recMatch) {
      throw new Error('TEST E FAILED: Request not found in User A received list');
    }
    console.log(`   [SUCCESS] TEST E PASSED: Request appears in User A received list from "${recMatch.studentName}" for topic "${recMatch.topic}".`);

    console.log('\n====================================================');
    console.log('🎉 ALL REAL-USER CAREER GUIDANCE TESTS PASSED (5/5)');
    console.log('====================================================\n');
  } catch (err) {
    console.error('\n❌ ERROR RUNNING TEST:', err.response?.data || err.message);
    process.exit(1);
  }
}

runRealUserGuidanceTest();
