const Application = require('../models/Application');
const Interview = require('../models/Interview');
const {
  createDeadlineReminder,
  createFollowUpReminder,
  notifyInterviewUpcoming
} = require('./notificationService');

/**
 * Calculates whole days difference between a target date and now
 */
const getDaysDifference = (targetDate) => {
  if (!targetDate) return null;
  const now = new Date();
  // Strip time for clean day-based calculation
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(targetDate);
  const startOfTarget = new Date(target.getFullYear(), target.getMonth(), target.getDate());

  const diffMs = startOfTarget.getTime() - startOfToday.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
};

/**
 * Process application deadline reminders
 * Checks active applications where deadline is approaching (7, 3, 1, 0 days)
 */
const processApplicationDeadlineReminders = async () => {
  let createdCount = 0;
  try {
    const activeApplications = await Application.find({
      status: { $nin: ['Rejected', 'Withdrawn'] },
      deadline: { $ne: null }
    });

    const nowStr = new Date().toISOString().split('T')[0];

    for (const app of activeApplications) {
      const daysLeft = getDaysDifference(app.deadline);
      // Notify at 7 days, 3 days, 1 day, and on deadline day
      if (daysLeft !== null && [7, 3, 1, 0].includes(daysLeft)) {
        const notif = await createDeadlineReminder(app.user, app, daysLeft, nowStr);
        if (notif) createdCount++;
      }
    }
  } catch (error) {
    console.error('Error processing application deadline reminders:', error.message);
  }
  return createdCount;
};

/**
 * Process application follow-up reminders
 * Checks applications where followUpDate is approaching or due (3, 1, 0 days)
 */
const processApplicationFollowupReminders = async () => {
  let createdCount = 0;
  try {
    const applications = await Application.find({
      status: { $nin: ['Rejected', 'Withdrawn'] },
      followUpDate: { $ne: null }
    });

    const nowStr = new Date().toISOString().split('T')[0];

    for (const app of applications) {
      const daysLeft = getDaysDifference(app.followUpDate);
      if (daysLeft !== null && [3, 1, 0].includes(daysLeft)) {
        const notif = await createFollowUpReminder(app.user, app, daysLeft, nowStr);
        if (notif) createdCount++;
      }
    }
  } catch (error) {
    console.error('Error processing application follow-up reminders:', error.message);
  }
  return createdCount;
};

/**
 * Process upcoming interview reminders
 * Checks interviews scheduled in the next 1-2 days that are not Cancelled or Completed
 */
const processInterviewReminders = async () => {
  let createdCount = 0;
  try {
    const upcomingInterviews = await Interview.find({
      status: 'Upcoming',
      scheduledDate: { $ne: null }
    });

    for (const interview of upcomingInterviews) {
      const daysLeft = getDaysDifference(interview.scheduledDate);
      if (daysLeft !== null && (daysLeft === 0 || daysLeft === 1 || daysLeft === 2)) {
        const timeDesc = daysLeft === 0 ? 'today' : daysLeft === 1 ? 'tomorrow' : 'in 2 days';
        const notif = await notifyInterviewUpcoming(interview.user, interview, timeDesc);
        if (notif) createdCount++;
      }
    }
  } catch (error) {
    console.error('Error processing interview reminders:', error.message);
  }
  return createdCount;
};

/**
 * Master reminder processor
 */
const runAllReminderJobs = async () => {
  console.log('⏰ Running CareerPilot Reminder Processing Job...');
  const deadlines = await processApplicationDeadlineReminders();
  const followups = await processApplicationFollowupReminders();
  const interviews = await processInterviewReminders();
  console.log(`✅ Reminder processing complete: ${deadlines} deadlines, ${followups} follow-ups, ${interviews} interviews processed.`);
  return { deadlines, followups, interviews };
};

/**
 * Safe reminder scheduler that runs periodically without crashing the server
 */
let reminderIntervalId = null;

const initReminderScheduler = (intervalMinutes = 60) => {
  if (reminderIntervalId) {
    clearInterval(reminderIntervalId);
  }

  // Run initial pass safely after 10 seconds of startup
  setTimeout(() => {
    runAllReminderJobs().catch((err) =>
      console.error('Reminder initial execution error:', err.message)
    );
  }, 10000);

  // Set recurring interval
  reminderIntervalId = setInterval(() => {
    runAllReminderJobs().catch((err) =>
      console.error('Reminder scheduled execution error:', err.message)
    );
  }, intervalMinutes * 60 * 1000);

  console.log(`⏱️ Reminder scheduler initialized (Interval: ${intervalMinutes} minutes).`);
};

module.exports = {
  getDaysDifference,
  processApplicationDeadlineReminders,
  processApplicationFollowupReminders,
  processInterviewReminders,
  runAllReminderJobs,
  initReminderScheduler
};
