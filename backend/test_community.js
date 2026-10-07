const http = require('http');

function request(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, headers: res.headers, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, body });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(typeof data === 'string' ? data : JSON.stringify(data));
    }
    req.end();
  });
}

async function runTests() {
  console.log('====================================================');
  console.log('RUNNING CAREERPILOT BACKEND MODULE 8 VERIFICATION');
  console.log('====================================================\n');

  const timestamp = Date.now();
  const userAEmail = `comm_alice_${timestamp}@careerpilot.test`;
  const userBEmail = `comm_bob_${timestamp}@careerpilot.test`;
  const userCEmail = `comm_charlie_private_${timestamp}@careerpilot.test`;
  const password = 'Password@123';

  let tokenA = '', userAId = '';
  let tokenB = '', userBId = '';
  let tokenC = '', userCId = '';
  let connectionABId = '';

  try {
    // 1. Register User A
    console.log('1. Registering User A (Alice)...');
    const regA = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/auth/register',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      },
      { name: 'Alice Walker', email: userAEmail, password }
    );
    if (regA.status !== 201) throw new Error(`Register A failed: ${JSON.stringify(regA.body)}`);
    tokenA = regA.body.token;
    userAId = regA.body.user.id || regA.body.user._id;

    // Setup Profile for User A
    await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/users/profile',
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokenA}`
        }
      },
      {
        targetRole: 'Full Stack Engineer',
        college: 'Sri Shakthi Institute of Engineering',
        skills: ['React', 'Node.js', 'MongoDB', 'Express'],
        location: 'Coimbatore, India',
        careerStatus: 'Looking for Internship',
        profileVisibility: 'Public'
      }
    );
    console.log(`   [SUCCESS] User A created (ID: ${userAId}).`);

    // 2. Register User B
    console.log('2. Registering User B (Bob)...');
    const regB = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/auth/register',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      },
      { name: 'Bob Developer', email: userBEmail, password }
    );
    if (regB.status !== 201) throw new Error(`Register B failed: ${JSON.stringify(regB.body)}`);
    tokenB = regB.body.token;
    userBId = regB.body.user.id || regB.body.user._id;

    // Setup Profile for User B
    await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/users/profile',
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokenB}`
        }
      },
      {
        targetRole: 'Backend Engineer',
        college: 'PSG College of Technology',
        skills: ['Java', 'Spring Boot', 'Kafka', 'PostgreSQL'],
        location: 'Chennai, India',
        careerStatus: 'Working',
        placementStatus: 'Amazon',
        achievementSummary: 'SDE Intern at Amazon',
        profileVisibility: 'Public'
      }
    );
    console.log(`   [SUCCESS] User B created (ID: ${userBId}).`);

    // 3. Register User C (Private Profile)
    console.log('3. Registering User C (Charlie - Private Profile)...');
    const regC = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/auth/register',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      },
      { name: 'Charlie Private', email: userCEmail, password }
    );
    if (regC.status !== 201) throw new Error(`Register C failed: ${JSON.stringify(regC.body)}`);
    tokenC = regC.body.token;
    userCId = regC.body.user.id || regC.body.user._id;

    // Setup Profile for User C as Private
    await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/users/profile',
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokenC}`
        }
      },
      {
        targetRole: 'Data Scientist',
        profileVisibility: 'Private'
      }
    );
    console.log(`   [SUCCESS] User C created as Private (ID: ${userCId}).`);

    // 4. Explore People - User A explores community
    console.log('4. User A explores community (GET /api/people)...');
    const peopleRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/people',
      method: 'GET',
      headers: { Authorization: `Bearer ${tokenA}` }
    });

    if (peopleRes.status !== 200 || !Array.isArray(peopleRes.body.people)) {
      throw new Error(`Failed to get people: ${JSON.stringify(peopleRes.body)}`);
    }

    const peopleList = peopleRes.body.people;
    const hasSelf = peopleList.some((p) => p.id === userAId || p.userId === userAId);
    const hasBob = peopleList.some((p) => p.id === userBId || p.userId === userBId);
    const hasCharlie = peopleList.some((p) => p.id === userCId || p.userId === userCId);

    if (hasSelf) throw new Error('Self-isolation failed: User A appeared in their own Explore People results.');
    if (!hasBob) throw new Error('Public discovery failed: Public user Bob was not found in Explore People.');
    if (hasCharlie) throw new Error('Privacy failure: Private user Charlie appeared in Explore People.');

    console.log(`   [SUCCESS] Explore People returned ${peopleList.length} public profiles (User A excluded, Private User C excluded, Public User B found).`);

    // 5. Search & Filters on /api/people
    console.log('5. Testing search query (search=Bob)...');
    const searchRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/people?search=Bob',
      method: 'GET',
      headers: { Authorization: `Bearer ${tokenA}` }
    });
    if (searchRes.status !== 200 || !searchRes.body.people.some((p) => p.name === 'Bob Developer')) {
      throw new Error(`Search failed: ${JSON.stringify(searchRes.body)}`);
    }
    console.log('   [SUCCESS] Search filter returned Bob Developer.');

    console.log('6. Testing skill filter (skills=Spring Boot)...');
    const skillRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/people?skills=Spring%20Boot',
      method: 'GET',
      headers: { Authorization: `Bearer ${tokenA}` }
    });
    if (skillRes.status !== 200 || !skillRes.body.people.some((p) => p.skills.includes('Spring Boot'))) {
      throw new Error(`Skill filter failed: ${JSON.stringify(skillRes.body)}`);
    }
    console.log('   [SUCCESS] Skill filter returned matching profile.');

    // 7. View Public Profile (GET /api/people/:id)
    console.log('7. User A fetches Bob\'s public profile (GET /api/people/:id)...');
    const profileRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: `/api/people/${userBId}`,
      method: 'GET',
      headers: { Authorization: `Bearer ${tokenA}` }
    });

    if (profileRes.status !== 200 || !profileRes.body.person) {
      throw new Error(`Failed to fetch public profile: ${JSON.stringify(profileRes.body)}`);
    }
    const personData = profileRes.body.person;
    if (personData.password || personData.email || personData.phone) {
      throw new Error('Security flaw: Sensitive information exposed in public profile.');
    }
    console.log(`   [SUCCESS] Retrieved Bob's public profile: ${personData.name} (${personData.targetRole} @ ${personData.company}). Sensitive fields omitted.`);

    // 8. Connection Status check
    console.log('8. User A checks initial connection status with Bob...');
    const statusNoneRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: `/api/people/${userBId}/connection-status`,
      method: 'GET',
      headers: { Authorization: `Bearer ${tokenA}` }
    });
    if (statusNoneRes.status !== 200 || statusNoneRes.body.status !== 'none') {
      throw new Error(`Expected 'none', got ${JSON.stringify(statusNoneRes.body)}`);
    }
    console.log('   [SUCCESS] Status is "none".');

    console.log('9. User A checks connection status with self...');
    const statusSelfRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: `/api/people/${userAId}/connection-status`,
      method: 'GET',
      headers: { Authorization: `Bearer ${tokenA}` }
    });
    if (statusSelfRes.status !== 200 || statusSelfRes.body.status !== 'self') {
      throw new Error(`Expected 'self', got ${JSON.stringify(statusSelfRes.body)}`);
    }
    console.log('   [SUCCESS] Status with self is "self".');

    // 10. Send Connection Request (POST /api/people/:id/connect)
    console.log('10. User A sends connection request to User B...');
    const sendReqRes = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: `/api/people/${userBId}/connect`,
        method: 'POST',
        headers: { Authorization: `Bearer ${tokenA}` }
      }
    );
    if (sendReqRes.status !== 201 || !sendReqRes.body.connection) {
      throw new Error(`Failed to send request: ${JSON.stringify(sendReqRes.body)}`);
    }
    connectionABId = sendReqRes.body.connection.id || sendReqRes.body.connection._id;
    console.log(`   [SUCCESS] Connection request created (ID: ${connectionABId}, status: Pending).`);

    // 11. Verify Connection Status updates
    console.log('11. Verifying pending status for both users...');
    const statusSenderRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: `/api/people/${userBId}/connection-status`,
      method: 'GET',
      headers: { Authorization: `Bearer ${tokenA}` }
    });
    if (statusSenderRes.body.status !== 'pending_sent') {
      throw new Error(`Expected 'pending_sent', got ${statusSenderRes.body.status}`);
    }

    const statusReceiverRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: `/api/people/${userAId}/connection-status`,
      method: 'GET',
      headers: { Authorization: `Bearer ${tokenB}` }
    });
    if (statusReceiverRes.body.status !== 'pending_received') {
      throw new Error(`Expected 'pending_received', got ${statusReceiverRes.body.status}`);
    }
    console.log('   [SUCCESS] User A sees "pending_sent", User B sees "pending_received".');

    // 12. User B lists Pending Requests (GET /api/people/requests)
    console.log('12. User B gets pending requests list...');
    const pendingReqsRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/people/requests',
      method: 'GET',
      headers: { Authorization: `Bearer ${tokenB}` }
    });
    if (pendingReqsRes.status !== 200 || pendingReqsRes.body.requests.length === 0) {
      throw new Error(`Failed to get pending requests: ${JSON.stringify(pendingReqsRes.body)}`);
    }
    console.log(`   [SUCCESS] User B has ${pendingReqsRes.body.requests.length} pending request from ${pendingReqsRes.body.requests[0].person.name}.`);

    // 13. Duplicate prevention
    console.log('13. Testing duplicate request prevention...');
    const dupRes = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: `/api/people/${userBId}/connect`,
        method: 'POST',
        headers: { Authorization: `Bearer ${tokenA}` }
      }
    );
    if (dupRes.status !== 400) {
      throw new Error(`Expected 400 Bad Request for duplicate connection, got ${dupRes.status}`);
    }
    console.log('   [SUCCESS] Duplicate request rejected with 400.');

    // 14. Unauthorized accept attempt by User C
    console.log('14. Security: User C tries to accept request sent to User B...');
    const unauthAcceptRes = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: `/api/people/requests/${connectionABId}/accept`,
        method: 'PATCH',
        headers: { Authorization: `Bearer ${tokenC}` }
      }
    );
    if (unauthAcceptRes.status !== 404 && unauthAcceptRes.status !== 403) {
      throw new Error(`Security breach: User C accepted User B's request with status ${unauthAcceptRes.status}`);
    }
    console.log('   [SUCCESS] Unauthorized user prevented from accepting request.');

    // 15. User B accepts connection request (PATCH /api/people/requests/:id/accept)
    console.log('15. User B accepts User A\'s connection request...');
    const acceptRes = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: `/api/people/requests/${connectionABId}/accept`,
        method: 'PATCH',
        headers: { Authorization: `Bearer ${tokenB}` }
      }
    );
    if (acceptRes.status !== 200 || acceptRes.body.connection.status !== 'Accepted') {
      throw new Error(`Failed to accept request: ${JSON.stringify(acceptRes.body)}`);
    }
    console.log('   [SUCCESS] Request accepted. Status: Accepted.');

    // 16. Verify Connections list for both users (GET /api/people/connections)
    console.log('16. Verifying active connections list for User A and User B...');
    const connARes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/people/connections',
      method: 'GET',
      headers: { Authorization: `Bearer ${tokenA}` }
    });
    if (connARes.status !== 200 || connARes.body.connections.length === 0) {
      throw new Error(`User A has no connections: ${JSON.stringify(connARes.body)}`);
    }

    const connBRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/people/connections',
      method: 'GET',
      headers: { Authorization: `Bearer ${tokenB}` }
    });
    if (connBRes.status !== 200 || connBRes.body.connections.length === 0) {
      throw new Error(`User B has no connections: ${JSON.stringify(connBRes.body)}`);
    }
    console.log(`   [SUCCESS] User A connected with ${connARes.body.connections[0].person.name}. User B connected with ${connBRes.body.connections[0].person.name}.`);

    // 17. User A removes connection (DELETE /api/people/connections/:id)
    console.log('17. User A removes connection with User B...');
    const removeRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: `/api/people/connections/${connectionABId}`,
      method: 'DELETE',
      headers: { Authorization: `Bearer ${tokenA}` }
    });
    if (removeRes.status !== 200) {
      throw new Error(`Failed to remove connection: ${JSON.stringify(removeRes.body)}`);
    }
    console.log('   [SUCCESS] Connection removed.');

    // 18. Rejection test flow
    console.log('18. Testing Rejection Flow: User A connects again, User B rejects...');
    const reConnectRes = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: `/api/people/${userBId}/connect`,
        method: 'POST',
        headers: { Authorization: `Bearer ${tokenA}` }
      }
    );
    const newConnId = reConnectRes.body.connection.id || reConnectRes.body.connection._id;

    const rejectRes = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: `/api/people/requests/${newConnId}/reject`,
        method: 'PATCH',
        headers: { Authorization: `Bearer ${tokenB}` }
      }
    );
    if (rejectRes.status !== 200 || rejectRes.body.connection.status !== 'Rejected') {
      throw new Error(`Reject failed: ${JSON.stringify(rejectRes.body)}`);
    }
    console.log('   [SUCCESS] Connection request rejected.');

    // 19. Cancellation test flow
    console.log('19. Testing Cancellation Flow: User B connects, then User B cancels...');
    const bConnectRes = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: `/api/people/${userAId}/connect`,
        method: 'POST',
        headers: { Authorization: `Bearer ${tokenB}` }
      }
    );
    const cancelConnId = bConnectRes.body.connection.id || bConnectRes.body.connection._id;

    const cancelRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: `/api/people/requests/${cancelConnId}/cancel`,
      method: 'DELETE',
      headers: { Authorization: `Bearer ${tokenB}` }
    });
    if (cancelRes.status !== 200) {
      throw new Error(`Cancel failed: ${JSON.stringify(cancelRes.body)}`);
    }
    console.log('   [SUCCESS] Pending request cancelled by sender.');

    // 20. Unauthenticated & Invalid ObjectId Security checks
    console.log('20. Security: Unauthenticated request & Invalid ObjectId...');
    const unauthRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/people',
      method: 'GET'
    });
    if (unauthRes.status !== 401) throw new Error(`Expected 401 for unauthenticated request, got ${unauthRes.status}`);

    const invalidIdRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/people/invalid-object-id',
      method: 'GET',
      headers: { Authorization: `Bearer ${tokenA}` }
    });
    if (invalidIdRes.status !== 400) throw new Error(`Expected 400 for invalid ObjectId, got ${invalidIdRes.status}`);
    console.log('   [SUCCESS] Unauthenticated requests (401) and invalid ObjectIds (400) handled cleanly.');

    console.log('\n====================================================');
    console.log('🎉 ALL MODULE 8 TESTS PASSED SUCCESSFULLY! (20/20)');
    console.log('====================================================\n');
  } catch (err) {
    console.error('\n❌ TEST FAILED:', err.message);
    process.exit(1);
  }
}

runTests();
