const axios = require('axios');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const BASE_URL = 'http://localhost:5000/api';

async function runCompaniesTestSuite() {
  console.log('====================================================');
  console.log('CAREERPILOT BACKEND MODULE 11 — COMPANIES TEST SUITE');
  console.log('====================================================\n');

  const timestamp = Date.now();
  const studentEmail = `student_comp_${timestamp}@test.com`;
  const adminEmail = `admin_comp_${timestamp}@test.com`;
  const password = 'Password123!';

  try {
    // 1. Register normal Student User
    console.log('1. Registering normal Student User...');
    const regResStudent = await axios.post(`${BASE_URL}/auth/register`, {
      name: 'Bob Student',
      email: studentEmail,
      password: password
    });
    const studentToken = regResStudent.data.token;
    const studentId = regResStudent.data.user.id || regResStudent.data.user._id;
    console.log(`   [SUCCESS] Student registered. ID: ${studentId}`);

    const studentClient = axios.create({
      baseURL: BASE_URL,
      headers: { Authorization: `Bearer ${studentToken}` }
    });

    // 2. Register Admin User
    console.log('2. Registering and promoting Admin User...');
    const regResAdmin = await axios.post(`${BASE_URL}/auth/register`, {
      name: 'Alice Admin',
      email: adminEmail,
      password: password
    });
    const adminToken = regResAdmin.data.token;
    const adminId = regResAdmin.data.user.id || regResAdmin.data.user._id;

    // Promote to admin in DB
    const mongoUri = process.env.MONGO_URI || 'mongodb+srv://harihararupan2006:9123565576@cluster0.hgh9n0m.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
    await mongoose.connect(mongoUri);
    const User = require('./models/User');
    await User.findByIdAndUpdate(adminId, { role: 'admin' });
    console.log(`   [SUCCESS] Admin registered and role set to 'admin'. ID: ${adminId}`);

    // Re-login as Admin to get updated JWT claims if necessary
    const loginAdmin = await axios.post(`${BASE_URL}/auth/login`, {
      email: adminEmail,
      password: password
    });
    const freshAdminToken = loginAdmin.data.token;
    const adminClient = axios.create({
      baseURL: BASE_URL,
      headers: { Authorization: `Bearer ${freshAdminToken}` }
    });

    // 3. GET /api/companies (Public listing & pagination)
    console.log('\n3. Fetching company directory (GET /api/companies)...');
    const compListRes = await axios.get(`${BASE_URL}/companies?limit=10`);
    if (!compListRes.data.success || !Array.isArray(compListRes.data.data)) {
      throw new Error('Failed to fetch companies list');
    }
    console.log(`   [SUCCESS] Companies fetched: ${compListRes.data.data.length} items. Total in DB: ${compListRes.data.pagination.total}`);
    const firstCompany = compListRes.data.data[0];
    console.log(`   First Company: "${firstCompany.name}" (Slug: "${firstCompany.slug}", ID: "${firstCompany.id}")`);

    // 4. Test Search (GET /api/companies?search=Amazon)
    console.log('\n4. Testing company search (GET /api/companies?search=Amazon)...');
    const searchRes = await axios.get(`${BASE_URL}/companies?search=Amazon`);
    if (!searchRes.data.success || searchRes.data.data.length === 0) {
      throw new Error('Search for "Amazon" returned 0 results');
    }
    console.log(`   [SUCCESS] Search for "Amazon" matched: ${searchRes.data.data.map((c) => c.name).join(', ')}`);

    // 5. Test Filters (GET /api/companies?industry=Cloud)
    console.log('\n5. Testing industry filter (GET /api/companies?industry=Cloud)...');
    const filterRes = await axios.get(`${BASE_URL}/companies?industry=Cloud`);
    if (!filterRes.data.success || filterRes.data.data.length === 0) {
      throw new Error('Filter by industry returned 0 results');
    }
    console.log(`   [SUCCESS] Filter by industry matched ${filterRes.data.data.length} companies.`);

    // 6. GET /api/companies/:id by ID and by slug
    console.log('\n6. Fetching company details by ID (GET /api/companies/:id)...');
    const compDetailRes = await axios.get(`${BASE_URL}/companies/${firstCompany.id}`);
    if (!compDetailRes.data.success || compDetailRes.data.data.name !== firstCompany.name) {
      throw new Error('Failed to retrieve company details by ID');
    }
    console.log(`   [SUCCESS] Retrieved details for: ${compDetailRes.data.data.name}`);

    console.log('   Fetching company details by Slug (GET /api/companies/:slug)...');
    const compSlugRes = await axios.get(`${BASE_URL}/companies/${firstCompany.slug}`);
    if (!compSlugRes.data.success || compSlugRes.data.data.id !== firstCompany.id) {
      throw new Error('Failed to retrieve company details by Slug');
    }
    console.log(`   [SUCCESS] Slug routing confirmed for slug: "${firstCompany.slug}"`);

    // 7. GET /api/companies/:id/jobs
    console.log('\n7. Fetching jobs for company (GET /api/companies/:id/jobs)...');
    const jobsRes = await axios.get(`${BASE_URL}/companies/${firstCompany.id}/jobs`);
    if (!jobsRes.data.success || !Array.isArray(jobsRes.data.data)) {
      throw new Error('Failed to retrieve company jobs');
    }
    console.log(`   [SUCCESS] Retrieved ${jobsRes.data.data.length} jobs for ${firstCompany.name}.`);

    // 8. GET /api/companies/:id/interview-experiences
    console.log('\n8. Fetching interview experiences (GET /api/companies/:id/interview-experiences)...');
    const expRes = await axios.get(`${BASE_URL}/companies/${firstCompany.id}/interview-experiences`);
    if (!expRes.data.success || !Array.isArray(expRes.data.data)) {
      throw new Error('Failed to retrieve company interview experiences');
    }
    console.log(`   [SUCCESS] Retrieved ${expRes.data.data.length} interview experiences for ${firstCompany.name}.`);

    // 9. GET /api/companies/:id/people
    console.log('\n9. Fetching people associated with company (GET /api/companies/:id/people)...');
    const peopleRes = await axios.get(`${BASE_URL}/companies/${firstCompany.id}/people`);
    if (!peopleRes.data.success || !Array.isArray(peopleRes.data.data)) {
      throw new Error('Failed to retrieve company people');
    }
    console.log(`   [SUCCESS] Retrieved ${peopleRes.data.data.length} public alumni for ${firstCompany.name}.`);

    // 10. GET /api/companies/:id/stats
    console.log('\n10. Fetching real company stats (GET /api/companies/:id/stats)...');
    const statsRes = await axios.get(`${BASE_URL}/companies/${firstCompany.id}/stats`);
    if (!statsRes.data.success || typeof statsRes.data.data.jobCount !== 'number') {
      throw new Error('Failed to retrieve company stats');
    }
    console.log(`   [SUCCESS] Stats for ${firstCompany.name}: Jobs=${statsRes.data.data.jobCount}, Experiences=${statsRes.data.data.interviewExperienceCount}, People=${statsRes.data.data.peopleCount}, TopSkills=[${statsRes.data.data.topSkills.join(', ')}]`);

    // 11. Student Bookmark/Save Company (POST /api/companies/:id/save)
    console.log('\n11. Student saves company (POST /api/companies/:id/save)...');
    const saveRes = await studentClient.post(`/companies/${firstCompany.id}/save`);
    if (!saveRes.data.success) {
      throw new Error('Failed to save company');
    }
    console.log(`   [SUCCESS] Company saved: ${saveRes.data.message}`);

    // Check duplicate save idempotency
    console.log('   Testing duplicate save idempotency...');
    const dupSaveRes = await studentClient.post(`/companies/${firstCompany.id}/save`);
    if (!dupSaveRes.data.success) {
      throw new Error('Duplicate save returned error instead of idempotent success');
    }
    console.log('   [SUCCESS] Duplicate save handled idempotently.');

    // 12. Check saved status (GET /api/companies/:id/saved)
    console.log('\n12. Checking saved status (GET /api/companies/:id/saved)...');
    const checkSaved = await studentClient.get(`/companies/${firstCompany.id}/saved`);
    if (!checkSaved.data.success || checkSaved.data.isSaved !== true) {
      throw new Error('Company should be reported as saved');
    }
    console.log('   [SUCCESS] Company is reported as isSaved = true.');

    // 13. Get all saved companies (GET /api/companies/saved)
    console.log('\n13. Fetching user saved companies (GET /api/companies/saved)...');
    const savedList = await studentClient.get('/companies/saved');
    if (!savedList.data.success || savedList.data.data.length === 0) {
      throw new Error('Saved company not found in user saved list');
    }
    console.log(`   [SUCCESS] User has ${savedList.data.data.length} saved companies: ${savedList.data.data.map((c) => c.name).join(', ')}`);

    // 14. Unsave company (DELETE /api/companies/:id/save)
    console.log('\n14. Unsaving company (DELETE /api/companies/:id/save)...');
    const unsaveRes = await studentClient.delete(`/companies/${firstCompany.id}/save`);
    if (!unsaveRes.data.success) {
      throw new Error('Failed to unsave company');
    }
    console.log('   [SUCCESS] Company unsaved successfully.');

    // Verify unsaved
    const checkUnsaved = await studentClient.get(`/companies/${firstCompany.id}/saved`);
    if (checkUnsaved.data.isSaved !== false) {
      throw new Error('Company should now report isSaved = false');
    }
    console.log('   [SUCCESS] Verified isSaved = false after unsaving.');

    // 15. Security: Student attempts Admin operations -> 403 Forbidden
    console.log('\n15. Security: Student attempts to create company (POST /api/companies)...');
    try {
      await studentClient.post('/companies', {
        name: 'Hacker Corp',
        industry: 'Security'
      });
      throw new Error('SECURITY VIOLATION: Student was allowed to create company!');
    } catch (err) {
      if (err.response?.status === 403) {
        console.log('   [SUCCESS] Blocked student company creation with 403 Forbidden.');
      } else {
        throw err;
      }
    }

    console.log('   Security: Student attempts to update company (PUT /api/companies/:id)...');
    try {
      await studentClient.put(`/companies/${firstCompany.id}`, { name: 'Comp Hack' });
      throw new Error('SECURITY VIOLATION: Student was allowed to update company!');
    } catch (err) {
      if (err.response?.status === 403) {
        console.log('   [SUCCESS] Blocked student company update with 403 Forbidden.');
      } else {
        throw err;
      }
    }

    console.log('   Security: Student attempts to deactivate company (DELETE /api/companies/:id)...');
    try {
      await studentClient.delete(`/companies/${firstCompany.id}`);
      throw new Error('SECURITY VIOLATION: Student was allowed to deactivate company!');
    } catch (err) {
      if (err.response?.status === 403) {
        console.log('   [SUCCESS] Blocked student company deactivation with 403 Forbidden.');
      } else {
        throw err;
      }
    }

    // 16. Admin CRUD: Create Company
    console.log('\n16. Admin creates new test company (POST /api/companies)...');
    const newCompName = `Stripe Global ${timestamp}`;
    const createCompRes = await adminClient.post('/companies', {
      name: newCompName,
      industry: 'Fintech & Payments',
      companySize: 'Large',
      companyType: 'Private',
      headquarters: 'San Francisco, CA',
      locations: ['San Francisco', 'Dublin', 'Singapore'],
      website: 'https://stripe.com',
      foundedYear: 2010,
      description: 'Global financial infrastructure company powering payments for the internet.',
      specializations: ['Backend Engineer', 'Infrastructure Engineer', 'Full Stack Developer'],
      skills: ['Ruby', 'Go', 'Java', 'Distributed Systems', 'PostgreSQL']
    });
    if (!createCompRes.data.success || !createCompRes.data.data.id) {
      throw new Error('Admin failed to create company');
    }
    const createdCompId = createCompRes.data.data.id || createCompRes.data.data._id;
    console.log(`   [SUCCESS] Admin created company "${newCompName}" (ID: ${createdCompId}).`);

    // 17. Admin updates company (PUT /api/companies/:id)
    console.log('\n17. Admin updates company details (PUT /api/companies/:id)...');
    const updateCompRes = await adminClient.put(`/companies/${createdCompId}`, {
      description: 'Updated Stripe description with enhanced fintech payment processing.',
      companySize: 'Enterprise'
    });
    if (!updateCompRes.data.success || updateCompRes.data.data.companySize !== 'Enterprise') {
      throw new Error('Admin failed to update company');
    }
    console.log('   [SUCCESS] Company updated successfully.');

    // 18. Admin deactivates company (DELETE /api/companies/:id)
    console.log('\n18. Admin deactivates company (DELETE /api/companies/:id)...');
    const deactRes = await adminClient.delete(`/companies/${createdCompId}`);
    if (!deactRes.data.success || deactRes.data.data.isActive !== false) {
      throw new Error('Admin failed to deactivate company');
    }
    console.log('   [SUCCESS] Company deactivated (isActive = false).');

    // Verify inactive company is hidden from normal discovery
    const publicFetchInactive = await axios.get(`${BASE_URL}/companies?search=${encodeURIComponent(newCompName)}`);
    if (publicFetchInactive.data.data.length > 0) {
      throw new Error('Deactivated company was returned in public search');
    }
    console.log('   [SUCCESS] Deactivated company is correctly hidden from public discovery.');

    // 19. Test input validation and 400 for bad requests
    console.log('\n19. Testing input validation and error handling...');
    try {
      await adminClient.post('/companies', { name: '' });
      throw new Error('Empty company name should have been rejected');
    } catch (err) {
      if (err.response?.status === 400) {
        console.log('   ✓ Empty company name properly rejected (400)');
      } else {
        throw err;
      }
    }

    try {
      await axios.get(`${BASE_URL}/companies/nonexistent-invalid-slug-12345`);
      throw new Error('Nonexistent company should return 404');
    } catch (err) {
      if (err.response?.status === 404) {
        console.log('   ✓ Nonexistent company properly returns 404');
      } else {
        throw err;
      }
    }

    console.log('\n====================================================');
    console.log('🎉 ALL MODULE 11 BACKEND TESTS PASSED (19/19)');
    console.log('====================================================\n');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ ERROR RUNNING TEST SUITE:', err.response?.data || err.message);
    process.exit(1);
  }
}

runCompaniesTestSuite();
