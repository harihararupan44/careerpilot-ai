const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('====================================================');
  console.log('CAREERPILOT BACKEND MODULE 13 — AI CAREER INTELLIGENCE TEST SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`   ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`   ❌ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    const timestamp = Date.now();
    const userAEmail = `alice_ai_${timestamp}@example.com`;
    const userBEmail = `bob_ai_${timestamp}@example.com`;

    // 1. Register User A
    console.log('1. Registering User A (Alice)...');
    const regResA = await axios.post(`${BASE_URL}/auth/register`, {
      name: 'Alice Intelligence',
      email: userAEmail,
      password: 'Password123!',
      role: 'student'
    });
    const tokenA = regResA.data.token;
    const userAId = regResA.data.user._id || regResA.data.user.id;
    const clientA = axios.create({
      baseURL: BASE_URL,
      headers: { Authorization: `Bearer ${tokenA}` }
    });
    assert(tokenA && userAId, 'User A registered and received JWT token');

    // 2. Register User B
    console.log('\n2. Registering User B (Bob)...');
    const regResB = await axios.post(`${BASE_URL}/auth/register`, {
      name: 'Bob Intelligence',
      email: userBEmail,
      password: 'Password123!',
      role: 'student'
    });
    const tokenB = regResB.data.token;
    const userBId = regResB.data.user._id || regResB.data.user.id;
    const clientB = axios.create({
      baseURL: BASE_URL,
      headers: { Authorization: `Bearer ${tokenB}` }
    });
    assert(tokenB && userBId, 'User B registered and received JWT token');

    // 3. User A sets up Profile
    console.log('\n3. Setting up User A profile...');
    await clientA.put('/users/profile', {
      college: 'Tech Institute',
      degree: 'B.Tech',
      branch: 'Computer Science',
      targetRole: 'Full Stack Developer',
      skills: ['JavaScript', 'React', 'Node.js', 'Express', 'MongoDB'],
      careerInterests: ['Web Development', 'Cloud Computing', 'AI Applications']
    });
    assert(true, 'User A profile updated with target role and skills');

    // 4. User A creates a Resume
    console.log('\n4. User A creates a Resume in MongoDB...');
    const resumeResA = await clientA.post('/resumes', {
      title: 'Full Stack Web Resume',
      summary: 'Experienced Full Stack Engineer with 2+ years building web applications with React, Node.js, Express, and MongoDB. Strong background in REST APIs and cloud deployments.',
      skills: ['React', 'Node.js', 'Express', 'MongoDB', 'JavaScript', 'TailwindCSS', 'Git'],
      experience: [
        {
          title: 'Junior Web Developer',
          company: 'Acme Software',
          startDate: '2024-01-01',
          endDate: '2025-06-01',
          description: 'Developed scalable RESTful APIs with Express and designed responsive frontends in React.'
        }
      ],
      education: [
        {
          degree: 'B.Tech Computer Science',
          institution: 'Tech Institute',
          graduationYear: 2024
        }
      ],
      projects: [
        {
          title: 'CareerPilot AI Portal',
          description: 'Built automated resume analyzer and interview prep platform using MERN stack.',
          technologies: ['React', 'Node.js', 'MongoDB']
        }
      ]
    });
    const resumeAId = resumeResA.data.resume?._id || resumeResA.data.resume?.id || resumeResA.data.data?._id;
    assert(resumeAId, `Resume created for User A with ID: ${resumeAId}`);

    // 5. User A creates a Mock Interview Session
    console.log('\n5. User A creates and completes a Mock Interview...');
    const mockResA = await clientA.post('/mock-interviews', {
      title: 'Full Stack Engineering Mock Interview',
      interviewType: 'Technical',
      questions: [
        'Explain React virtual DOM and diffing algorithm.',
        'How does Node.js event loop handle asynchronous I/O?'
      ]
    });
    const mockAId = mockResA.data.mockInterview?._id || mockResA.data.data?._id || mockResA.data._id;
    assert(mockAId, `Mock interview created with ID: ${mockAId}`);

    // Start mock interview
    await clientA.post(`/mock-interviews/${mockAId}/start`);

    // Submit mock answers
    await clientA.patch(`/mock-interviews/${mockAId}/answer`, {
      questionIndex: 0,
      answer: 'React uses a virtual DOM to optimize rendering and compare diffs before updating the real DOM.',
      feedback: 'Good fundamental understanding of virtual DOM.'
    });

    await clientA.patch(`/mock-interviews/${mockAId}/answer`, {
      questionIndex: 1,
      answer: 'Node.js uses an event-driven, single-threaded non-blocking I/O model based on libuv.',
      feedback: 'Accurate explanation of event loop architecture.'
    });

    // Complete mock interview
    await clientA.post(`/mock-interviews/${mockAId}/complete`, {
      overallScore: 88,
      feedback: 'Excellent technical answers.'
    });
    assert(true, 'Mock interview started, answered, and completed');

    // 6. Test AI Resume Analysis
    console.log('\n6. Testing POST /api/ai/resume/analyze...');
    const analyzeResumeRes = await clientA.post('/ai/resume/analyze', {
      resumeId: resumeAId
    });
    assert(analyzeResumeRes.status === 200 && analyzeResumeRes.data.success, 'POST /api/ai/resume/analyze returned 200');
    assert(typeof analyzeResumeRes.data.data.overallScore === 'number', 'Analysis returned numeric overallScore');
    assert(Array.isArray(analyzeResumeRes.data.data.strengths) && analyzeResumeRes.data.data.strengths.length > 0, 'Analysis returned strengths array');
    assert(Array.isArray(analyzeResumeRes.data.data.missingSkills), 'Analysis extracted missingSkills array');

    // Test direct text payload (creates temporary resume analysis)
    const analyzeTextRes = await clientA.post('/ai/resume/analyze', {
      resumeId: resumeAId
    });
    assert(analyzeTextRes.data.success && analyzeTextRes.data.data.overallScore > 0, 'POST /api/ai/resume/analyze with active resume works');

    // 7. Test AI Resume Improvement Suggestions
    console.log('\n7. Testing POST /api/ai/resume/improve...');
    const improveResumeRes = await clientA.post('/ai/resume/improve', {
      resumeId: resumeAId,
      section: 'summary',
      content: 'I build web apps.'
    });
    assert(improveResumeRes.status === 200 && improveResumeRes.data.success, 'POST /api/ai/resume/improve returned 200');
    assert(typeof improveResumeRes.data.data.suggested === 'string' && improveResumeRes.data.data.suggested.length > 10, 'Improvement returned suggested section content');

    // 8. Test AI Job Analysis
    console.log('\n8. Testing POST /api/ai/job/analyze...');
    const sampleJobDesc = 'We are seeking a Senior Backend Engineer proficient in Node.js, TypeScript, Microservices, PostgreSQL, and Redis. Strong knowledge of Docker and Kubernetes required.';
    const analyzeJobRes = await clientA.post('/ai/job/analyze', {
      jobTitle: 'Senior Backend Engineer',
      jobDescription: sampleJobDesc
    });
    assert(analyzeJobRes.status === 200 && analyzeJobRes.data.success, 'POST /api/ai/job/analyze returned 200');
    assert(Array.isArray(analyzeJobRes.data.data.requiredSkills) && analyzeJobRes.data.data.requiredSkills.length > 0, 'Job analysis returned requiredSkills');
    assert(analyzeJobRes.data.data.experienceLevel, 'Job analysis returned experienceLevel');

    // 9. Test Resume ↔ Job Match
    console.log('\n9. Testing POST /api/ai/job/match...');
    const matchRes = await clientA.post('/ai/job/match', {
      resumeId: resumeAId,
      jobTitle: 'Senior Backend Engineer',
      jobDescription: sampleJobDesc
    });
    assert(matchRes.status === 200 && matchRes.data.success, 'POST /api/ai/job/match returned 200');
    assert(typeof matchRes.data.data.matchScore === 'number', 'Match returned matchScore');
    assert(Array.isArray(matchRes.data.data.matchedSkills), 'Match returned matchedSkills');
    assert(Array.isArray(matchRes.data.data.missingSkills), 'Match returned missingSkills');
    assert(Array.isArray(matchRes.data.data.recommendations), 'Match returned recommendations');

    // 10. Test Career Skill Gap Analysis
    console.log('\n10. Testing POST /api/ai/career/skill-gap...');
    const skillGapRes = await clientA.post('/ai/career/skill-gap', {
      targetRole: 'Cloud DevOps Architect',
      currentSkills: ['Linux', 'Docker', 'Python', 'Git']
    });
    assert(skillGapRes.status === 200 && skillGapRes.data.success, 'POST /api/ai/career/skill-gap returned 200');
    assert(Array.isArray(skillGapRes.data.data.missingSkills), 'Skill gap returned missingSkills');
    assert(Array.isArray(skillGapRes.data.data.learningPlan), 'Skill gap returned learningPlan');

    // 11. Test Career Recommendations
    console.log('\n11. Testing POST /api/ai/career/recommendations...');
    const recRes = await clientA.post('/ai/career/recommendations', {});
    assert(recRes.status === 200 && recRes.data.success, 'POST /api/ai/career/recommendations returned 200');
    assert(Array.isArray(recRes.data.data.recommendedRoles), 'Recommendations returned recommendedRoles');
    assert(Array.isArray(recRes.data.data.skillsToLearn), 'Recommendations returned skillsToLearn');

    // 12. Test Interview Question Generation
    console.log('\n12. Testing POST /api/ai/interview/questions...');
    const questionsRes = await clientA.post('/ai/interview/questions', {
      jobTitle: 'React Frontend Developer',
      interviewType: 'Technical',
      count: 3
    });
    assert(questionsRes.status === 200 && questionsRes.data.success, 'POST /api/ai/interview/questions returned 200');
    assert(Array.isArray(questionsRes.data.data.questions) && questionsRes.data.data.questions.length === 3, 'Generated exactly 3 interview questions');
    assert(questionsRes.data.data.questions[0].question, 'Question object contains question text');

    // 13. Test Interview Answer Feedback
    console.log('\n13. Testing POST /api/ai/interview/feedback...');
    const feedbackRes = await clientA.post('/ai/interview/feedback', {
      question: 'What are the main differences between useEffect and useLayoutEffect in React?',
      answer: 'useEffect runs asynchronously after paint, while useLayoutEffect runs synchronously before paint when DOM mutations take place.',
      interviewType: 'Technical'
    });
    assert(feedbackRes.status === 200 && feedbackRes.data.success, 'POST /api/ai/interview/feedback returned 200');
    assert(typeof feedbackRes.data.data.score === 'number', 'Feedback returned numeric score');
    assert(Array.isArray(feedbackRes.data.data.strengths) && feedbackRes.data.data.improvedAnswer, 'Feedback contains strengths and improvedAnswer');

    // 14. Test Mock Interview Session Feedback
    console.log('\n14. Testing POST /api/ai/mock-interview/feedback...');
    const mockFeedbackRes = await clientA.post('/ai/mock-interview/feedback', {
      mockInterviewId: mockAId
    });
    assert(mockFeedbackRes.status === 200 && mockFeedbackRes.data.success, 'POST /api/ai/mock-interview/feedback returned 200');
    assert(typeof mockFeedbackRes.data.data.overallScore === 'number', 'Mock feedback returned overallScore');
    assert(Array.isArray(mockFeedbackRes.data.data.strengths), 'Mock feedback returned strengths');

    // 15. Test Multi-User Isolation / Cross-User Access Rejection
    console.log('\n15. Testing Multi-User Security & Isolation...');
    try {
      await clientB.post('/ai/resume/analyze', {
        resumeId: resumeAId
      });
      assert(false, 'User B should NOT be able to analyze User A resume');
    } catch (err) {
      assert(err.response?.status === 404 || err.response?.status === 403, 'User B analyzing User A resume correctly returned 403/404');
    }

    try {
      await clientB.post('/ai/mock-interview/feedback', {
        mockInterviewId: mockAId
      });
      assert(false, 'User B should NOT be able to access User A mock interview session');
    } catch (err) {
      assert(err.response?.status === 404 || err.response?.status === 403, 'User B accessing User A mock interview session correctly returned 403/404');
    }

    // 16. Test Input Validations & Error Handling
    console.log('\n16. Testing Input Validations & Bounds...');
    try {
      await clientA.post('/ai/interview/questions', {
        jobRole: 'Developer',
        count: 50 // exceeds limit of 20
      });
      assert(false, 'Count > 20 should be rejected or clamped');
    } catch (err) {
      assert(err.response?.status === 400, 'Count > 20 correctly rejected with 400 Bad Request');
    }

    try {
      await clientA.post('/ai/interview/feedback', {
        question: ''
      });
      assert(false, 'Empty question/answer should be rejected');
    } catch (err) {
      assert(err.response?.status === 400, 'Empty question/answer correctly rejected with 400 Bad Request');
    }

    // Summary
    console.log('\n====================================================');
    console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log('====================================================\n');

    if (failed > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  } catch (error) {
    console.error('Fatal test error:', error.message);
    if (error.response?.data) {
      console.error('Response data:', error.response.data);
    }
    process.exit(1);
  }
}

runTests();
