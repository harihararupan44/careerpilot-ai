const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function testResumeIntelligenceFlow() {
  console.log('====================================================');
  console.log('TESTING RESUME INTELLIGENCE AI DATA FLOW');
  console.log('====================================================\n');

  try {
    const timestamp = Date.now();
    const userEmail = `candidate_${timestamp}@example.com`;

    // 1. Register Candidate
    console.log('1. Registering Candidate...');
    const regRes = await axios.post(`${BASE_URL}/auth/register`, {
      name: 'Test Candidate',
      email: userEmail,
      password: 'Password123!',
      role: 'student'
    });
    const token = regRes.data.token;
    const client = axios.create({
      baseURL: BASE_URL,
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('   ✅ Registered successfully.\n');

    // 2. Create GOOD RESUME
    console.log('2. Creating GOOD RESUME in MongoDB...');
    const goodResumePayload = {
      title: 'Strong Backend Engineer Resume',
      summary: 'Senior Backend Engineer with 4+ years of experience building high-throughput microservices in Java and Spring Boot. Specialized in distributed caching, MySQL database optimization, and Docker containerization.',
      skills: ['Java', 'Spring Boot', 'MySQL', 'Docker', 'REST APIs', 'Git', 'Redis', 'Microservices'],
      experience: [
        {
          role: 'Backend Software Engineer',
          company: 'ScaleTech Solutions',
          startDate: '2023-01-01',
          endDate: '2026-05-01',
          description: 'Developed a high-throughput REST API using Spring Boot serving 10,000+ requests/day. Optimized MySQL queries and integrated Redis caching, reducing p99 response times by 42%.'
        }
      ],
      projects: [
        {
          title: 'Full-Stack Job Tracker Platform',
          description: 'Built a full-stack job tracking application with JWT authentication, Docker deployment, and MongoDB.',
          technologies: ['Java', 'Spring Boot', 'Docker', 'MySQL']
        }
      ],
      education: [
        {
          degree: 'Bachelor of Science in Computer Science',
          institution: 'State University',
          startYear: 2019,
          endYear: 2023
        }
      ]
    };

    const goodRes = await client.post('/resumes', goodResumePayload);
    const goodResumeId = goodRes.data.resume?._id || goodRes.data.resume?.id;
    console.log(`   ✅ Good Resume created with ID: ${goodResumeId}\n`);

    // 3. Create BAD RESUME
    console.log('3. Creating BAD RESUME in MongoDB...');
    const badResumePayload = {
      title: 'Deliberately Bad Resume',
      summary: 'I am looking for a job.',
      skills: ['Cooking', 'Cricket'],
      experience: [
        {
          role: 'Worker',
          company: 'Unknown',
          startDate: '2024-01-01',
          endDate: '2024-06-01',
          description: 'I worked on things.'
        }
      ],
      projects: [
        {
          title: 'Generic Project',
          description: 'Made a project.',
          technologies: []
        }
      ],
      education: []
    };

    const badRes = await client.post('/resumes', badResumePayload);
    const badResumeId = badRes.data.resume?._id || badRes.data.resume?.id;
    console.log(`   ✅ Bad Resume created with ID: ${badResumeId}\n`);

    // 4. TEST A: Analyze GOOD RESUME
    console.log('4. [TEST A] Analyzing GOOD RESUME (POST /api/ai/resume/analyze)...');
    const goodAnalysisRes = await client.post('/ai/resume/analyze', {
      resumeId: goodResumeId
    });
    const goodAnalysis = goodAnalysisRes.data.data;
    console.log('   --- GOOD RESUME ANALYSIS RESULT ---');
    console.log(`   Overall Score:    ${goodAnalysis.overallScore} / 100`);
    console.log(`   ATS Score:        ${goodAnalysis.atsScore} / 100`);
    console.log(`   Skills Score:     ${goodAnalysis.skillsScore} / 100`);
    console.log(`   Impact Score:     ${goodAnalysis.impactScore} / 100`);
    console.log(`   Formatting Score: ${goodAnalysis.formattingScore} / 100`);
    console.log(`   Summary:          "${goodAnalysis.summary}"`);
    console.log(`   Top Strengths:    ${JSON.stringify(goodAnalysis.strengths.map(s => s.title || s))}`);
    console.log(`   Missing Skills:   ${JSON.stringify(goodAnalysis.missingSkills)}\n`);

    // 5. TEST B: Analyze BAD RESUME
    console.log('5. [TEST B] Analyzing BAD RESUME (POST /api/ai/resume/analyze)...');
    const badAnalysisRes = await client.post('/ai/resume/analyze', {
      resumeId: badResumeId
    });
    const badAnalysis = badAnalysisRes.data.data;
    console.log('   --- BAD RESUME ANALYSIS RESULT ---');
    console.log(`   Overall Score:    ${badAnalysis.overallScore} / 100`);
    console.log(`   ATS Score:        ${badAnalysis.atsScore} / 100`);
    console.log(`   Skills Score:     ${badAnalysis.skillsScore} / 100`);
    console.log(`   Impact Score:     ${badAnalysis.impactScore} / 100`);
    console.log(`   Formatting Score: ${badAnalysis.formattingScore} / 100`);
    console.log(`   Summary:          "${badAnalysis.summary}"`);
    console.log(`   Top Weaknesses:   ${JSON.stringify(badAnalysis.weaknesses.map(w => w.title || w))}`);
    console.log(`   Missing Skills:   ${JSON.stringify(badAnalysis.missingSkills)}\n`);

    // 6. TEST C: Switch back and re-analyze GOOD RESUME
    console.log('6. [TEST C] Re-analyzing GOOD RESUME to verify state isolation...');
    const goodAnalysisRes2 = await client.post('/ai/resume/analyze', {
      resumeId: goodResumeId
    });
    const goodAnalysis2 = goodAnalysisRes2.data.data;
    console.log(`   Re-analyzed Good Resume Score: ${goodAnalysis2.overallScore} / 100\n`);

    // 7. Verify Differences
    console.log('7. Verifying Differences between Good Resume and Bad Resume:');
    if (goodAnalysis.overallScore >= 75 && badAnalysis.overallScore <= 45) {
      console.log(`   ✅ Score Difference Verified: Good=${goodAnalysis.overallScore}, Bad=${badAnalysis.overallScore} (Delta: ${goodAnalysis.overallScore - badAnalysis.overallScore} pts)`);
    } else {
      console.error(`   ❌ Scores too close: Good=${goodAnalysis.overallScore}, Bad=${badAnalysis.overallScore}`);
      process.exit(1);
    }

    if (goodAnalysis.skillsScore !== badAnalysis.skillsScore) {
      console.log(`   ✅ Skills Score Difference Verified: Good=${goodAnalysis.skillsScore}, Bad=${badAnalysis.skillsScore}`);
    } else {
      console.error('   ❌ Skills scores are identical');
      process.exit(1);
    }

    if (goodAnalysis.impactScore !== badAnalysis.impactScore) {
      console.log(`   ✅ Impact Score Difference Verified: Good=${goodAnalysis.impactScore}, Bad=${badAnalysis.impactScore}`);
    } else {
      console.error('   ❌ Impact scores are identical');
      process.exit(1);
    }

    console.log('\n====================================================');
    console.log('🎉 ALL RESUME INTELLIGENCE FLOW VERIFICATIONS PASSED!');
    console.log('====================================================\n');
  } catch (err) {
    console.error('Test error:', err.message);
    if (err.response?.data) console.error('Response data:', err.response.data);
    process.exit(1);
  }
}

testResumeIntelligenceFlow();
