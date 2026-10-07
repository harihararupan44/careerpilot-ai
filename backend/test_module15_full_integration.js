const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failed++;
  }
}

async function runFullIntegrationTest() {
  console.log('====================================================');
  console.log('CAREERPILOT MODULE 15: FULL SYSTEM INTEGRATION TEST');
  console.log('====================================================\n');

  try {
    // 1. Health Check
    console.log('1. Testing Backend Health Check...');
    const healthRes = await axios.get(`${BASE_URL}/health`);
    assert(healthRes.status === 200 && healthRes.data.success, 'Backend health is 200 OK');

    // 2. Authentication Flow (Register, Login, GetMe)
    console.log('\n2. Testing Authentication Integration (Register, Login, GetMe)...');
    const userAData = {
      name: 'Integration User A',
      email: `integration_a_${Date.now()}@example.com`,
      password: 'Password123!'
    };
    const userBData = {
      name: 'Integration User B',
      email: `integration_b_${Date.now()}@example.com`,
      password: 'Password123!'
    };

    const regARes = await axios.post(`${BASE_URL}/auth/register`, userAData);
    assert(regARes.status === 201 && regARes.data.token, 'User A registered with JWT token');
    const tokenA = regARes.data.token;
    const clientA = axios.create({ baseURL: BASE_URL, headers: { Authorization: `Bearer ${tokenA}` } });

    const regBRes = await axios.post(`${BASE_URL}/auth/register`, userBData);
    assert(regBRes.status === 201 && regBRes.data.token, 'User B registered with JWT token');
    const tokenB = regBRes.data.token;
    const clientB = axios.create({ baseURL: BASE_URL, headers: { Authorization: `Bearer ${tokenB}` } });

    const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: userAData.email,
      password: userAData.password
    });
    assert(loginRes.status === 200 && loginRes.data.token, 'User A logged in successfully');

    const meRes = await clientA.get('/auth/me');
    assert(meRes.status === 200 && meRes.data.user.email === userAData.email, 'GET /auth/me restored User A profile');

    // 3. User & Career Profile
    console.log('\n3. Testing Profile Integration (GET /profile, PUT /profile)...');
    const profileUpdateRes = await clientA.put('/users/profile', {
      college: 'Stanford University',
      degree: 'M.S. in Computer Science',
      targetRole: 'Full Stack Engineer',
      skills: ['React', 'Node.js', 'MongoDB', 'TypeScript', 'Docker'],
      openToGuidance: true,
      guidanceTopics: ['Full Stack Prep', 'System Design'],
      guidanceBio: 'Experienced full stack developer open to mentoring.'
    });
    assert(profileUpdateRes.status === 200 && profileUpdateRes.data.success, 'Updated User A profile in MongoDB');

    const getProfileRes = await clientA.get('/users/profile');
    assert(getProfileRes.data.profile.college === 'Stanford University', 'Profile retrieved with updated college');
    assert(getProfileRes.data.profile.openToGuidance === true, 'Profile openToGuidance is preserved');

    // Also update User B to be open to guidance
    await clientB.put('/users/profile', {
      college: 'MIT',
      targetRole: 'Senior Software Engineer',
      skills: ['Distributed Systems', 'Go', 'Kubernetes'],
      openToGuidance: true,
      guidanceTopics: ['Backend', 'System Design'],
      guidanceBio: 'Backend engineer mentoring aspiring developers.'
    });

    // 4. Resume Management
    console.log('\n4. Testing Resume Management (POST, GET, PUT active, DELETE)...');
    const createResumeRes = await clientA.post('/resumes', {
      title: 'Full Stack Resume 2026',
      fileName: 'FullStack_Resume.pdf',
      summary: 'Experienced full stack engineer with strong React and Node background.',
      skills: ['React', 'Node.js', 'Express', 'MongoDB', 'TypeScript', 'GraphQL', 'AWS'],
      experience: [
        {
          company: 'TechCorp',
          role: 'Software Engineer Intern',
          duration: '6 Months',
          description: 'Built high throughput REST APIs in Express and React dashboards.'
        }
      ]
    });
    const resumeId = createResumeRes.data.resume?.id || createResumeRes.data.resume?._id;
    assert(createResumeRes.status === 201 && resumeId, 'Resume created in MongoDB');

    const listResumesRes = await clientA.get('/resumes');
    assert(listResumesRes.data.resumes.length >= 1, 'Listed user resumes from MongoDB');

    const activeResumeRes = await clientA.put(`/resumes/${resumeId}/active`);
    assert(activeResumeRes.data.success, 'Set resume as active resume');

    // 5. Jobs & Saved Jobs
    console.log('\n5. Testing Jobs & Saved Jobs Integration...');
    const jobsRes = await clientA.get('/jobs');
    assert(jobsRes.status === 200 && Array.isArray(jobsRes.data.jobs), 'Listed jobs from backend');
    const firstJob = jobsRes.data.jobs[0];
    const testJobId = firstJob ? (firstJob._id || firstJob.id) : null;

    if (testJobId) {
      const saveJobRes = await clientA.post(`/jobs/${testJobId}/save`);
      assert(
        (saveJobRes.status === 200 || saveJobRes.status === 201) && saveJobRes.data.success,
        'Saved job to user profile'
      );

      const checkSavedRes = await clientA.get(`/jobs/${testJobId}/saved`);
      assert(checkSavedRes.data.saved === true, 'Verified job is saved');

      const savedListRes = await clientA.get('/jobs/saved');
      assert(savedListRes.data.jobs.length >= 1, 'Listed saved jobs for User A');
    }

    // 6. Application Tracker & Interview Scheduling
    console.log('\n6. Testing Application Tracker & Interview Integration...');
    const createAppRes = await clientA.post('/applications', {
      company: 'Google',
      jobTitle: 'Software Engineer III',
      status: 'Interview',
      appliedDate: new Date('2026-09-01'),
      notes: 'Initial recruiter screening passed with flying colors.'
    });
    const appId = createAppRes.data.application?._id || createAppRes.data.application?.id;
    assert(createAppRes.status === 201 && appId, 'Application created in Interview status');

    // Create interview record linked to application
    const scheduledDate = new Date('2026-11-20T14:30:00.000Z');
    const createInterviewRes = await clientA.post('/interviews', {
      application: appId,
      company: 'Google',
      jobTitle: 'Software Engineer III',
      interviewType: 'Technical',
      scheduledDate: scheduledDate,
      status: 'Upcoming',
      meetingUrl: 'https://meet.google.com/xyz-tech-interview',
      location: 'Google Meet'
    });
    assert(createInterviewRes.status === 201, 'Created linked Interview document in MongoDB');

    // Verify GET /applications/:id returns interview details
    const getAppDetailRes = await clientA.get(`/applications/${appId}`);
    assert(getAppDetailRes.status === 200, 'GET /applications/:id returned 200');
    assert(getAppDetailRes.data.application.interview !== null, 'Application returns populated interview document');
    assert(
      new Date(getAppDetailRes.data.application.interview.scheduledDate).toISOString() === scheduledDate.toISOString(),
      'Application returns accurate interview scheduledDate'
    );

    const appStatsRes = await clientA.get('/applications/stats');
    assert(appStatsRes.status === 200 && appStatsRes.data.stats.total >= 1, 'Application stats calculated accurately');

    // 7. Mock Interview & Questions
    console.log('\n7. Testing Mock Interview & Question Bank...');
    const questionsRes = await clientA.get('/interview-questions');
    assert(questionsRes.status === 200 && Array.isArray(questionsRes.data.questions), 'Loaded question bank from backend');

    const createMockRes = await clientA.post('/mock-interviews', {
      title: 'Google Technical Mock Interview',
      company: 'Google',
      role: 'Software Engineer III',
      questions: [
        {
          question: 'How do you design a high-throughput distributed message queue?',
          category: 'Technical'
        }
      ]
    });
    const mockId = createMockRes.data.mockInterview?._id || createMockRes.data.mockInterview?.id;
    assert(createMockRes.status === 201 && mockId, 'Mock interview session created in MongoDB');

    const answerRes = await clientA.patch(`/mock-interviews/${mockId}/answer`, {
      questionIndex: 0,
      userAnswer: 'I would use a partitioned commit log like Apache Kafka with leader-follower replication.'
    });
    assert(answerRes.status === 200 && answerRes.data.success, 'Mock interview answer recorded');

    const completeMockRes = await clientA.post(`/mock-interviews/${mockId}/complete`, {
      overallScore: 88,
      feedback: 'Excellent architectural explanation of partitioned storage.'
    });
    assert(completeMockRes.status === 200 && completeMockRes.data.mockInterview.status === 'Completed', 'Mock interview completed');

    // 8. Explore People & Connections
    console.log('\n8. Testing Explore People & Connections (User A <-> User B)...');
    const peopleRes = await clientA.get('/people');
    assert(peopleRes.status === 200 && Array.isArray(peopleRes.data.people), 'GET /people returned registered community members');

    const userBId = regBRes.data.user?.id || regBRes.data.user?._id;
    const connectRes = await clientA.post(`/people/${userBId}/connect`);
    assert(connectRes.status === 201 && connectRes.data.success, 'User A sent connection request to User B');

    const bRequests = await clientB.get('/people/requests');
    assert(bRequests.data.requests.length >= 1, 'User B received connection request from User A');
    const connectionId = bRequests.data.requests[0].connectionId || bRequests.data.requests[0]._id || bRequests.data.requests[0].id;

    const acceptConnRes = await clientB.patch(`/people/requests/${connectionId}/accept`);
    assert(acceptConnRes.status === 200 && acceptConnRes.data.success, 'User B accepted User A connection request');

    const aConnections = await clientA.get('/people/connections');
    assert(aConnections.data.connections.length >= 1, 'User A confirmed connection with User B');

    // 9. Career Guidance Requests
    console.log('\n9. Testing Career Guidance Flow (User A -> User B)...');
    const guidancePeopleRes = await clientA.get('/guidance/people');
    assert(guidancePeopleRes.status === 200, 'GET /guidance/people returned mentors');

    const sendGuidanceRes = await clientA.post('/guidance/requests', {
      mentorId: userBId,
      topic: 'System Design Interview Prep',
      message: 'Hi, I would like to get some advice on distributed system rounds.',
      targetCompany: 'Google',
      targetRole: 'Software Engineer'
    });
    const guidanceRequestId = sendGuidanceRes.data.data?._id || sendGuidanceRes.data.data?.id;
    assert(sendGuidanceRes.status === 201 && guidanceRequestId, 'User A submitted guidance request to User B');

    const bGuidanceReceived = await clientB.get('/guidance/requests/received');
    assert(bGuidanceReceived.data.data.length >= 1, 'User B received guidance request in inbox');

    const acceptGuidanceRes = await clientB.patch(`/guidance/requests/${guidanceRequestId}/accept`, {
      responseMessage: 'Happy to help! Let us schedule a call.'
    });
    assert(acceptGuidanceRes.status === 200 && acceptGuidanceRes.data.data.status === 'Accepted', 'User B accepted guidance request');

    // 10. Interview Experiences
    console.log('\n10. Testing Interview Experiences Module...');
    const createExpRes = await clientA.post('/interview-experiences', {
      companyName: 'Google',
      jobTitle: 'Software Engineer',
      experienceTitle: 'Google Software Engineer Interview Experience 2026',
      overallDifficulty: 'Hard',
      overallExperience: 'Thorough technical process focusing heavily on algorithms, system design, and concurrency.',
      rounds: [
        { roundName: 'Coding Round 1', description: 'Graph traversal and dynamic programming optimization.' }
      ],
      preparationTips: 'Practice explaining your thought process clearly before writing code.'
    });
    const expId = createExpRes.data.data?._id || createExpRes.data.data?.id;
    assert(createExpRes.status === 201 && expId, 'Created Interview Experience in MongoDB');

    const toggleHelpfulRes = await clientB.post(`/interview-experiences/${expId}/helpful`);
    assert(toggleHelpfulRes.status === 200 && toggleHelpfulRes.data.helpfulCount >= 1, 'User B marked experience as helpful');

    // 11. Companies & Intelligence
    console.log('\n11. Testing Companies & Intelligence Module...');
    const companiesRes = await clientA.get('/companies');
    assert(companiesRes.status === 200 && Array.isArray(companiesRes.data.data), 'GET /companies listed companies');
    const comp = companiesRes.data.data[0];
    if (comp) {
      const compId = comp._id || comp.id;
      const compDetailRes = await clientA.get(`/companies/${compId}`);
      assert(compDetailRes.status === 200 && compDetailRes.data.data.name, 'GET /companies/:id loaded company profile');

      const compJobsRes = await clientA.get(`/companies/${compId}/jobs`);
      assert(compJobsRes.status === 200, 'Loaded jobs for company');

      const saveCompRes = await clientA.post(`/companies/${compId}/save`);
      assert(
        (saveCompRes.status === 200 || saveCompRes.status === 201) && saveCompRes.data.success,
        'User A saved company'
      );
    }

    // 12. Dashboard & Analytics Modules
    console.log('\n12. Testing Dashboard & Analytics APIs...');
    const dashboardSummaryRes = await clientA.get('/dashboard/summary');
    assert(
      dashboardSummaryRes.status === 200 && dashboardSummaryRes.data.data.applications !== undefined,
      'Dashboard summary returns live MongoDB metrics'
    );

    const dashboardActivityRes = await clientA.get('/dashboard/activity');
    assert(dashboardActivityRes.status === 200 && Array.isArray(dashboardActivityRes.data.data), 'Dashboard activity returns real event feed');

    const analyticsOverviewRes = await clientA.get('/analytics/overview');
    assert(analyticsOverviewRes.status === 200 && analyticsOverviewRes.data.data.summary, 'Analytics overview returned MongoDB statistics');

    // 13. AI Career Intelligence
    console.log('\n13. Testing AI Career Intelligence Module (Resume, Job Match, Skill Gap)...');
    const aiResumeRes = await clientA.post('/ai/resume/analyze', {
      resumeId: resumeId
    });
    assert(aiResumeRes.status === 200 && aiResumeRes.data.data.overallScore, 'AI Resume Analysis returned score and sections');

    const aiJobMatchRes = await clientA.post('/ai/job/match', {
      resumeId: resumeId,
      jobDescription: 'Looking for a Full Stack Engineer with strong React, Node.js, and MongoDB experience.'
    });
    assert(aiJobMatchRes.status === 200 && aiJobMatchRes.data.data.matchScore !== undefined, 'AI Job Match returned fit score and matching skills');

    const aiSkillGapRes = await clientA.post('/ai/career/skill-gap', {
      targetRole: 'Cloud Architect'
    });
    assert(aiSkillGapRes.status === 200 && aiSkillGapRes.data.data.targetRole, 'AI Skill Gap analysis completed');

    // 14. Notifications & Reminders
    console.log('\n14. Testing Notifications Integration...');
    const notifRes = await clientA.get('/notifications');
    assert(notifRes.status === 200 && Array.isArray(notifRes.data.data.notifications), 'GET /notifications listed notifications');

    const unreadRes = await clientA.get('/notifications/unread-count');
    assert(unreadRes.status === 200 && unreadRes.data.data.unreadCount !== undefined, 'GET /notifications/unread-count returned count');

    const readAllRes = await clientA.patch('/notifications/read-all');
    assert(readAllRes.status === 200, 'Marked all notifications as read');

    // 15. Authorization & Multi-User Security Check
    console.log('\n15. Testing Authorization & Cross-User Security Restrictions...');
    try {
      // User B should NOT be able to delete User A's application
      await clientB.delete(`/applications/${appId}`);
      assert(false, 'User B was incorrectly allowed to delete User A application');
    } catch (err) {
      assert(err.response?.status === 404 || err.response?.status === 403, 'User B blocked from deleting User A application (404/403)');
    }

    try {
      // User B should NOT be able to delete User A's resume
      await clientB.delete(`/resumes/${resumeId}`);
      assert(false, 'User B was incorrectly allowed to delete User A resume');
    } catch (err) {
      assert(err.response?.status === 404 || err.response?.status === 403, 'User B blocked from deleting User A resume (404/403)');
    }

    console.log('\n====================================================');
    console.log(`FULL INTEGRATION TEST SUMMARY: ${passed} PASSED | ${failed} FAILED`);
    console.log('====================================================\n');

  } catch (err) {
    console.error('❌ Integration test encountered unexpected failure:', err.response?.data || err.message);
    failed++;
  } finally {
    process.exit(failed > 0 ? 1 : 0);
  }
}

runFullIntegrationTest();
