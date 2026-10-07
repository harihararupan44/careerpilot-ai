const axios = require('axios');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const { connectDB } = require('./config/db');
connectDB();

const BASE_URL = 'http://localhost:5000/api';

const { runAllReminderJobs } = require('./services/reminderService');
const { Notification } = require('./models/Notification');
const Application = require('./models/Application');
const Interview = require('./models/Interview');
const Profile = require('./models/Profile');

async function runTests() {
  console.log('\n====================================================');
  console.log('CAREERPILOT MODULE 14: NOTIFICATIONS & REMINDERS TEST');
  console.log('====================================================\n');

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition, message) {
    totalTests++;
    if (condition) {
      console.log(`   ✅ PASS: ${message}`);
      passedTests++;
    } else {
      console.error(`   ❌ FAIL: ${message}`);
      process.exitCode = 1;
    }
  }

  const timestamp = Date.now();
  const userAData = {
    name: `Alice Tester ${timestamp}`,
    email: `alice_${timestamp}@test.com`,
    password: 'Password123!'
  };
  const userBData = {
    name: `Bob Mentor ${timestamp}`,
    email: `bob_${timestamp}@test.com`,
    password: 'Password123!'
  };

  try {
    // 1. Register User A (Alice)
    console.log('1. Registering User A (Alice)...');
    const regResA = await axios.post(`${BASE_URL}/auth/register`, userAData);
    assert(regResA.status === 201 && regResA.data.token, 'User A registered and received token');
    const tokenA = regResA.data.token;
    const userAId = regResA.data.user._id || regResA.data.user.id;
    const authHeaderA = { headers: { Authorization: `Bearer ${tokenA}` } };

    // 2. Register User B (Bob)
    console.log('\n2. Registering User B (Bob)...');
    const regResB = await axios.post(`${BASE_URL}/auth/register`, userBData);
    assert(regResB.status === 201 && regResB.data.token, 'User B registered and received token');
    const tokenB = regResB.data.token;
    const userBId = regResB.data.user._id || regResB.data.user.id;
    const authHeaderB = { headers: { Authorization: `Bearer ${tokenB}` } };

    // Make Bob open to guidance
    await Profile.findOneAndUpdate(
      { user: userBId },
      { $set: { openToGuidance: true, guidanceBio: 'Experienced Engineer', targetRole: 'Staff Engineer' } },
      { upsert: true }
    );

    // 3. User A creates an application
    console.log('\n3. Testing Application Status Change Notifications...');
    const appRes = await axios.post(
      `${BASE_URL}/applications`,
      {
        company: 'Stripe',
        jobTitle: 'Backend Engineer',
        status: 'Applied'
      },
      authHeaderA
    );
    assert(appRes.status === 201, 'Application created for User A');
    const appId = appRes.data.application._id || appRes.data.application.id;

    // Update Status: Applied -> Screening
    const patch1 = await axios.patch(
      `${BASE_URL}/applications/${appId}/status`,
      { status: 'Screening' },
      authHeaderA
    );
    assert(patch1.status === 200, 'Application status updated to Screening');

    // Update Status: Screening -> Interview
    const patch2 = await axios.patch(
      `${BASE_URL}/applications/${appId}/status`,
      { status: 'Interview' },
      authHeaderA
    );
    assert(patch2.status === 200, 'Application status updated to Interview');

    // Update Status: Interview -> Offer
    const patch3 = await axios.patch(
      `${BASE_URL}/applications/${appId}/status`,
      { status: 'Offer' },
      authHeaderA
    );
    assert(patch3.status === 200, 'Application status updated to Offer');

    // Duplicate patch with same status (Offer -> Offer): Should not create extra notification
    await axios.patch(
      `${BASE_URL}/applications/${appId}/status`,
      { status: 'Offer' },
      authHeaderA
    );

    // Check User A notifications
    const notifsA = await axios.get(`${BASE_URL}/notifications`, authHeaderA);
    assert(notifsA.status === 200, 'GET /api/notifications returns 200');
    const appStatusNotifs = notifsA.data.data.notifications.filter(
      (n) => n.type === 'APPLICATION_STATUS'
    );
    assert(
      appStatusNotifs.length === 3,
      `User A received exactly 3 status notifications (Found: ${appStatusNotifs.length})`
    );

    const offerNotif = appStatusNotifs.find((n) => n.message.includes('Offer'));
    assert(offerNotif && offerNotif.priority === 'HIGH', 'Offer notification has HIGH priority');

    // 4. Test Deadlines and Follow-up Reminders
    console.log('\n4. Testing Application Deadline & Follow-up Reminders with Duplicate Prevention...');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    await Application.findByIdAndUpdate(appId, {
      deadline: tomorrow,
      followUpDate: tomorrow
    });

    // Run reminder jobs pass 1
    const run1 = await runAllReminderJobs();
    assert(run1.deadlines >= 1, 'Deadline reminder job processed at least 1 deadline');
    assert(run1.followups >= 1, 'Follow-up reminder job processed at least 1 follow-up');

    // Count deadline & follow-up notifications
    const notifsAfterRun1 = await axios.get(`${BASE_URL}/notifications`, authHeaderA);
    const deadlineNotifs1 = notifsAfterRun1.data.data.notifications.filter(
      (n) => n.type === 'APPLICATION_DEADLINE'
    );
    const followupNotifs1 = notifsAfterRun1.data.data.notifications.filter(
      (n) => n.type === 'APPLICATION_FOLLOWUP'
    );
    assert(deadlineNotifs1.length === 1, 'Exactly 1 deadline notification exists for User A');
    assert(followupNotifs1.length === 1, 'Exactly 1 follow-up notification exists for User A');

    // Run reminder jobs pass 2 to verify duplicate prevention
    const run2 = await runAllReminderJobs();
    const notifsAfterRun2 = await axios.get(`${BASE_URL}/notifications`, authHeaderA);
    const deadlineNotifs2 = notifsAfterRun2.data.data.notifications.filter(
      (n) => n.type === 'APPLICATION_DEADLINE'
    );
    const followupNotifs2 = notifsAfterRun2.data.data.notifications.filter(
      (n) => n.type === 'APPLICATION_FOLLOWUP'
    );
    assert(
      deadlineNotifs2.length === 1,
      'Duplicate prevention verified: Deadline notification count remains 1'
    );
    assert(
      followupNotifs2.length === 1,
      'Duplicate prevention verified: Follow-up notification count remains 1'
    );

    // 5. Test Interview Notifications & Status Updates
    console.log('\n5. Testing Interview Notifications & Reminders...');
    const interviewRes = await axios.post(
      `${BASE_URL}/interviews`,
      {
        company: 'Google',
        jobTitle: 'Software Engineer',
        interviewType: 'System Design',
        scheduledDate: tomorrow
      },
      authHeaderA
    );
    assert(interviewRes.status === 201, 'Interview created for User A');
    const interviewId = interviewRes.data.interview._id || interviewRes.data.interview.id;

    // Run reminder job for upcoming interview
    await runAllReminderJobs();
    const notifsInterview1 = await axios.get(`${BASE_URL}/notifications`, authHeaderA);
    const upcomingInterviewNotifs = notifsInterview1.data.data.notifications.filter(
      (n) => n.type === 'INTERVIEW_UPCOMING'
    );
    assert(upcomingInterviewNotifs.length === 1, 'Upcoming interview reminder created');

    // Re-run to verify duplicate prevention
    await runAllReminderJobs();
    const notifsInterview2 = await axios.get(`${BASE_URL}/notifications`, authHeaderA);
    const upcomingInterviewNotifs2 = notifsInterview2.data.data.notifications.filter(
      (n) => n.type === 'INTERVIEW_UPCOMING'
    );
    assert(
      upcomingInterviewNotifs2.length === 1,
      'Duplicate prevention verified: Upcoming interview reminder not duplicated'
    );

    // Cancel interview
    const cancelRes = await axios.patch(
      `${BASE_URL}/interviews/${interviewId}/status`,
      { status: 'Cancelled' },
      authHeaderA
    );
    assert(cancelRes.status === 200, 'Interview marked as Cancelled');
    const notifsCancel = await axios.get(`${BASE_URL}/notifications`, authHeaderA);
    const cancelNotif = notifsCancel.data.data.notifications.find(
      (n) => n.type === 'INTERVIEW_STATUS' && n.message.includes('Cancelled')
    );
    assert(Boolean(cancelNotif), 'Interview status change notification received for Cancelled');

    // 6. Test Career Guidance Notifications
    console.log('\n6. Testing Career Guidance Notifications...');
    const guidanceRes = await axios.post(
      `${BASE_URL}/guidance/requests`,
      {
        mentorId: userBId,
        topic: 'System Design Review',
        message: 'Could you give me some guidance on distributed caching?'
      },
      authHeaderA
    );
    assert(guidanceRes.status === 201, 'User A sent guidance request to User B');
    const guidanceRequestId = guidanceRes.data.data._id || guidanceRes.data.data.id;

    // Check User B (Mentor) notifications
    const notifsB = await axios.get(`${BASE_URL}/notifications`, authHeaderB);
    const reqNotifB = notifsB.data.data.notifications.find((n) => n.type === 'GUIDANCE_REQUEST');
    assert(Boolean(reqNotifB), 'User B received GUIDANCE_REQUEST notification');

    // Mentor accepts request
    const acceptGuidanceRes = await axios.patch(
      `${BASE_URL}/guidance/requests/${guidanceRequestId}/accept`,
      { responseMessage: 'Happy to help!' },
      authHeaderB
    );
    assert(acceptGuidanceRes.status === 200, 'User B accepted guidance request');

    // Check User A notifications
    const notifsAAfterAccept = await axios.get(`${BASE_URL}/notifications`, authHeaderA);
    const acceptedNotifA = notifsAAfterAccept.data.data.notifications.find(
      (n) => n.type === 'GUIDANCE_ACCEPTED'
    );
    assert(Boolean(acceptedNotifA), 'User A received GUIDANCE_ACCEPTED notification');

    // 7. Test Community Connection Notifications
    console.log('\n7. Testing Connection Notifications...');
    const connectRes = await axios.post(`${BASE_URL}/people/${userBId}/connect`, {}, authHeaderA);
    assert(connectRes.status === 201, 'User A sent connection request to User B');
    const connectionId = connectRes.data.connection._id || connectRes.data.connection.id;

    // Check User B notifications
    const notifsBConnect = await axios.get(`${BASE_URL}/notifications`, authHeaderB);
    const connectNotifB = notifsBConnect.data.data.notifications.find(
      (n) => n.type === 'CONNECTION_REQUEST'
    );
    assert(Boolean(connectNotifB), 'User B received CONNECTION_REQUEST notification');

    // User B accepts connection
    const acceptConnectRes = await axios.patch(
      `${BASE_URL}/people/requests/${connectionId}/accept`,
      {},
      authHeaderB
    );
    assert(acceptConnectRes.status === 200, 'User B accepted connection request');

    // Check User A notifications
    const notifsAConnect = await axios.get(`${BASE_URL}/notifications`, authHeaderA);
    const connectAcceptedNotifA = notifsAConnect.data.data.notifications.find(
      (n) => n.type === 'CONNECTION_ACCEPTED'
    );
    assert(Boolean(connectAcceptedNotifA), 'User A received CONNECTION_ACCEPTED notification');

    // 8. Test Notification Management APIs
    console.log('\n8. Testing Notification Controller APIs (Mark Read, Read All, Delete)...');
    const unreadRes1 = await axios.get(`${BASE_URL}/notifications/unread-count`, authHeaderA);
    assert(unreadRes1.status === 200 && unreadRes1.data.data.unreadCount > 0, 'GET /api/notifications/unread-count returned positive unread count');

    const firstNotif = notifsAConnect.data.data.notifications[0];
    const firstNotifId = firstNotif._id || firstNotif.id;

    const markReadRes = await axios.patch(
      `${BASE_URL}/notifications/${firstNotifId}/read`,
      {},
      authHeaderA
    );
    assert(markReadRes.status === 200 && markReadRes.data.data.isRead === true, 'PATCH /api/notifications/:id/read marked notification as read');

    const markAllRes = await axios.patch(`${BASE_URL}/notifications/read-all`, {}, authHeaderA);
    assert(markAllRes.status === 200, 'PATCH /api/notifications/read-all returned 200');

    const unreadRes2 = await axios.get(`${BASE_URL}/notifications/unread-count`, authHeaderA);
    assert(unreadRes2.data.data.unreadCount === 0, 'Unread count is now 0 after read-all');

    // Delete single notification
    const delSingleRes = await axios.delete(
      `${BASE_URL}/notifications/${firstNotifId}`,
      authHeaderA
    );
    assert(delSingleRes.status === 200, 'DELETE /api/notifications/:id returned 200');

    // Delete all read
    const delAllReadRes = await axios.delete(`${BASE_URL}/notifications/read`, authHeaderA);
    assert(delAllReadRes.status === 200, 'DELETE /api/notifications/read returned 200');

    // 9. Test Security & Multi-User Isolation
    console.log('\n9. Testing Multi-User Security & Isolation...');
    // Create a new notification for User A
    const freshNotif = await Notification.create({
      user: userAId,
      type: 'SYSTEM',
      title: 'Secret User A Notification',
      message: 'Private message'
    });

    // User B attempts to read User A's notification
    let hackerReadBlocked = false;
    try {
      await axios.patch(`${BASE_URL}/notifications/${freshNotif._id}/read`, {}, authHeaderB);
    } catch (err) {
      if (err.response && (err.response.status === 404 || err.response.status === 403)) {
        hackerReadBlocked = true;
      }
    }
    assert(hackerReadBlocked, 'User B cannot mark User A notification as read (blocked with 404/403)');

    // User B attempts to delete User A's notification
    let hackerDelBlocked = false;
    try {
      await axios.delete(`${BASE_URL}/notifications/${freshNotif._id}`, authHeaderB);
    } catch (err) {
      if (err.response && (err.response.status === 404 || err.response.status === 403)) {
        hackerDelBlocked = true;
      }
    }
    assert(hackerDelBlocked, 'User B cannot delete User A notification (blocked with 404/403)');

    // 10. Health Check
    console.log('\n10. Testing Backend Health Check...');
    const healthRes = await axios.get(`${BASE_URL}/health`);
    assert(healthRes.status === 200 && healthRes.data.success === true, 'GET /api/health is operational');

    console.log('\n====================================================');
    console.log(`TEST SUMMARY: ${passedTests}/${totalTests} PASSED`);
    console.log('====================================================\n');

    process.exit(passedTests === totalTests ? 0 : 1);
  } catch (error) {
    console.error('Test execution error:', error.message || error);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
    process.exit(1);
  }
}

// Allow database to connect before running test suite
setTimeout(runTests, 1500);
