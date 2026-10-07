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
  console.log('RUNNING CAREERPILOT BACKEND MODULE 7 VERIFICATION');
  console.log('====================================================\n');

  const timestamp = Date.now();
  const userAEmail = `interview_alice_${timestamp}@careerpilot.test`;
  const userBEmail = `interview_bob_${timestamp}@careerpilot.test`;
  const password = 'Password@123';

  let tokenA = '';
  let tokenB = '';
  let interviewAId = '';
  let mockInterviewAId = '';
  let sampleQuestionId = '';

  try {
    // 1. Register Student A
    console.log('1. Registering Student A...');
    const regResA = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/auth/register',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      },
      { name: 'Alice Candidate', email: userAEmail, password }
    );
    if (regResA.status !== 201 || !regResA.body.token) {
      throw new Error(`Failed to register Student A: ${JSON.stringify(regResA.body)}`);
    }
    tokenA = regResA.body.token;
    console.log('   [SUCCESS] Student A registered.');

    // 2. Register Student B
    console.log('2. Registering Student B...');
    const regResB = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/auth/register',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      },
      { name: 'Bob Candidate', email: userBEmail, password }
    );
    if (regResB.status !== 201 || !regResB.body.token) {
      throw new Error(`Failed to register Student B: ${JSON.stringify(regResB.body)}`);
    }
    tokenB = regResB.body.token;
    console.log('   [SUCCESS] Student B registered.');

    // 3. Question Bank - Student A queries questions
    console.log('3. Student A retrieves questions from Question Bank...');
    const questionsRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/interview-questions?limit=10',
      method: 'GET',
      headers: { Authorization: `Bearer ${tokenA}` }
    });

    if (questionsRes.status !== 200 || !Array.isArray(questionsRes.body.questions) || questionsRes.body.questions.length === 0) {
      throw new Error(`Failed to get questions: ${JSON.stringify(questionsRes.body)}`);
    }
    sampleQuestionId = questionsRes.body.questions[0].id || questionsRes.body.questions[0]._id;
    console.log(`   [SUCCESS] Retrieved ${questionsRes.body.questions.length} questions. Sample Question ID: ${sampleQuestionId}`);

    // 4. Question Bank - Filter by Category
    console.log('4. Filtering Question Bank by Category (Technical)...');
    const techQRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/interview-questions?category=Technical',
      method: 'GET',
      headers: { Authorization: `Bearer ${tokenA}` }
    });
    if (techQRes.status !== 200 || techQRes.body.questions.some((q) => q.category !== 'Technical')) {
      throw new Error(`Category filter failed: ${JSON.stringify(techQRes.body)}`);
    }
    console.log(`   [SUCCESS] Technical questions filter returned ${techQRes.body.questions.length} matching questions.`);

    // 5. Question Bank - Admin check (Student cannot create question)
    console.log('5. Verifying Admin Protection: Student A tries to create question in question bank...');
    const createQRes = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/interview-questions',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokenA}`
        }
      },
      { question: 'Hacked question?' }
    );
    if (createQRes.status !== 403) {
      throw new Error(`Expected 403 Forbidden for non-admin question creation, got ${createQRes.status}`);
    }
    console.log('   [SUCCESS] Non-admin question creation correctly forbidden (403).');

    // 6. Student A creates an Interview Prep
    console.log('6. Student A creates Interview Prep (Google SDE)...');
    const createInterviewRes = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/interviews',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokenA}`
        }
      },
      {
        company: 'Google',
        jobTitle: 'Software Development Engineer',
        interviewType: 'Technical',
        scheduledDate: new Date(Date.now() + 7 * 86400000).toISOString(),
        location: 'Google Meet',
        meetingUrl: 'https://meet.google.com/xyz-abc-def',
        notes: 'Review Distributed Systems and Dynamic Programming.',
        preparationProgress: 35
      }
    );

    if (createInterviewRes.status !== 201 || !createInterviewRes.body.interview) {
      throw new Error(`Failed to create interview: ${JSON.stringify(createInterviewRes.body)}`);
    }
    interviewAId = createInterviewRes.body.interview.id || createInterviewRes.body.interview._id;
    console.log(`   [SUCCESS] Interview Prep created with ID: ${interviewAId}`);

    // 7. Student A lists Interviews
    console.log('7. Student A lists their interviews...');
    const listInterviewsRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/interviews?sort=upcoming',
      method: 'GET',
      headers: { Authorization: `Bearer ${tokenA}` }
    });
    if (listInterviewsRes.status !== 200 || listInterviewsRes.body.interviews.length === 0) {
      throw new Error(`Failed to list interviews: ${JSON.stringify(listInterviewsRes.body)}`);
    }
    console.log(`   [SUCCESS] Fetched ${listInterviewsRes.body.interviews.length} interviews for Student A.`);

    // 8. Student A gets Interview by ID
    console.log('8. Student A fetches interview by ID...');
    const getInterviewRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: `/api/interviews/${interviewAId}`,
      method: 'GET',
      headers: { Authorization: `Bearer ${tokenA}` }
    });
    if (getInterviewRes.status !== 200 || getInterviewRes.body.interview.company !== 'Google') {
      throw new Error(`Failed to get interview by ID: ${JSON.stringify(getInterviewRes.body)}`);
    }
    console.log(`   [SUCCESS] Retrieved interview: ${getInterviewRes.body.interview.company} (${getInterviewRes.body.interview.interviewType})`);

    // 9. Student A updates Interview details
    console.log('9. Student A updates interview notes and location...');
    const updateInterviewRes = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: `/api/interviews/${interviewAId}`,
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokenA}`
        }
      },
      {
        notes: 'Revised: Mastered Sliding Window and Trie questions.',
        location: 'Virtual Onsite (Round 1 & 2)'
      }
    );
    if (updateInterviewRes.status !== 200 || updateInterviewRes.body.interview.location !== 'Virtual Onsite (Round 1 & 2)') {
      throw new Error(`Failed to update interview: ${JSON.stringify(updateInterviewRes.body)}`);
    }
    console.log('   [SUCCESS] Interview details updated.');

    // 10. Student A updates Preparation Progress
    console.log('10. Student A updates preparation progress to 80%...');
    const progressRes = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: `/api/interviews/${interviewAId}/progress`,
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokenA}`
        }
      },
      { preparationProgress: 80 }
    );
    if (progressRes.status !== 200 || progressRes.body.interview.preparationProgress !== 80) {
      throw new Error(`Failed to update progress: ${JSON.stringify(progressRes.body)}`);
    }
    console.log('   [SUCCESS] Preparation progress updated to 80%.');

    // 11. Student A updates Interview Status
    console.log('11. Student A updates interview status to Completed...');
    const statusRes = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: `/api/interviews/${interviewAId}/status`,
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokenA}`
        }
      },
      { status: 'Completed' }
    );
    if (statusRes.status !== 200 || statusRes.body.interview.status !== 'Completed') {
      throw new Error(`Failed to update status: ${JSON.stringify(statusRes.body)}`);
    }
    console.log('   [SUCCESS] Interview status updated to Completed.');

    // 12. Student A creates a Mock Interview Session
    console.log('12. Student A creates a Mock Interview session with question IDs...');
    const qIds = questionsRes.body.questions.slice(0, 3).map((q) => q.id || q._id);
    const createMockRes = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/mock-interviews',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokenA}`
        }
      },
      {
        title: 'Google Technical Mock Round 1',
        interviewType: 'Technical',
        interview: interviewAId,
        questionIds: qIds
      }
    );
    if (createMockRes.status !== 201 || !createMockRes.body.mockInterview) {
      throw new Error(`Failed to create mock interview: ${JSON.stringify(createMockRes.body)}`);
    }
    mockInterviewAId = createMockRes.body.mockInterview.id || createMockRes.body.mockInterview._id;
    console.log(`   [SUCCESS] Mock Interview created with ID: ${mockInterviewAId} (${createMockRes.body.mockInterview.questions.length} questions snapshot)`);

    // 13. Student A starts Mock Interview
    console.log('13. Student A starts the mock interview session...');
    const startMockRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: `/api/mock-interviews/${mockInterviewAId}/start`,
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}` }
    });
    if (startMockRes.status !== 200 || startMockRes.body.mockInterview.status !== 'In Progress') {
      throw new Error(`Failed to start mock interview: ${JSON.stringify(startMockRes.body)}`);
    }
    console.log('   [SUCCESS] Mock Interview started. Status: In Progress.');

    // 14. Student A submits answer for Question 1
    console.log('14. Student A submits answer for question 1...');
    const submitAnswerRes = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: `/api/mock-interviews/${mockInterviewAId}/answer`,
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokenA}`
        }
      },
      {
        questionIndex: 0,
        answer: 'I would use a HashMap with doubly-linked list for O(1) LRU Cache operations.'
      }
    );
    if (submitAnswerRes.status !== 200 || !submitAnswerRes.body.mockInterview.questions[0].answer) {
      throw new Error(`Failed to submit answer: ${JSON.stringify(submitAnswerRes.body)}`);
    }
    console.log('   [SUCCESS] Question 1 answer recorded successfully.');

    // 15. Student A completes the mock interview
    console.log('15. Student A completes the mock interview session...');
    const completeMockRes = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: `/api/mock-interviews/${mockInterviewAId}/complete`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokenA}`
        }
      },
      { overallNotes: 'Smooth technical explanation and clean time complexity analysis.' }
    );
    if (completeMockRes.status !== 200 || completeMockRes.body.mockInterview.status !== 'Completed') {
      throw new Error(`Failed to complete mock interview: ${JSON.stringify(completeMockRes.body)}`);
    }
    console.log('   [SUCCESS] Mock interview marked as Completed.');

    // 16. Security & Isolation: Student B cannot view Student A's interview
    console.log('16. Security Isolation: Student B attempts to access Student A interview...');
    const bobAccessInterviewRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: `/api/interviews/${interviewAId}`,
      method: 'GET',
      headers: { Authorization: `Bearer ${tokenB}` }
    });
    if (bobAccessInterviewRes.status !== 404) {
      throw new Error(`Security breach: Student B accessed Student A interview with status ${bobAccessInterviewRes.status}`);
    }
    console.log('   [SUCCESS] Student B isolated from viewing Student A interview (404).');

    // 17. Security Isolation: Student B cannot modify Student A's mock interview
    console.log('17. Security Isolation: Student B attempts to submit answer to Student A mock interview...');
    const bobSubmitAnswerRes = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: `/api/mock-interviews/${mockInterviewAId}/answer`,
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokenB}`
        }
      },
      { questionIndex: 0, answer: 'Malicious answer' }
    );
    if (bobSubmitAnswerRes.status !== 404) {
      throw new Error(`Security breach: Student B modified Student A mock interview with status ${bobSubmitAnswerRes.status}`);
    }
    console.log('   [SUCCESS] Student B isolated from modifying Student A mock interview (404).');

    // 18. Unauthenticated Access Protection
    console.log('18. Security: Unauthenticated request to /api/interviews...');
    const unauthRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/interviews',
      method: 'GET'
    });
    if (unauthRes.status !== 401) {
      throw new Error(`Security breach: Unauthenticated request allowed with status ${unauthRes.status}`);
    }
    console.log('   [SUCCESS] Unauthenticated request correctly rejected with 401 Unauthorized.');

    // 19. Invalid ObjectId Validation
    console.log('19. Input Validation: Invalid ObjectId parameter...');
    const invalidIdRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/interviews/invalid-id-12345',
      method: 'GET',
      headers: { Authorization: `Bearer ${tokenA}` }
    });
    if (invalidIdRes.status !== 400) {
      throw new Error(`Expected 400 for invalid ObjectId, got status ${invalidIdRes.status}`);
    }
    console.log('   [SUCCESS] Invalid ObjectId correctly handled with 400 Bad Request.');

    // 20. Student A deletes Mock Interview and Interview
    console.log('20. Clean up: Student A deletes mock interview & interview...');
    const deleteMockRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: `/api/mock-interviews/${mockInterviewAId}`,
      method: 'DELETE',
      headers: { Authorization: `Bearer ${tokenA}` }
    });
    if (deleteMockRes.status !== 200) throw new Error('Failed to delete mock interview');

    const deleteInterviewRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: `/api/interviews/${interviewAId}`,
      method: 'DELETE',
      headers: { Authorization: `Bearer ${tokenA}` }
    });
    if (deleteInterviewRes.status !== 200) throw new Error('Failed to delete interview');
    console.log('   [SUCCESS] Mock interview and Interview deleted successfully.');

    console.log('\n====================================================');
    console.log('🎉 ALL MODULE 7 TESTS PASSED SUCCESSFULLY! (20/20)');
    console.log('====================================================\n');
  } catch (err) {
    console.error('\n❌ TEST FAILED:', err.message);
    process.exit(1);
  }
}

runTests();
