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
  console.log('RUNNING CAREERPILOT BACKEND MODULE 6 VERIFICATION');
  console.log('====================================================\n');

  const timestamp = Date.now();
  const userAEmail = `app_student_a_${timestamp}@careerpilot.test`;
  const userBEmail = `app_student_b_${timestamp}@careerpilot.test`;
  const password = 'Password@123';

  let tokenA = '';
  let tokenB = '';
  let resumeAId = '';
  let jobAId = '';
  let appA1Id = '';
  let appA2Id = '';
  let appA3Id = '';

  try {
    // 1. Register User A
    console.log('1. Registering Test User A...');
    const regResA = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/auth/register',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      },
      {
        name: 'Applicant Alice',
        email: userAEmail,
        password
      }
    );

    if (regResA.status !== 201 || !regResA.body.token) {
      throw new Error(`Failed to register User A: ${JSON.stringify(regResA.body)}`);
    }
    tokenA = regResA.body.token;
    console.log('   [SUCCESS] User A registered successfully.');

    // 2. Register User B
    console.log('2. Registering Test User B...');
    const regResB = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/auth/register',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      },
      {
        name: 'Applicant Bob',
        email: userBEmail,
        password
      }
    );

    if (regResB.status !== 201 || !regResB.body.token) {
      throw new Error(`Failed to register User B: ${JSON.stringify(regResB.body)}`);
    }
    tokenB = regResB.body.token;
    console.log('   [SUCCESS] User B registered successfully.');

    // 3. User A creates a resume
    console.log('3. User A creates a resume for linking...');
    const resumeRes = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/resumes',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokenA}`
        }
      },
      {
        title: 'Full Stack Engineer Resume',
        targetRole: 'Full Stack Developer',
        summary: 'Experienced JavaScript and Node.js developer.',
        skills: ['React', 'Node.js', 'MongoDB', 'Express', 'Tailwind CSS']
      }
    );
    if (resumeRes.status === 201 && resumeRes.body.resume) {
      resumeAId = resumeRes.body.resume.id || resumeRes.body.resume._id;
      console.log(`   [SUCCESS] Resume created with ID: ${resumeAId}`);
    }

    // 4. User A gets a job from the database to link
    console.log('4. Fetching an existing job to link to application...');
    const jobsRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/jobs?limit=1',
      method: 'GET',
      headers: { Authorization: `Bearer ${tokenA}` }
    });
    if (jobsRes.body.jobs && jobsRes.body.jobs.length > 0) {
      jobAId = jobsRes.body.jobs[0].id || jobsRes.body.jobs[0]._id;
      console.log(`   [SUCCESS] Found job with ID: ${jobAId} (${jobsRes.body.jobs[0].title})`);
    }

    // 5. User A creates Application 1 (with resume & job link)
    console.log('5. User A creates Application 1 (Google - SDE)...');
    const createRes1 = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/applications',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokenA}`
        }
      },
      {
        company: 'Google',
        jobTitle: 'Software Development Engineer',
        location: 'Bengaluru, India',
        workMode: 'Hybrid',
        status: 'Applied',
        salaryMin: 2400000,
        salaryMax: 3200000,
        notes: 'Submitted referral application through alumni network.',
        deadline: new Date(Date.now() + 14 * 86400000).toISOString(),
        job: jobAId || undefined,
        resume: resumeAId || undefined,
        applicationUrl: 'https://careers.google.com/jobs/results/12345'
      }
    );

    if (createRes1.status !== 201 || !createRes1.body.application) {
      throw new Error(`Failed to create application 1: ${JSON.stringify(createRes1.body)}`);
    }
    appA1Id = createRes1.body.application.id || createRes1.body.application._id;
    console.log(`   [SUCCESS] Application 1 created with ID: ${appA1Id}`);

    // 6. User A creates Application 2 (Microsoft - Offer)
    console.log('6. User A creates Application 2 (Microsoft - Offer)...');
    const createRes2 = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/applications',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokenA}`
        }
      },
      {
        company: 'Microsoft',
        jobTitle: 'Frontend Engineer',
        location: 'Hyderabad, India',
        workMode: 'On-site',
        status: 'Offer',
        salaryMin: 2000000,
        salaryMax: 2600000,
        notes: 'Received official offer letter after 4 rounds.'
      }
    );
    if (createRes2.status !== 201) throw new Error(`Failed to create app 2: ${JSON.stringify(createRes2.body)}`);
    appA2Id = createRes2.body.application.id || createRes2.body.application._id;
    console.log(`   [SUCCESS] Application 2 created with ID: ${appA2Id}`);

    // 7. User A creates Application 3 (Amazon - Screening)
    console.log('7. User A creates Application 3 (Amazon - Screening)...');
    const createRes3 = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/applications',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokenA}`
        }
      },
      {
        company: 'Amazon',
        jobTitle: 'Backend Engineer',
        location: 'Bengaluru, India',
        workMode: 'Remote',
        status: 'Screening',
        salaryMin: 2200000,
        salaryMax: 2800000,
        notes: 'Online assessment completed.'
      }
    );
    if (createRes3.status !== 201) throw new Error(`Failed to create app 3: ${JSON.stringify(createRes3.body)}`);
    appA3Id = createRes3.body.application.id || createRes3.body.application._id;
    console.log(`   [SUCCESS] Application 3 created with ID: ${appA3Id}`);

    // 8. User A queries all applications
    console.log('8. User A gets applications list (filters & pagination)...');
    const getAppsRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/applications?sort=latest&limit=10',
      method: 'GET',
      headers: { Authorization: `Bearer ${tokenA}` }
    });

    if (getAppsRes.status !== 200 || (getAppsRes.body.pagination && getAppsRes.body.pagination.total < 3)) {
      throw new Error(`Failed to get applications: ${JSON.stringify(getAppsRes.body)}`);
    }
    console.log(`   [SUCCESS] Fetched ${getAppsRes.body.applications.length} applications for User A.`);

    // 9. User A searches for "Google"
    console.log('9. User A searches applications with query "Google"...');
    const searchRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/applications?search=Google',
      method: 'GET',
      headers: { Authorization: `Bearer ${tokenA}` }
    });

    if (searchRes.body.applications.length !== 1 || searchRes.body.applications[0].company !== 'Google') {
      throw new Error(`Search failed: expected 1 Google result, got ${JSON.stringify(searchRes.body)}`);
    }
    console.log('   [SUCCESS] Search returned expected application.');

    // 10. User A filters by status "Offer"
    console.log('10. User A filters applications by status "Offer"...');
    const filterRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/applications?status=Offer',
      method: 'GET',
      headers: { Authorization: `Bearer ${tokenA}` }
    });

    if (filterRes.body.applications.length !== 1 || filterRes.body.applications[0].company !== 'Microsoft') {
      throw new Error(`Filter failed: expected 1 Microsoft offer, got ${JSON.stringify(filterRes.body)}`);
    }
    console.log('   [SUCCESS] Filter returned expected application.');

    // 11. User A gets single application by ID
    console.log('11. User A gets single application by ID...');
    const singleRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: `/api/applications/${appA1Id}`,
      method: 'GET',
      headers: { Authorization: `Bearer ${tokenA}` }
    });

    if (singleRes.status !== 200 || singleRes.body.application.company !== 'Google') {
      throw new Error(`Failed to get single application: ${JSON.stringify(singleRes.body)}`);
    }
    console.log(`   [SUCCESS] Retrieved application: ${singleRes.body.application.jobTitle} at ${singleRes.body.application.company}`);

    // 12. User A updates application details (PUT)
    console.log('12. User A updates application fields...');
    const updateRes = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: `/api/applications/${appA1Id}`,
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokenA}`
        }
      },
      {
        notes: 'Recruiter reached out. Scheduled round 1 technical interview.',
        salaryMax: 3500000
      }
    );

    if (updateRes.status !== 200 || updateRes.body.application.salaryMax !== 3500000) {
      throw new Error(`Failed to update application: ${JSON.stringify(updateRes.body)}`);
    }
    console.log('   [SUCCESS] Application fields updated successfully.');

    // 13. User A updates application status (PATCH)
    console.log('13. User A updates application status to "Interview"...');
    const patchStatusRes = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: `/api/applications/${appA1Id}/status`,
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokenA}`
        }
      },
      {
        status: 'Interview',
        note: 'Passed screening, interview confirmed for next Monday.'
      }
    );

    if (patchStatusRes.status !== 200 || patchStatusRes.body.application.status !== 'Interview') {
      throw new Error(`Failed to update status: ${JSON.stringify(patchStatusRes.body)}`);
    }
    console.log('   [SUCCESS] Status updated to Interview successfully.');

    // 14. User A gets statistics
    console.log('14. User A requests Application Statistics (/api/applications/stats)...');
    const statsRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/applications/stats',
      method: 'GET',
      headers: { Authorization: `Bearer ${tokenA}` }
    });

    if (statsRes.status !== 200 || !statsRes.body.stats) {
      throw new Error(`Failed to get stats: ${JSON.stringify(statsRes.body)}`);
    }
    const stats = statsRes.body.stats;
    console.log(`   [SUCCESS] Application Statistics: Total=${stats.total}, Interview=${stats.interview}, Offer=${stats.offer}, Screening=${stats.screening}, InterviewRate=${stats.interviewRate}%, OfferRate=${stats.offerRate}%`);

    // 15. Security & Isolation Tests: User B tries to access User A's application
    console.log('15. Security Isolation: User B attempts to access User A application...');
    const userBAccessRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: `/api/applications/${appA1Id}`,
      method: 'GET',
      headers: { Authorization: `Bearer ${tokenB}` }
    });

    if (userBAccessRes.status !== 404) {
      throw new Error(`Security breach: User B accessed User A application with status ${userBAccessRes.status}`);
    }
    console.log('   [SUCCESS] User B forbidden from viewing User A application (404 Not Found / isolated).');

    // 16. Security Isolation: User B tries to modify User A's application
    console.log('16. Security Isolation: User B attempts to edit User A application...');
    const userBEditRes = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: `/api/applications/${appA1Id}`,
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokenB}`
        }
      },
      { company: 'Hacked Company' }
    );

    if (userBEditRes.status !== 404) {
      throw new Error(`Security breach: User B edited User A application with status ${userBEditRes.status}`);
    }
    console.log('   [SUCCESS] User B forbidden from editing User A application.');

    // 17. Security Isolation: User B tries to delete User A's application
    console.log('17. Security Isolation: User B attempts to delete User A application...');
    const userBDeleteRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: `/api/applications/${appA1Id}`,
      method: 'DELETE',
      headers: { Authorization: `Bearer ${tokenB}` }
    });

    if (userBDeleteRes.status !== 404) {
      throw new Error(`Security breach: User B deleted User A application with status ${userBDeleteRes.status}`);
    }
    console.log('   [SUCCESS] User B forbidden from deleting User A application.');

    // 18. Unauthenticated access test
    console.log('18. Security: Unauthenticated request to /api/applications...');
    const unauthRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/applications',
      method: 'GET'
    });

    if (unauthRes.status !== 401) {
      throw new Error(`Security breach: Unauthenticated request allowed with status ${unauthRes.status}`);
    }
    console.log('   [SUCCESS] Unauthenticated request correctly rejected with 401 Unauthorized.');

    // 19. User A deletes application 3
    console.log('19. User A deletes Application 3 (Amazon)...');
    const deleteRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: `/api/applications/${appA3Id}`,
      method: 'DELETE',
      headers: { Authorization: `Bearer ${tokenA}` }
    });

    if (deleteRes.status !== 200) {
      throw new Error(`Failed to delete application: ${JSON.stringify(deleteRes.body)}`);
    }
    console.log('   [SUCCESS] Application 3 deleted successfully.');

    // 20. Verify deletion
    console.log('20. Verifying Application 3 is no longer accessible...');
    const checkDeletedRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: `/api/applications/${appA3Id}`,
      method: 'GET',
      headers: { Authorization: `Bearer ${tokenA}` }
    });

    if (checkDeletedRes.status !== 404) {
      throw new Error(`Expected 404 for deleted application, got status ${checkDeletedRes.status}`);
    }
    console.log('   [SUCCESS] Application confirmed deleted.');

    console.log('\n====================================================');
    console.log('🎉 ALL MODULE 6 TESTS PASSED SUCCESSFULLY! (20/20)');
    console.log('====================================================\n');
  } catch (err) {
    console.error('\n❌ TEST FAILED:', err.message);
    process.exit(1);
  }
}

runTests();
