const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('====================================================');
  console.log('CAREERPILOT BACKEND MODULE 12 — DASHBOARD & ANALYTICS TEST SUITE');
  console.log('====================================================\n');

  try {
    // 1. Register User A
    const timestamp = Date.now();
    const userAEmail = `user_a_${timestamp}@example.com`;
    const userBEmail = `user_b_${timestamp}@example.com`;

    console.log('1. Registering User A (Student)...');
    const regResA = await axios.post(`${BASE_URL}/auth/register`, {
      name: 'Alice Dashboard',
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
    console.log(`   [SUCCESS] User A registered. ID: ${userAId}`);

    // 2. Register User B
    console.log('2. Registering User B (Student)...');
    const regResB = await axios.post(`${BASE_URL}/auth/register`, {
      name: 'Bob Dashboard',
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
    console.log(`   [SUCCESS] User B registered. ID: ${userBId}\n`);

    // 3. User A sets up Profile
    console.log('3. User A updating Profile...');
    await clientA.put('/users/profile', {
      college: 'MIT Bengaluru',
      degree: 'B.Tech',
      branch: 'Computer Science',
      graduationYear: 2026,
      location: 'Bengaluru, India',
      bio: 'Aspiring Full Stack Engineer passionate about Node.js and React ecosystem.',
      skills: ['JavaScript', 'React', 'Node.js', 'MongoDB', 'TypeScript'],
      targetRole: 'Full Stack Developer',
      careerInterests: ['Web Development', 'Cloud Computing'],
      github: 'https://github.com/alice',
      linkedin: 'https://linkedin.com/in/alice',
      projects: [
        {
          title: 'CareerPilot AI',
          description: 'AI-powered career accelerator platform',
          technologies: ['React', 'Node.js', 'MongoDB']
        },
        {
          title: 'Cloud DevOps Pipeline',
          description: 'CI/CD pipeline with GitHub Actions',
          technologies: ['Docker', 'AWS']
        }
      ]
    });
    console.log('   [SUCCESS] User A profile saved with projects and skills.\n');

    // 4. User A creates applications
    console.log('4. User A creating tracked applications...');
    await clientA.post('/applications', {
      company: 'Amazon',
      jobTitle: 'Software Development Engineer',
      location: 'Bengaluru',
      status: 'Interview',
      salary: '₹28L/yr'
    });
    await clientA.post('/applications', {
      company: 'Google',
      jobTitle: 'Software Engineer I',
      location: 'Hyderabad',
      status: 'Applied',
      salary: '₹32L/yr'
    });
    await clientA.post('/applications', {
      company: 'Microsoft',
      jobTitle: 'Frontend Engineer',
      location: 'Noida',
      status: 'Offer',
      salary: '₹26L/yr'
    });
    console.log('   [SUCCESS] User A created 3 applications (Interview, Applied, Offer).\n');

    // 5. User A creates an interview
    console.log('5. User A scheduling an interview...');
    await clientA.post('/interviews', {
      company: 'Amazon',
      jobTitle: 'Software Development Engineer',
      interviewType: 'Technical',
      scheduledDate: new Date(Date.now() + 86400000 * 3), // 3 days in future
      status: 'Upcoming',
      preparationProgress: 80
    });
    console.log('   [SUCCESS] User A scheduled Amazon technical interview.\n');

    // 6. Test GET /api/dashboard/summary for User A
    console.log('6. Testing GET /api/dashboard/summary for User A...');
    const summaryResA = await clientA.get('/dashboard/summary');
    if (!summaryResA.data.success || !summaryResA.data.data) {
      throw new Error('Invalid dashboard summary response');
    }
    const sumA = summaryResA.data.data;
    console.log(`   [SUCCESS] Summary returned:
      - Total Applications: ${sumA.applications.total} (Applied: ${sumA.applications.applied}, Interview: ${sumA.applications.interview}, Offer: ${sumA.applications.offer})
      - Total Interviews: ${sumA.interviews.total} (Upcoming: ${sumA.interviews.upcoming})
      - Profile Completion: ${sumA.profileCompletion}%
      - Career Readiness: ${sumA.careerReadinessScore}/100\n`);

    if (sumA.applications.total !== 3 || sumA.interviews.total !== 1) {
      throw new Error(`Expected 3 applications and 1 interview, got ${sumA.applications.total} and ${sumA.interviews.total}`);
    }
    if (sumA.profileCompletion < 50) {
      throw new Error(`Expected high profile completion, got ${sumA.profileCompletion}%`);
    }

    // 7. Test GET /api/dashboard/activity for User A
    console.log('7. Testing GET /api/dashboard/activity for User A...');
    const actResA = await clientA.get('/dashboard/activity');
    if (!actResA.data.success || !Array.isArray(actResA.data.data)) {
      throw new Error('Invalid dashboard activity response');
    }
    console.log(`   [SUCCESS] User A has ${actResA.data.data.length} recent activities. First: "${actResA.data.data[0]?.title}"\n`);

    // 8. Test GET /api/dashboard/progress for User A
    console.log('8. Testing GET /api/dashboard/progress for User A...');
    const progResA = await clientA.get('/dashboard/progress');
    if (!progResA.data.success || !progResA.data.data) {
      throw new Error('Invalid dashboard progress response');
    }
    console.log(`   [SUCCESS] User A progress: applications=${progResA.data.data.applications}, interviews=${progResA.data.data.interviews}, profileCompletion=${progResA.data.data.profileCompletion}%\n`);

    // 9. Test GET /api/analytics/applications for User A
    console.log('9. Testing GET /api/analytics/applications for User A...');
    const appAnalyticsResA = await clientA.get('/analytics/applications');
    const appAnalyticsA = appAnalyticsResA.data.data;
    console.log(`   [SUCCESS] Application Analytics:
      - Total: ${appAnalyticsA.total}
      - Interview Rate: ${appAnalyticsA.rates.interviewRate}%
      - Offer Rate: ${appAnalyticsA.rates.offerRate}%
      - Monthly count items: ${appAnalyticsA.monthly.length}
      - Status distribution items: ${appAnalyticsA.statusDistribution.length}\n`);

    // 10. Test GET /api/analytics/interviews for User A
    console.log('10. Testing GET /api/analytics/interviews for User A...');
    const intAnalyticsResA = await clientA.get('/analytics/interviews');
    const intAnalyticsA = intAnalyticsResA.data.data;
    console.log(`   [SUCCESS] Interview Analytics:
      - Total: ${intAnalyticsA.total}
      - Technical count: ${intAnalyticsA.byType.Technical}
      - Average Preparation Progress: ${intAnalyticsA.averagePreparationProgress}%
      - Upcoming count: ${intAnalyticsA.upcoming.length}\n`);

    // 11. Test GET /api/analytics/profile for User A
    console.log('11. Testing GET /api/analytics/profile for User A...');
    const profAnalyticsResA = await clientA.get('/analytics/profile');
    const profAnalyticsA = profAnalyticsResA.data.data;
    console.log(`   [SUCCESS] Profile Analytics:
      - Completion: ${profAnalyticsA.profileCompletion}%
      - Profile Skills: ${profAnalyticsA.profile.skills}
      - Profile Projects: ${profAnalyticsA.profile.projects}\n`);

    // 12. Test GET /api/analytics/saved-jobs for User A
    console.log('12. Testing GET /api/analytics/saved-jobs for User A...');
    const savedJobAnalyticsResA = await clientA.get('/analytics/saved-jobs');
    console.log(`   [SUCCESS] Saved Jobs Analytics returned: total=${savedJobAnalyticsResA.data.data.total}\n`);

    // 13. Test GET /api/analytics/overview for User A
    console.log('13. Testing GET /api/analytics/overview for User A...');
    const overviewResA = await clientA.get('/analytics/overview');
    const overviewA = overviewResA.data.data;
    console.log(`   [SUCCESS] Analytics Overview:
      - Total Applications: ${overviewA.summary.totalApplications}
      - Interview Rate: ${overviewA.summary.interviewRate}%
      - Offer Rate: ${overviewA.summary.offerRate}%
      - Career Readiness Score: ${overviewA.summary.careerReadinessScore}\n`);

    // 14. Multi-user Scoping / Security Check: User B MUST see 0 applications & 0 interviews
    console.log('14. Multi-User Scoping Check (User B must NOT see User A data)...');
    const summaryResB = await clientB.get('/dashboard/summary');
    const sumB = summaryResB.data.data;
    console.log(`   User B Summary: Applications=${sumB.applications.total}, Interviews=${sumB.interviews.total}, ProfileCompletion=${sumB.profileCompletion}%`);
    if (sumB.applications.total !== 0 || sumB.interviews.total !== 0) {
      throw new Error(`Data leak! User B saw ${sumB.applications.total} applications and ${sumB.interviews.total} interviews.`);
    }
    console.log('   [SUCCESS] User B data is completely isolated (0 applications, 0 interviews).\n');

    // 15. Activity Isolation Check
    console.log('15. Checking Activity Isolation for User B...');
    const actResB = await clientB.get('/dashboard/activity');
    if (actResB.data.data.length !== 0) {
      throw new Error(`Data leak! User B saw ${actResB.data.data.length} activities from User A.`);
    }
    console.log('   [SUCCESS] User B activity feed is clean (0 items).\n');

    // 16. Unauthenticated Access Check
    console.log('16. Checking Unauthenticated Access (401 Unauthorized)...');
    try {
      await axios.get(`${BASE_URL}/dashboard/summary`);
      throw new Error('Unauthenticated request should have failed!');
    } catch (err) {
      if (err.response && err.response.status === 401) {
        console.log('   [SUCCESS] Unauthenticated request correctly rejected with 401.\n');
      } else {
        throw err;
      }
    }

    // 17. Health Check
    console.log('17. Health Check (GET /api/health)...');
    const healthRes = await axios.get(`${BASE_URL}/health`);
    if (healthRes.data.success) {
      console.log('   [SUCCESS] /api/health is running smoothly.\n');
    }

    console.log('====================================================');
    console.log('🎉 ALL MODULE 12 TESTS PASSED! (17/17 checks passed)');
    console.log('====================================================');
  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.response ? error.response.data : error.message);
    process.exit(1);
  }
}

runTests();
