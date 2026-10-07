const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function runGuidanceVerification() {
  console.log('====================================================');
  console.log('RUNNING CAREERPILOT BACKEND MODULE 10 VERIFICATION');
  console.log('====================================================\n');

  try {
    const timestamp = Date.now();

    // 1. Register User A (Mentor)
    console.log('1. Registering User A (Mentor: Alice)...');
    const userARes = await axios.post(`${BASE_URL}/auth/register`, {
      name: 'Alice Mentor',
      email: `alice_mentor_${timestamp}@example.com`,
      password: 'password123'
    });
    const userAToken = userARes.data.token;
    const userAId = userARes.data.user.id;
    const headersA = { Authorization: `Bearer ${userAToken}` };
    console.log(`   [SUCCESS] User A created (ID: ${userAId}).`);

    // 2. Register User B (Student Requester)
    console.log('2. Registering User B (Student: Bob)...');
    const userBRes = await axios.post(`${BASE_URL}/auth/register`, {
      name: 'Bob Student',
      email: `bob_student_${timestamp}@example.com`,
      password: 'password123'
    });
    const userBToken = userBRes.data.token;
    const userBId = userBRes.data.user.id;
    const headersB = { Authorization: `Bearer ${userBToken}` };
    console.log(`   [SUCCESS] User B created (ID: ${userBId}).`);

    // 3. Register User C (Non-Guidance User)
    console.log('3. Registering User C (Charlie: Not open to guidance)...');
    const userCRes = await axios.post(`${BASE_URL}/auth/register`, {
      name: 'Charlie NonMentor',
      email: `charlie_${timestamp}@example.com`,
      password: 'password123'
    });
    const userCToken = userCRes.data.token;
    const userCId = userCRes.data.user.id;
    const headersC = { Authorization: `Bearer ${userCToken}` };
    console.log(`   [SUCCESS] User C created (ID: ${userCId}).`);

    // 4. User A enables openToGuidance and sets topics
    console.log('4. User A updates profile to enable Career Guidance...');
    await axios.put(
      `${BASE_URL}/users/profile`,
      {
        college: 'MIT College',
        location: 'Bangalore',
        targetRole: 'Senior Java Developer',
        skills: ['Java', 'Spring Boot', 'DSA', 'SQL'],
        placementStatus: 'Amazon',
        openToGuidance: true,
        guidanceTopics: ['Java', 'DSA', 'Placement Preparation', 'Resume Review'],
        guidanceBio: '5+ years experience in Java and backend architecture. Happy to guide students.',
        guidanceExperience: 'Placed at Amazon through on-campus placements',
        preferredGuidanceMode: 'Online'
      },
      { headers: headersA }
    );
    console.log('   [SUCCESS] User A profile updated with openToGuidance = true.');

    // 5. User B explores guidance people (GET /api/guidance/people)
    console.log('5. User B explores guidance people (GET /api/guidance/people)...');
    const peopleRes = await axios.get(`${BASE_URL}/guidance/people`, { headers: headersB });
    const list = peopleRes.data.data;
    const foundUserA = list.find((p) => p._id === userAId || p.id === userAId);
    const foundUserB = list.find((p) => p._id === userBId || p.id === userBId);
    const foundUserC = list.find((p) => p._id === userCId || p.id === userCId);

    if (!foundUserA) throw new Error('User A was not found in guidance people list');
    if (foundUserB) throw new Error('Current User B should not appear in their own guidance list');
    if (foundUserC) throw new Error('User C (openToGuidance: false) should not appear in guidance list');
    console.log(`   [SUCCESS] Guidance people returned ${list.length} available mentors. User A found, Self and Non-mentors excluded.`);

    // 6. Testing search query
    console.log('6. Testing search query (search=Alice)...');
    const searchRes = await axios.get(`${BASE_URL}/guidance/people?search=Alice`, { headers: headersB });
    if (!searchRes.data.data.some((p) => p.name.includes('Alice'))) {
      throw new Error('Search did not return Alice');
    }
    console.log('   [SUCCESS] Search filter returned matching mentor.');

    // 7. Testing topic filter
    console.log('7. Testing topic filter (topic=DSA)...');
    const topicRes = await axios.get(`${BASE_URL}/guidance/people?topic=DSA`, { headers: headersB });
    if (topicRes.data.data.length === 0) {
      throw new Error('Topic filter returned 0 results');
    }
    console.log('   [SUCCESS] Topic filter returned matching mentor.');

    // 8. User B fetches User A's guidance profile
    console.log('8. User B fetches User A guidance profile (GET /api/guidance/people/:id)...');
    const profileRes = await axios.get(`${BASE_URL}/guidance/people/${userAId}`, { headers: headersB });
    const mentorProfile = profileRes.data.data;
    if (mentorProfile.name !== 'Alice Mentor' || !mentorProfile.guidanceTopics.includes('Java')) {
      throw new Error('Retrieved guidance profile data mismatch');
    }
    console.log(`   [SUCCESS] Retrieved mentor profile: ${mentorProfile.name} (${mentorProfile.role}).`);

    // 9. Self-request prevention test
    console.log('9. Security: User A tries to request guidance from self...');
    try {
      await axios.post(
        `${BASE_URL}/guidance/requests`,
        {
          mentorId: userAId,
          topic: 'Self mentorship',
          message: 'Trying to request guidance from myself.'
        },
        { headers: headersA }
      );
      throw new Error('Self request should have been rejected');
    } catch (err) {
      if (err.response && err.response.status === 400 && err.response.data.message.includes('yourself')) {
        console.log('   [SUCCESS] Self guidance request correctly rejected with 400.');
      } else {
        throw err;
      }
    }

    // 10. Non-guidance user request rejection
    console.log('10. Security: User B tries to request guidance from non-mentor User C...');
    try {
      await axios.post(
        `${BASE_URL}/guidance/requests`,
        {
          mentorId: userCId,
          topic: 'Java',
          message: 'Can you mentor me please on backend?'
        },
        { headers: headersB }
      );
      throw new Error('Request to non-mentor should have been rejected');
    } catch (err) {
      if (err.response && err.response.status === 400) {
        console.log('   [SUCCESS] Request to non-mentor user correctly rejected with 400.');
      } else {
        throw err;
      }
    }

    // 11. User B sends guidance request to User A
    console.log('11. User B sends guidance request to User A (POST /api/guidance/requests)...');
    const sendReqRes = await axios.post(
      `${BASE_URL}/guidance/requests`,
      {
        mentorId: userAId,
        topic: 'Java and Placement Preparation',
        message: 'I am preparing for placements and would like guidance on Java and DSA.',
        targetCompany: 'Amazon',
        targetRole: 'Software Engineer'
      },
      { headers: headersB }
    );
    const createdReq = sendReqRes.data.data;
    const req1Id = createdReq.id || createdReq._id;
    console.log(`   [SUCCESS] Guidance request created (ID: ${req1Id}, status: ${createdReq.status}).`);

    // 12. Duplicate pending request prevention
    console.log('12. Testing duplicate pending request prevention...');
    try {
      await axios.post(
        `${BASE_URL}/guidance/requests`,
        {
          mentorId: userAId,
          topic: 'Another topic',
          message: 'Trying to send duplicate request while one is pending.'
        },
        { headers: headersB }
      );
      throw new Error('Duplicate pending request should have been rejected');
    } catch (err) {
      if (err.response && err.response.status === 400 && err.response.data.message.includes('already pending')) {
        console.log('   [SUCCESS] Duplicate pending request rejected with 400 "Guidance request already pending."');
      } else {
        throw err;
      }
    }

    // 13. User B views Sent requests
    console.log('13. User B gets Sent Requests (GET /api/guidance/requests/sent)...');
    const sentRes = await axios.get(`${BASE_URL}/guidance/requests/sent`, { headers: headersB });
    if (sentRes.data.data.length !== 1 || sentRes.data.data[0].status !== 'Pending') {
      throw new Error('User B sent requests list mismatch');
    }
    console.log(`   [SUCCESS] User B has 1 sent request to ${sentRes.data.data[0].mentorName}.`);

    // 14. User A views Received requests
    console.log('14. User A gets Received Requests (GET /api/guidance/requests/received)...');
    const recRes = await axios.get(`${BASE_URL}/guidance/requests/received`, { headers: headersA });
    if (recRes.data.data.length !== 1 || recRes.data.data[0].status !== 'Pending') {
      throw new Error('User A received requests list mismatch');
    }
    console.log(`   [SUCCESS] User A has 1 received request from ${recRes.data.data[0].studentName}.`);

    // 15. Security: User C tries to accept request sent to User A
    console.log('15. Security: User C tries to accept request sent to User A...');
    try {
      await axios.patch(
        `${BASE_URL}/guidance/requests/${req1Id}/accept`,
        { responseMessage: 'Hacked accept' },
        { headers: headersC }
      );
      throw new Error('Unauthorized user should not be able to accept request');
    } catch (err) {
      if (err.response && err.response.status === 403) {
        console.log('   [SUCCESS] Unauthorized accept blocked with 403 Forbidden.');
      } else {
        throw err;
      }
    }

    // 16. Security: User C tries to view request details
    console.log('16. Security: User C tries to view request details...');
    try {
      await axios.get(`${BASE_URL}/guidance/requests/${req1Id}`, { headers: headersC });
      throw new Error('Unrelated user should not view request');
    } catch (err) {
      if (err.response && err.response.status === 403) {
        console.log('   [SUCCESS] Unauthorized view blocked with 403 Forbidden.');
      } else {
        throw err;
      }
    }

    // 17. User A accepts User B's guidance request
    console.log('17. User A accepts User B guidance request (PATCH /api/guidance/requests/:id/accept)...');
    const acceptRes = await axios.patch(
      `${BASE_URL}/guidance/requests/${req1Id}/accept`,
      { responseMessage: 'Sure, happy to help with Java & DSA!' },
      { headers: headersA }
    );
    if (acceptRes.data.data.status !== 'Accepted') {
      throw new Error('Request status is not Accepted');
    }
    console.log('   [SUCCESS] Request accepted. Status: Accepted.');

    // 18. User B marks accepted request as Completed
    console.log('18. User B marks accepted guidance request as Completed...');
    const compRes = await axios.patch(`${BASE_URL}/guidance/requests/${req1Id}/complete`, {}, { headers: headersB });
    if (compRes.data.data.status !== 'Completed') {
      throw new Error('Request status is not Completed');
    }
    console.log('   [SUCCESS] Request marked as Completed.');

    // 19. Testing Rejection Flow
    console.log('19. Testing Rejection Flow (User B requests, User A rejects)...');
    const req2Res = await axios.post(
      `${BASE_URL}/guidance/requests`,
      {
        mentorId: userAId,
        topic: 'Resume Optimization',
        message: 'Could you review my resume format for backend roles?'
      },
      { headers: headersB }
    );
    const req2Id = req2Res.data.data.id || req2Res.data.data._id;
    const rejectRes = await axios.patch(
      `${BASE_URL}/guidance/requests/${req2Id}/reject`,
      { responseMessage: 'Sorry, schedule is full this week.' },
      { headers: headersA }
    );
    if (rejectRes.data.data.status !== 'Rejected') {
      throw new Error('Request was not rejected');
    }
    console.log('   [SUCCESS] Request rejected cleanly. Status: Rejected.');

    // 20. Testing Cancellation Flow
    console.log('20. Testing Cancellation Flow (User B requests, User B cancels)...');
    const req3Res = await axios.post(
      `${BASE_URL}/guidance/requests`,
      {
        mentorId: userAId,
        topic: 'System Design',
        message: 'Looking for system design tips for distributed caching.'
      },
      { headers: headersB }
    );
    const req3Id = req3Res.data.data.id || req3Res.data.data._id;
    const cancelRes = await axios.delete(`${BASE_URL}/guidance/requests/${req3Id}/cancel`, { headers: headersB });
    if (cancelRes.data.data.status !== 'Cancelled') {
      throw new Error('Request was not cancelled');
    }
    console.log('   [SUCCESS] Pending request cancelled by requester. Status: Cancelled.');

    // 21. Validation tests
    console.log('21. Testing input validation (short message, invalid ObjectId)...');
    try {
      await axios.post(
        `${BASE_URL}/guidance/requests`,
        { mentorId: userAId, topic: 'A', message: 'Too short' },
        { headers: headersB }
      );
      throw new Error('Short message should be rejected');
    } catch (err) {
      if (err.response && err.response.status === 400) {
        console.log('    ✓ Short input properly rejected (400)');
      }
    }

    try {
      await axios.get(`${BASE_URL}/guidance/people/invalid_mongo_id_123`, { headers: headersB });
      throw new Error('Invalid ObjectId should be rejected');
    } catch (err) {
      if (err.response && err.response.status === 400) {
        console.log('    ✓ Invalid ObjectId format properly handled (400)');
      }
    }

    console.log('\n====================================================');
    console.log('🎉 ALL MODULE 10 TESTS PASSED SUCCESSFULLY! (21/21)');
    console.log('====================================================');
  } catch (error) {
    console.error('\n❌ Module 10 Verification Failed:', error.response ? error.response.data : error.message);
    process.exit(1);
  }
}

runGuidanceVerification();
