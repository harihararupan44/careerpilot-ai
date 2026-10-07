const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const axios = require('axios');
const mongoose = require('mongoose');

const BASE_URL = 'http://localhost:5000/api';

const results = [];

function recordTest(moduleName, testName, passed, details = '', bug = null, fix = null) {
  const status = passed ? 'PASS' : 'FAIL';
  results.push({ moduleName, testName, status, details, bug, fix });
  if (passed) {
    console.log(`  ✅ [${moduleName}] ${testName}: PASS ${details ? `(${details})` : ''}`);
  } else {
    console.error(`  ❌ [${moduleName}] ${testName}: FAIL ${details ? `(${details})` : ''}`);
    if (bug) console.error(`     🐛 Bug: ${bug}`);
  }
}

async function runQASuite() {
  console.log('================================================================');
  console.log('CAREERPILOT MODULE 17: COMPLETE QA & TEST AUTOMATION SUITE');
  console.log('================================================================\n');

  try {
    // -------------------------------------------------------------
    // SECTION 1: Health & Database Connectivity
    // -------------------------------------------------------------
    console.log('\n--- SECTION 1: SYSTEM HEALTH & SERVER STARTUP ---');
    try {
      const healthRes = await axios.get(`${BASE_URL}/health`);
      recordTest('System Health', 'GET /api/health', healthRes.status === 200 && healthRes.data.success, `DB Host: ${healthRes.data.database?.host}`);
    } catch (e) {
      recordTest('System Health', 'GET /api/health', false, e.message);
    }

    // -------------------------------------------------------------
    // SECTION 2: Authentication Testing
    // -------------------------------------------------------------
    console.log('\n--- SECTION 2: AUTHENTICATION TESTING ---');
    const timestamp = Date.now();
    const userA = {
      name: 'QA User Alpha',
      email: `qa_alpha_${timestamp}@example.com`,
      password: 'StrongPassword123!'
    };
    const userB = {
      name: 'QA User Beta',
      email: `qa_beta_${timestamp}@example.com`,
      password: 'StrongPassword123!'
    };

    let tokenA = null;
    let tokenB = null;
    let clientA = null;
    let clientB = null;
    let userAId = null;
    let userBId = null;

    // A. Register valid User A
    try {
      const regRes = await axios.post(`${BASE_URL}/auth/register`, userA);
      tokenA = regRes.data.token;
      userAId = regRes.data.user.id || regRes.data.user._id;
      clientA = axios.create({ baseURL: BASE_URL, headers: { Authorization: `Bearer ${tokenA}` } });
      recordTest('Authentication', 'Register New User A', regRes.status === 201 && !!tokenA);
    } catch (e) {
      recordTest('Authentication', 'Register New User A', false, e.response?.data?.message || e.message);
    }

    // Register User B
    try {
      const regResB = await axios.post(`${BASE_URL}/auth/register`, userB);
      tokenB = regResB.data.token;
      userBId = regResB.data.user.id || regResB.data.user._id;
      clientB = axios.create({ baseURL: BASE_URL, headers: { Authorization: `Bearer ${tokenB}` } });
      recordTest('Authentication', 'Register New User B', regResB.status === 201 && !!tokenB);
    } catch (e) {
      recordTest('Authentication', 'Register New User B', false, e.response?.data?.message || e.message);
    }

    // B. Register duplicate email
    try {
      await axios.post(`${BASE_URL}/auth/register`, userA);
      recordTest('Authentication', 'Duplicate Email Rejection', false, 'Should have failed with 400/409');
    } catch (e) {
      const isRejected = e.response?.status === 400 || e.response?.status === 409;
      recordTest('Authentication', 'Duplicate Email Rejection', isRejected, `Status: ${e.response?.status}`);
    }

    // C. Register invalid email
    try {
      await axios.post(`${BASE_URL}/auth/register`, { name: 'Invalid', email: 'invalid-email-format', password: 'password123' });
      recordTest('Authentication', 'Invalid Email Rejection', false, 'Should fail validation');
    } catch (e) {
      recordTest('Authentication', 'Invalid Email Rejection', e.response?.status === 400, `Status: ${e.response?.status}`);
    }

    // D. Missing required fields
    try {
      await axios.post(`${BASE_URL}/auth/register`, { email: 'onlyemail@test.com' });
      recordTest('Authentication', 'Missing Required Fields Rejection', false, 'Should fail validation');
    } catch (e) {
      recordTest('Authentication', 'Missing Required Fields Rejection', e.response?.status === 400, `Status: ${e.response?.status}`);
    }

    // E. Correct login
    try {
      const loginRes = await axios.post(`${BASE_URL}/auth/login`, { email: userA.email, password: userA.password });
      recordTest('Authentication', 'Login with Correct Credentials', loginRes.status === 200 && !!loginRes.data.token);
    } catch (e) {
      recordTest('Authentication', 'Login with Correct Credentials', false, e.message);
    }

    // F. Incorrect password
    try {
      await axios.post(`${BASE_URL}/auth/login`, { email: userA.email, password: 'WrongPassword999!' });
      recordTest('Authentication', 'Login with Incorrect Password Rejection', false, 'Should return 401');
    } catch (e) {
      recordTest('Authentication', 'Login with Incorrect Password Rejection', e.response?.status === 401, `Status: ${e.response?.status}`);
    }

    // G. GET /api/auth/me (token restore)
    try {
      const meRes = await clientA.get('/auth/me');
      recordTest('Authentication', 'GET /api/auth/me (Restore Session)', meRes.status === 200 && meRes.data.user?.email === userA.email);
    } catch (e) {
      recordTest('Authentication', 'GET /api/auth/me (Restore Session)', false, e.message);
    }

    // H. Access protected route without token
    try {
      await axios.get(`${BASE_URL}/applications`);
      recordTest('Authentication', 'Protected Route without Token Rejection', false, 'Should return 401');
    } catch (e) {
      recordTest('Authentication', 'Protected Route without Token Rejection', e.response?.status === 401, `Status: ${e.response?.status}`);
    }

    // -------------------------------------------------------------
    // SECTION 3: Profile Testing
    // -------------------------------------------------------------
    console.log('\n--- SECTION 3: PROFILE TESTING ---');
    try {
      const updateRes = await clientA.put('/users/profile', {
        college: 'Carnegie Mellon University',
        degree: 'B.S. in Computer Science',
        branch: 'Software Engineering',
        graduationYear: 2026,
        location: 'Pittsburgh, PA',
        bio: 'Passionate full stack and distributed systems engineer.',
        skills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'Docker', 'AWS', 'Redis'],
        targetRole: 'Software Development Engineer',
        github: 'https://github.com/qaalpha',
        linkedin: 'https://linkedin.com/in/qaalpha',
        portfolio: 'https://qaalpha.dev',
        openToGuidance: true,
        guidanceTopics: ['Resume Review', 'DSA', 'System Design'],
        guidanceBio: 'Ready to help juniors with coding and resume guidance.'
      });
      recordTest('Profile', 'PUT /users/profile (Update Profile)', updateRes.status === 200 && updateRes.data.success);

      const getRes = await clientA.get('/users/profile');
      const p = getRes.data.profile;
      const validProfile = p.college === 'Carnegie Mellon University' && p.skills.includes('PostgreSQL') && p.openToGuidance === true;
      recordTest('Profile', 'GET /users/profile (Verify Persistence in DB)', getRes.status === 200 && validProfile, `College: ${p.college}`);
    } catch (e) {
      recordTest('Profile', 'Profile Operations', false, e.response?.data?.message || e.message);
    }

    // Also update User B profile
    await clientB.put('/users/profile', {
      college: 'UC Berkeley',
      degree: 'B.S. in EECS',
      branch: 'Computer Science',
      graduationYear: 2025,
      location: 'San Francisco, CA',
      bio: 'Senior engineer mentoring graduates.',
      skills: ['Go', 'Distributed Systems', 'Kubernetes', 'gRPC'],
      targetRole: 'Backend Infrastructure Engineer',
      openToGuidance: true,
      guidanceTopics: ['Backend System Design', 'Mock Interviews'],
      guidanceBio: 'Available for architecture and backend interview prep.'
    });

    // -------------------------------------------------------------
    // SECTION 4: Resume Testing & Dynamic AI Differentiation
    // -------------------------------------------------------------
    console.log('\n--- SECTION 4: RESUME TESTING & AI SCORING DIFFERENTIATION ---');
    let resumeAId = null;
    let resumeBId = null;

    // Strong Resume (User A)
    try {
      const resA = await clientA.post('/resumes', {
        title: 'Strong Software Engineer Resume',
        fileName: 'Strong_SE_Resume.pdf',
        summary: 'Experienced Software Engineer with deep expertise in full-stack web applications, REST APIs, and microservices.',
        skills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Express', 'MongoDB', 'Docker', 'Kubernetes', 'Redis', 'AWS'],
        experience: [
          {
            company: 'Tech Innovations Inc',
            role: 'Software Engineer Intern',
            duration: 'May 2025 - Aug 2025',
            description: 'Architected distributed caching with Redis reducing latency by 45%. Built React dashboard serving 50k DAU.'
          }
        ],
        education: [
          {
            institution: 'Carnegie Mellon University',
            degree: 'B.S. in Computer Science',
            startYear: 2022,
            endYear: 2026
          }
        ]
      });
      resumeAId = resA.data.resume?.id || resA.data.resume?._id;
      recordTest('Resume', 'POST /resumes (Create Strong Resume)', resA.status === 201 && !!resumeAId);
    } catch (e) {
      recordTest('Resume', 'POST /resumes (Create Strong Resume)', false, e.message);
    }

    // Weak / Deliberately Poor Resume (User A)
    try {
      const resB = await clientA.post('/resumes', {
        title: 'Weak Generic Resume',
        fileName: 'Weak_Resume.pdf',
        summary: 'Hard worker looking for any job. Quick learner with communication skills.',
        skills: ['Microsoft Word', 'Typing', 'Internet Browsing'],
        experience: [],
        education: []
      });
      resumeBId = resB.data.resume?.id || resB.data.resume?._id;
      recordTest('Resume', 'POST /resumes (Create Weak Resume for Comparison)', resB.status === 201 && !!resumeBId);
    } catch (e) {
      recordTest('Resume', 'POST /resumes (Create Weak Resume)', false, e.message);
    }

    // Set Active Resume
    try {
      const actRes = await clientA.put(`/resumes/${resumeAId}/active`);
      recordTest('Resume', 'PUT /resumes/:id/active (Set Active)', actRes.status === 200 && actRes.data.success);
    } catch (e) {
      recordTest('Resume', 'PUT /resumes/:id/active', false, e.message);
    }

    // List Resumes
    try {
      const listRes = await clientA.get('/resumes');
      recordTest('Resume', 'GET /resumes (List User Resumes)', listRes.status === 200 && listRes.data.resumes.length >= 2);
    } catch (e) {
      recordTest('Resume', 'GET /resumes', false, e.message);
    }

    // Cross-user resume isolation check (User B cannot view or edit User A's resume)
    try {
      await clientB.get(`/resumes/${resumeAId}`);
      recordTest('Resume Authorization', 'User B accessing User A Resume (Cross-User Isolation)', false, 'Should return 404/403');
    } catch (e) {
      const isBlocked = e.response?.status === 404 || e.response?.status === 403;
      recordTest('Resume Authorization', 'User B accessing User A Resume (Cross-User Isolation)', isBlocked, `Status: ${e.response?.status}`);
    }

    // Test AI Resume Analysis on both resumes (MUST yield distinct scores based on content)
    try {
      const [aiResStrong, aiResWeak] = await Promise.all([
        clientA.post('/ai/resume/analyze', { resumeId: resumeAId }),
        clientA.post('/ai/resume/analyze', { resumeId: resumeBId })
      ]);

      const strongScore = aiResStrong.data.data.overallScore;
      const weakScore = aiResWeak.data.data.overallScore;

      const scoreDifferentiation = typeof strongScore === 'number' && typeof weakScore === 'number' && strongScore > weakScore;
      recordTest(
        'AI Resume Intelligence',
        'Dynamic AI Scoring Differentiation (Strong vs Weak Resume)',
        scoreDifferentiation,
        `Strong Score: ${strongScore} vs Weak Score: ${weakScore}`
      );
    } catch (e) {
      recordTest('AI Resume Intelligence', 'Dynamic AI Scoring Differentiation', false, e.response?.data?.message || e.message);
    }

    // -------------------------------------------------------------
    // SECTION 5: Jobs & Saved Jobs
    // -------------------------------------------------------------
    console.log('\n--- SECTION 5: JOBS & SAVED JOBS TESTING ---');
    let testJobId = null;
    try {
      const jobsRes = await clientA.get('/jobs?limit=10&page=1');
      recordTest('Jobs', 'GET /jobs (List Jobs with Pagination)', jobsRes.status === 200 && Array.isArray(jobsRes.data.jobs));
      if (jobsRes.data.jobs.length > 0) {
        testJobId = jobsRes.data.jobs[0]._id || jobsRes.data.jobs[0].id;
      }
    } catch (e) {
      recordTest('Jobs', 'GET /jobs', false, e.message);
    }

    if (testJobId) {
      // Search Jobs
      try {
        const searchRes = await clientA.get('/jobs?search=Software');
        recordTest('Jobs', 'GET /jobs (Search Functionality)', searchRes.status === 200 && Array.isArray(searchRes.data.jobs));
      } catch (e) {
        recordTest('Jobs', 'GET /jobs (Search)', false, e.message);
      }

      // Filter Jobs
      try {
        const filterRes = await clientA.get('/jobs?workMode=Remote');
        recordTest('Jobs', 'GET /jobs (WorkMode Filter)', filterRes.status === 200 && Array.isArray(filterRes.data.jobs));
      } catch (e) {
        recordTest('Jobs', 'GET /jobs (Filter)', false, e.message);
      }

      // Get Job by ID
      try {
        const detailRes = await clientA.get(`/jobs/${testJobId}`);
        recordTest('Jobs', 'GET /jobs/:id (Job Details)', detailRes.status === 200 && !!detailRes.data.job);
      } catch (e) {
        recordTest('Jobs', 'GET /jobs/:id', false, e.message);
      }

      // Save Job
      try {
        const saveRes = await clientA.post(`/jobs/${testJobId}/save`);
        recordTest('Jobs', 'POST /jobs/:id/save (Bookmark Job)', (saveRes.status === 200 || saveRes.status === 201) && saveRes.data.success);
      } catch (e) {
        recordTest('Jobs', 'POST /jobs/:id/save', false, e.message);
      }

      // Check Saved Status
      try {
        const checkRes = await clientA.get(`/jobs/${testJobId}/saved`);
        recordTest('Jobs', 'GET /jobs/:id/saved (Check Saved Status)', checkRes.status === 200 && checkRes.data.saved === true);
      } catch (e) {
        recordTest('Jobs', 'GET /jobs/:id/saved', false, e.message);
      }

      // Unsave Job
      try {
        const unsaveRes = await clientA.delete(`/jobs/${testJobId}/save`);
        recordTest('Jobs', 'DELETE /jobs/:id/save (Unsave Job)', unsaveRes.status === 200 && unsaveRes.data.saved === false);
      } catch (e) {
        recordTest('Jobs', 'DELETE /jobs/:id/save', false, e.message);
      }
    }

    // -------------------------------------------------------------
    // SECTION 6 & 7: Application Tracker & Interview Linkage
    // -------------------------------------------------------------
    console.log('\n--- SECTION 6 & 7: APPLICATION TRACKER & INTERVIEW DATE/TIME ---');
    let testAppId = null;
    const appliedDate = new Date('2026-09-15T09:00:00.000Z');
    const scheduledInterviewDate = new Date('2026-10-25T15:30:00.000Z');

    // Create Application
    try {
      const createAppRes = await clientA.post('/applications', {
        company: 'Stripe',
        jobTitle: 'Senior Backend Engineer',
        status: 'Applied',
        appliedDate: appliedDate,
        location: 'San Francisco, CA',
        salaryMin: 180000,
        salaryMax: 220000,
        notes: 'Submitted via company portal'
      });
      testAppId = createAppRes.data.application?._id || createAppRes.data.application?.id;
      recordTest('Applications', 'POST /applications (Create Application)', createAppRes.status === 201 && !!testAppId);
    } catch (e) {
      recordTest('Applications', 'POST /applications', false, e.message);
    }

    // Update Status through lifecycle: Applied -> Screening -> Interview -> Offer
    try {
      await clientA.patch(`/applications/${testAppId}/status`, { status: 'Screening' });
      const statScreen = await clientA.get(`/applications/${testAppId}`);
      recordTest('Applications', 'PATCH /applications/:id/status (Move to Screening)', statScreen.data.application.status === 'Screening');

      await clientA.patch(`/applications/${testAppId}/status`, { status: 'Interview' });
      const statInterview = await clientA.get(`/applications/${testAppId}`);
      recordTest('Applications', 'PATCH /applications/:id/status (Move to Interview)', statInterview.data.application.status === 'Interview');
    } catch (e) {
      recordTest('Applications', 'Status Progression', false, e.message);
    }

    // Create Interview Document Linked to Application
    let interviewId = null;
    try {
      const intRes = await clientA.post('/interviews', {
        application: testAppId,
        company: 'Stripe',
        jobTitle: 'Senior Backend Engineer',
        interviewType: 'Technical',
        scheduledDate: scheduledInterviewDate,
        status: 'Upcoming',
        meetingUrl: 'https://meet.google.com/stripe-tech-call',
        location: 'Google Meet',
        notes: 'Prepare concurrency and database transaction isolation'
      });
      interviewId = intRes.data.interview?._id || intRes.data.interview?.id;
      recordTest('Interviews', 'POST /interviews (Create Interview Linked to Application)', intRes.status === 201 && !!interviewId);
    } catch (e) {
      recordTest('Interviews', 'POST /interviews', false, e.message);
    }

    // Verify GET /applications/:id returns interview with scheduledDate distinct from appliedDate
    try {
      const appDetailRes = await clientA.get(`/applications/${testAppId}`);
      const app = appDetailRes.data.application;
      const inv = app.interview;

      const hasScheduledDate = inv && new Date(inv.scheduledDate).toISOString() === scheduledInterviewDate.toISOString();
      const hasAppliedDate = new Date(app.appliedDate).toISOString() === appliedDate.toISOString();
      const distinctDates = hasScheduledDate && hasAppliedDate && (inv.scheduledDate !== app.appliedDate);

      recordTest(
        'Interview Date/Time',
        'Verification of scheduledDate on Application Details (appliedDate vs scheduledDate distinct)',
        distinctDates,
        `Applied: ${app.appliedDate} | Scheduled: ${inv?.scheduledDate}`
      );
    } catch (e) {
      recordTest('Interview Date/Time', 'Verification of scheduledDate', false, e.message);
    }

    // -------------------------------------------------------------
    // SECTION 8: Mock Interview Testing
    // -------------------------------------------------------------
    console.log('\n--- SECTION 8: MOCK INTERVIEW TESTING ---');
    let mockSessionId = null;
    try {
      // 1. Get Questions from Bank
      const qRes = await clientA.get('/interview-questions?limit=5');
      recordTest('Mock Interview', 'GET /interview-questions (Question Bank Load)', qRes.status === 200 && Array.isArray(qRes.data.questions));

      // 2. Create Mock Session
      const sessionRes = await clientA.post('/mock-interviews', {
        title: 'Stripe Distributed Systems Mock Session',
        company: 'Stripe',
        role: 'Senior Backend Engineer',
        questions: [
          {
            question: 'How do you handle idempotency in high-concurrency payment APIs?',
            category: 'Technical'
          }
        ]
      });
      mockSessionId = sessionRes.data.mockInterview?._id || sessionRes.data.mockInterview?.id;
      recordTest('Mock Interview', 'POST /mock-interviews (Create Session)', sessionRes.status === 201 && !!mockSessionId);

      // 3. Record Answer
      const ansRes = await clientA.patch(`/mock-interviews/${mockSessionId}/answer`, {
        questionIndex: 0,
        userAnswer: 'I generate unique idempotency keys stored in Redis with distributed locking and atomic database transaction commits.'
      });
      recordTest('Mock Interview', 'PATCH /mock-interviews/:id/answer (Save Candidate Answer)', ansRes.status === 200 && ansRes.data.success);

      // 4. Complete Session
      const compRes = await clientA.post(`/mock-interviews/${mockSessionId}/complete`, {
        overallScore: 92,
        feedback: 'Outstanding explanation of distributed locking and atomic database commits.'
      });
      recordTest('Mock Interview', 'POST /mock-interviews/:id/complete (Complete Session)', compRes.status === 200 && compRes.data.mockInterview.status === 'Completed');
    } catch (e) {
      recordTest('Mock Interview', 'Mock Interview Operations', false, e.message);
    }

    // -------------------------------------------------------------
    // SECTION 9: Community & Connections Testing (User A <-> User B)
    // -------------------------------------------------------------
    console.log('\n--- SECTION 9: COMMUNITY & CONNECTIONS TESTING ---');
    let connectionId = null;
    try {
      // 1. Explore People
      const peopleRes = await clientA.get('/people');
      recordTest('Community', 'GET /people (List Community Members)', peopleRes.status === 200 && Array.isArray(peopleRes.data.people));

      // 2. Send Connection Request from User A to User B
      const connSendRes = await clientA.post(`/people/${userBId}/connect`);
      recordTest('Community', 'POST /people/:id/connect (Send Connection Request)', connSendRes.status === 201 && connSendRes.data.success);

      // 3. User B receives pending request
      const bReqRes = await clientB.get('/people/requests');
      const receivedReq = bReqRes.data.requests?.find(r => r.person?.id === userAId || r.person?.userId === userAId);
      connectionId = receivedReq?.connectionId || bReqRes.data.requests?.[0]?.connectionId;
      recordTest('Community', 'GET /people/requests (User B Inbox Verification)', bReqRes.status === 200 && !!connectionId);

      // 4. User B accepts connection
      if (connectionId) {
        const acceptRes = await clientB.patch(`/people/requests/${connectionId}/accept`);
        recordTest('Community', 'PATCH /people/requests/:id/accept (Accept Request)', acceptRes.status === 200 && acceptRes.data.success);
      }

      // 5. Verify User A and User B both see each other in connections list
      const [aConnList, bConnList] = await Promise.all([
        clientA.get('/people/connections'),
        clientB.get('/people/connections')
      ]);
      const bothConnected = aConnList.data.connections.length >= 1 && bConnList.data.connections.length >= 1;
      recordTest('Community', 'GET /people/connections (Mutual Connection Confirmation)', bothConnected);
    } catch (e) {
      recordTest('Community', 'Community & Connection Operations', false, e.message);
    }

    // -------------------------------------------------------------
    // SECTION 10: Interview Experiences
    // -------------------------------------------------------------
    console.log('\n--- SECTION 10: INTERVIEW EXPERIENCES TESTING ---');
    let expId = null;
    try {
      const expCreateRes = await clientA.post('/interview-experiences', {
        companyName: 'Stripe',
        jobTitle: 'Senior Backend Engineer',
        experienceTitle: 'Stripe Systems & Architecture Round Experience',
        overallDifficulty: 'Hard',
        overallExperience: 'Challenging 5-round virtual onsite covering high-throughput distributed systems and data consistency.',
        rounds: [
          { roundName: 'System Architecture', description: 'Design an event sourcing ledger for multi-currency settlement.' }
        ],
        preparationTips: 'Study Martin Kleppmann Designing Data-Intensive Applications.'
      });
      expId = expCreateRes.data.data?._id || expCreateRes.data.data?.id;
      recordTest('Interview Experiences', 'POST /interview-experiences (Create Experience)', expCreateRes.status === 201 && !!expId);

      // Mark helpful by User B
      const helpfulRes = await clientB.post(`/interview-experiences/${expId}/helpful`);
      recordTest('Interview Experiences', 'POST /interview-experiences/:id/helpful (Vote Helpful)', helpfulRes.status === 200 && helpfulRes.data.helpfulCount >= 1);

      // Cross-user modification protection (User B cannot edit User A's experience)
      try {
        await clientB.put(`/interview-experiences/${expId}`, { experienceTitle: 'Hacked Title' });
        recordTest('Interview Experiences Authorization', 'User B modifying User A Experience (Protection)', false, 'Should return 403');
      } catch (e) {
        recordTest('Interview Experiences Authorization', 'User B modifying User A Experience (Protection)', e.response?.status === 403, `Status: ${e.response?.status}`);
      }
    } catch (e) {
      recordTest('Interview Experiences', 'Interview Experiences Operations', false, e.message);
    }

    // -------------------------------------------------------------
    // SECTION 11: Career Guidance Flow & Duplicate Prevention
    // -------------------------------------------------------------
    console.log('\n--- SECTION 11: CAREER GUIDANCE & DUPLICATE PREVENTION ---');
    let guidanceReqId = null;
    try {
      // 1. User A sends guidance request to User B
      const sendRes = await clientA.post('/guidance/requests', {
        mentorId: userBId,
        topic: 'Distributed Systems & Microservices Prep',
        message: 'Looking for advice on preparing for staff engineer system design interviews.',
        targetCompany: 'Stripe',
        targetRole: 'Senior Backend Engineer'
      });
      guidanceReqId = sendRes.data.data?._id || sendRes.data.data?.id;
      recordTest('Career Guidance', 'POST /guidance/requests (Send Guidance Request)', sendRes.status === 201 && !!guidanceReqId);

      // 2. Duplicate prevention test: sending another pending request to same mentor
      try {
        await clientA.post('/guidance/requests', {
          mentorId: userBId,
          topic: 'Duplicate Request',
          message: 'Second message'
        });
        recordTest('Career Guidance', 'Duplicate Pending Guidance Request Prevention', false, 'Should reject duplicate request');
      } catch (e) {
        const isDuplicateRejected = e.response?.status === 400 || e.response?.status === 409;
        recordTest('Career Guidance', 'Duplicate Pending Guidance Request Prevention', isDuplicateRejected, `Status: ${e.response?.status}`);
      }

      // 3. User B accepts guidance request
      const acceptRes = await clientB.patch(`/guidance/requests/${guidanceReqId}/accept`, {
        responseMessage: 'Glad to mentor you! Let us set up our first call.'
      });
      recordTest('Career Guidance', 'PATCH /guidance/requests/:id/accept (Accept Request)', acceptRes.status === 200 && acceptRes.data.data?.status === 'Accepted');
    } catch (e) {
      recordTest('Career Guidance', 'Career Guidance Operations', false, e.message);
    }

    // -------------------------------------------------------------
    // SECTION 12: Companies & Company Intelligence
    // -------------------------------------------------------------
    console.log('\n--- SECTION 12: COMPANIES & COMPANY INTELLIGENCE TESTING ---');
    try {
      const compRes = await clientA.get('/companies');
      recordTest('Companies', 'GET /companies (List Companies)', compRes.status === 200 && Array.isArray(compRes.data.data));

      const companiesList = compRes.data.data || [];
      if (companiesList.length >= 3) {
        // Open 3 distinct company profiles and verify unique content
        const [c1, c2, c3] = await Promise.all([
          clientA.get(`/companies/${companiesList[0]._id}`),
          clientA.get(`/companies/${companiesList[1]._id}`),
          clientA.get(`/companies/${companiesList[2]._id}`)
        ]);

        const distinctCompanies = c1.data.data.name !== c2.data.data.name && c2.data.data.name !== c3.data.data.name;
        recordTest(
          'Companies',
          'Verification of 3 Distinct Company Profile Details',
          distinctCompanies,
          `${c1.data.data.name}, ${c2.data.data.name}, ${c3.data.data.name}`
        );

        // Save company
        const saveCompRes = await clientA.post(`/companies/${companiesList[0]._id}/save`);
        recordTest('Companies', 'POST /companies/:id/save (Bookmark Company)', (saveCompRes.status === 200 || saveCompRes.status === 201) && saveCompRes.data.success);
      }
    } catch (e) {
      recordTest('Companies', 'Companies Operations', false, e.message);
    }

    // -------------------------------------------------------------
    // SECTION 13 & 14: Dashboard & Analytics APIs
    // -------------------------------------------------------------
    console.log('\n--- SECTION 13 & 14: DASHBOARD & ANALYTICS TESTING ---');
    try {
      const dashSummary = await clientA.get('/dashboard/summary');
      const d = dashSummary.data.data;
      const validDashboard = d && d.applications?.total >= 1 && d.resumes?.total >= 1 && d.careerReadinessScore > 0;
      recordTest('Dashboard', 'GET /dashboard/summary (Real Data Verification)', validDashboard, `Applications: ${d.applications?.total}, Readiness: ${d.careerReadinessScore}%`);

      const dashActivity = await clientA.get('/dashboard/activity');
      recordTest('Dashboard', 'GET /dashboard/activity (Event Stream)', dashActivity.status === 200 && Array.isArray(dashActivity.data.data));

      const analyticsRes = await clientA.get('/analytics/overview');
      const a = analyticsRes.data.data;
      recordTest('Analytics', 'GET /analytics/overview (Aggregated Analytics Data)', analyticsRes.status === 200 && !!a.summary);
    } catch (e) {
      recordTest('Dashboard & Analytics', 'Dashboard / Analytics Retrieval', false, e.message);
    }

    // -------------------------------------------------------------
    // SECTION 15: AI Career Intelligence API Suite
    // -------------------------------------------------------------
    console.log('\n--- SECTION 15: AI CAREER INTELLIGENCE COMPLETE SUITE ---');
    try {
      // 1. Resume Improve
      const aiImprove = await clientA.post('/ai/resume/improve', {
        content: 'Built backend APIs for processing payments and orders in express',
        section: 'experience'
      });
      recordTest('AI Career Intelligence', 'POST /ai/resume/improve', aiImprove.status === 200 && (!!aiImprove.data.data.suggested || !!aiImprove.data.data.improved));

      // 2. Job Analyze
      const aiJobAnalyze = await clientA.post('/ai/job/analyze', {
        jobDescription: 'Looking for a Senior Backend Engineer proficient in Node.js, TypeScript, PostgreSQL, and AWS ECS.'
      });
      recordTest('AI Career Intelligence', 'POST /ai/job/analyze', aiJobAnalyze.status === 200 && (Array.isArray(aiJobAnalyze.data.data.requiredSkills) || Array.isArray(aiJobAnalyze.data.data.coreSkills)));

      // 3. Job Match
      const aiJobMatch = await clientA.post('/ai/job/match', {
        resumeId: resumeAId,
        jobDescription: 'Senior Backend Engineer requiring Node.js, TypeScript, PostgreSQL, and Docker.'
      });
      recordTest('AI Career Intelligence', 'POST /ai/job/match', aiJobMatch.status === 200 && typeof aiJobMatch.data.data.matchScore === 'number');

      // 4. Career Skill Gap
      const aiSkillGap = await clientA.post('/ai/career/skill-gap', {
        targetRole: 'Staff Infrastructure Engineer'
      });
      recordTest('AI Career Intelligence', 'POST /ai/career/skill-gap', aiSkillGap.status === 200 && !!aiSkillGap.data.data.targetRole);

      // 5. Career Recommendations
      const aiRecommendations = await clientA.post('/ai/career/recommendations');
      recordTest('AI Career Intelligence', 'POST /ai/career/recommendations', aiRecommendations.status === 200 && (Array.isArray(aiRecommendations.data.data.recommendedRoles) || Array.isArray(aiRecommendations.data.data.recommendations)));

      // 6. Generate Interview Questions
      const aiGenQuestions = await clientA.post('/ai/interview/questions', {
        role: 'Senior Backend Engineer',
        topic: 'Distributed Transactions & 2PC'
      });
      recordTest('AI Career Intelligence', 'POST /ai/interview/questions', aiGenQuestions.status === 200 && Array.isArray(aiGenQuestions.data.data.questions));

      // 7. Evaluate Interview Feedback
      const aiFeedback = await clientA.post('/ai/interview/feedback', {
        question: 'How do you handle distributed locks in microservices?',
        answer: 'I use Redis Redlock algorithm with TTL and periodic heartbeat refresh to prevent deadlock.'
      });
      recordTest('AI Career Intelligence', 'POST /ai/interview/feedback', aiFeedback.status === 200 && typeof aiFeedback.data.data.score === 'number');
    } catch (e) {
      recordTest('AI Career Intelligence', 'AI Endpoints Execution', false, e.response?.data?.message || e.message);
    }

    // -------------------------------------------------------------
    // SECTION 16: Notifications & Reminder Idempotency Checks
    // -------------------------------------------------------------
    console.log('\n--- SECTION 16: NOTIFICATIONS & REMINDER IDEMPOTENCY ---');
    try {
      const notifRes = await clientA.get('/notifications');
      recordTest('Notifications', 'GET /notifications (List Notifications)', notifRes.status === 200 && Array.isArray(notifRes.data.data.notifications));

      const unreadCountRes = await clientA.get('/notifications/unread-count');
      recordTest('Notifications', 'GET /notifications/unread-count (Unread Counter)', unreadCountRes.status === 200 && typeof unreadCountRes.data.data.unreadCount === 'number');

      // Mark All Read
      const markAllRes = await clientA.patch('/notifications/read-all');
      recordTest('Notifications', 'PATCH /notifications/read-all (Mark All Read)', markAllRes.status === 200 && markAllRes.data.success);

      // Verify unread count is 0
      const countAfter = await clientA.get('/notifications/unread-count');
      recordTest('Notifications', 'Verify Unread Count is 0 After Read All', countAfter.data.data.unreadCount === 0);
    } catch (e) {
      recordTest('Notifications', 'Notification Operations', false, e.message);
    }

    // -------------------------------------------------------------
    // SECTION 17: Negative Testing & Boundary Validation
    // -------------------------------------------------------------
    console.log('\n--- SECTION 17: NEGATIVE TESTING & SECURITY BOUNDARIES ---');
    // 1. Invalid MongoDB ObjectId
    try {
      await clientA.get('/applications/invalid-object-id-12345');
      recordTest('Negative Testing', 'Invalid ObjectId Handling (404/400)', false, 'Should reject invalid ID');
    } catch (e) {
      recordTest('Negative Testing', 'Invalid ObjectId Handling (404/400)', e.response?.status === 404 || e.response?.status === 400, `Status: ${e.response?.status}`);
    }

    // 2. Invalid JWT Token
    try {
      await axios.get(`${BASE_URL}/applications`, { headers: { Authorization: 'Bearer invalid.jwt.token.here' } });
      recordTest('Negative Testing', 'Malformed JWT Token Rejection', false, 'Should return 401');
    } catch (e) {
      recordTest('Negative Testing', 'Malformed JWT Token Rejection', e.response?.status === 401, `Status: ${e.response?.status}`);
    }

    // 3. User B attempting to delete User A's application (Authorization)
    try {
      await clientB.delete(`/applications/${testAppId}`);
      recordTest('Authorization', 'Cross-User Application Deletion Blocked', false, 'Should return 404/403');
    } catch (e) {
      recordTest('Authorization', 'Cross-User Application Deletion Blocked', e.response?.status === 404 || e.response?.status === 403, `Status: ${e.response?.status}`);
    }

  } catch (err) {
    console.error('❌ QA Test Runner Global Error:', err);
  } finally {
    // -------------------------------------------------------------
    // SUMMARY REPORT GENERATION
    // -------------------------------------------------------------
    const total = results.length;
    const passedCount = results.filter(r => r.status === 'PASS').length;
    const failedCount = results.filter(r => r.status === 'FAIL').length;

    console.log('\n================================================================');
    console.log(`QA TEST SUMMARY: ${total} TESTS RUN | ${passedCount} PASSED | ${failedCount} FAILED`);
    console.log('================================================================\n');

    process.exit(failedCount > 0 ? 1 : 0);
  }
}

runQASuite();
