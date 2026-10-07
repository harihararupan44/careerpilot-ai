const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const mongoose = require('mongoose');
const User = require('./models/User');
const Application = require('./models/Application');
const Interview = require('./models/Interview');

const MONGO_URI = process.env.MONGO_URI;

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

async function runTests() {
  console.log('🚀 Starting Application Interview Detail Verification Tests...\n');

  try {
    await mongoose.connect(MONGO_URI);
    console.log('📦 Connected to MongoDB Atlas');

    // Clean up or find test user
    const testEmail = `interview_test_${Date.now()}@example.com`;
    const testUser = await User.create({
      name: 'Interview Test User',
      email: testEmail,
      password: 'Password123!',
      role: 'student'
    });

    console.log('\n--- 1. Testing Application with Linked Interview ---');
    const testScheduledDate = new Date('2026-10-15T10:30:00.000Z');
    
    const appWithInterview = await Application.create({
      user: testUser._id,
      company: 'Stripe',
      jobTitle: 'Backend Engineer',
      status: 'Interview',
      appliedDate: new Date('2026-10-01T09:00:00.000Z'),
      notes: 'Passed screening round with recruiter'
    });

    const interviewDoc = await Interview.create({
      user: testUser._id,
      application: appWithInterview._id,
      company: 'Stripe',
      jobTitle: 'Backend Engineer',
      interviewType: 'Technical',
      scheduledDate: testScheduledDate,
      status: 'Upcoming',
      meetingUrl: 'https://meet.google.com/stripe-tech-round',
      location: 'Google Meet',
      notes: 'Review Distributed Systems and Payment APIs'
    });

    // Test controller logic for getApplicationById
    const fetchedApp = await Application.findOne({ _id: appWithInterview._id, user: testUser._id });
    const fetchedInterview = await Interview.findOne({ application: fetchedApp._id, user: testUser._id })
      .sort({ scheduledDate: -1, createdAt: -1 });

    const appData = fetchedApp.toObject();
    appData.interview = fetchedInterview ? fetchedInterview.toObject() : null;

    assert(appData.status === 'Interview', 'Application status is "Interview"');
    assert(appData.interview !== null, 'Linked interview document is present');
    assert(
      new Date(appData.interview.scheduledDate).toISOString() === testScheduledDate.toISOString(),
      `Interview scheduledDate is preserved correctly (${appData.interview.scheduledDate})`
    );
    assert(appData.interview.interviewType === 'Technical', 'Interview type is "Technical"');
    assert(appData.interview.status === 'Upcoming', 'Interview status is "Upcoming"');
    assert(appData.interview.meetingUrl === 'https://meet.google.com/stripe-tech-round', 'Meeting URL is preserved');
    assert(appData.interview.location === 'Google Meet', 'Location is preserved');

    console.log('\n--- 2. Testing Application without Linked Interview ---');
    const appWithoutInterview = await Application.create({
      user: testUser._id,
      company: 'Amazon',
      jobTitle: 'SDE II',
      status: 'Applied',
      appliedDate: new Date('2026-10-05T09:00:00.000Z')
    });

    const unlinkedInterview = await Interview.findOne({ application: appWithoutInterview._id, user: testUser._id });
    const appWithoutData = appWithoutInterview.toObject();
    appWithoutData.interview = unlinkedInterview ? unlinkedInterview.toObject() : null;

    assert(appWithoutData.status === 'Applied', 'Application status is "Applied"');
    assert(appWithoutData.interview === null, 'Interview is null when none scheduled');

    console.log('\n--- 3. Testing Batch Applications Interview Attachment ---');
    const userApps = await Application.find({ user: testUser._id });
    const appIds = userApps.map(a => a._id);
    const allInterviews = await Interview.find({ application: { $in: appIds }, user: testUser._id });
    const interviewMap = {};
    allInterviews.forEach(inv => {
      if (inv.application) {
        interviewMap[inv.application.toString()] = inv;
      }
    });

    const populatedApps = userApps.map(app => {
      const obj = app.toObject();
      obj.interview = interviewMap[app._id.toString()] || null;
      return obj;
    });

    assert(populatedApps.length === 2, 'Found both user applications in batch query');
    const stripePopulated = populatedApps.find(a => a.company === 'Stripe');
    const amazonPopulated = populatedApps.find(a => a.company === 'Amazon');
    assert(stripePopulated?.interview?.scheduledDate !== undefined, 'Stripe application has interview attached in batch');
    assert(amazonPopulated?.interview === null, 'Amazon application has interview: null in batch');

    // Cleanup
    await Interview.deleteMany({ user: testUser._id });
    await Application.deleteMany({ user: testUser._id });
    await User.findByIdAndDelete(testUser._id);
    console.log('\n🧹 Test artifacts cleaned up successfully.');

  } catch (err) {
    console.error('❌ Test failed with error:', err);
    failed++;
  } finally {
    await mongoose.disconnect();
    console.log(`\n========================================`);
    console.log(`TOTAL: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
    console.log(`========================================\n`);
    process.exit(failed > 0 ? 1 : 0);
  }
}

runTests();
