const mongoose = require('mongoose');
const User = require('../models/User');
const Profile = require('../models/Profile');
const Resume = require('../models/Resume');
const Job = require('../models/Job');
const SavedJob = require('../models/SavedJob');
const Application = require('../models/Application');
const Interview = require('../models/Interview');
const MockInterview = require('../models/MockInterview');
const InterviewExperience = require('../models/InterviewExperience');
const GuidanceRequest = require('../models/GuidanceRequest');
const Connection = require('../models/Connection');
const SavedCompany = require('../models/SavedCompany');

/**
 * 1. Calculate Profile Completion (0 - 100%)
 */
const calculateProfileCompletion = (profile) => {
  if (!profile) return 0;

  let score = 0;

  // Education / College (25 points)
  if (profile.college && profile.college.trim().length > 0) score += 10;
  if (profile.degree && profile.degree.trim().length > 0) score += 5;
  if (profile.branch && profile.branch.trim().length > 0) score += 5;
  if (profile.graduationYear) score += 5;

  // Basic Info & Location (15 points)
  if (profile.location && profile.location.trim().length > 0) score += 5;
  if (profile.bio && profile.bio.trim().length > 10) score += 10;

  // Career Target & Skills (25 points)
  if (profile.targetRole && profile.targetRole.trim().length > 0) score += 10;
  if (Array.isArray(profile.skills) && profile.skills.length > 0) {
    score += profile.skills.length >= 3 ? 15 : profile.skills.length * 5;
  }

  // Projects (15 points)
  if (Array.isArray(profile.projects) && profile.projects.length > 0) {
    score += profile.projects.length >= 2 ? 15 : 10;
  }

  // Career Interests & Summary (5 points)
  if (Array.isArray(profile.careerInterests) && profile.careerInterests.length > 0) {
    score += 5;
  }

  // Social / Portfolio Links (15 points)
  let linksScore = 0;
  if (profile.github && profile.github.trim().length > 0) linksScore += 5;
  if (profile.linkedin && profile.linkedin.trim().length > 0) linksScore += 5;
  if (profile.portfolio && profile.portfolio.trim().length > 0) linksScore += 5;
  score += Math.min(15, linksScore);

  return Math.min(100, Math.max(0, score));
};

/**
 * 2. Calculate Dynamic Career Readiness Score (0 - 100%)
 */
const calculateCareerReadiness = (profileCompletion, hasResume, totalApplications, interviewsCount, prepProgress) => {
  let score = 0;

  // Profile completeness contributes up to 30%
  score += (profileCompletion / 100) * 30;

  // Active resume presence contributes up to 25%
  if (hasResume) score += 25;

  // Active application pipeline contributes up to 20%
  if (totalApplications >= 5) score += 20;
  else score += totalApplications * 4;

  // Interview preparation / mock interviews contribute up to 25%
  if (interviewsCount > 0) {
    score += 10 + (Math.min(100, prepProgress) / 100) * 15;
  } else {
    score += 5; // Base exploration points
  }

  return Math.min(100, Math.round(score));
};

/**
 * 3. Application Analytics
 */
const getApplicationAnalytics = async (userId) => {
  const applications = await Application.find({ user: userId }).sort({ appliedDate: -1, createdAt: -1 });

  const total = applications.length;

  const byStatus = {
    Applied: 0,
    Screening: 0,
    Interview: 0,
    Offer: 0,
    Rejected: 0,
    Withdrawn: 0
  };

  let totalFitScore = 0;
  let fitScoreCount = 0;

  applications.forEach((app) => {
    const status = app.status || 'Applied';
    if (byStatus.hasOwnProperty(status)) {
      byStatus[status]++;
    } else if (status === 'Assessment') {
      byStatus.Screening++;
    } else if (status === 'Saved') {
      byStatus.Withdrawn++;
    } else {
      byStatus.Applied++;
    }

    if (typeof app.fitScore === 'number' && app.fitScore > 0) {
      totalFitScore += app.fitScore;
      fitScoreCount++;
    } else {
      totalFitScore += 85; // Standard baseline match
      fitScoreCount++;
    }
  });

  const interviewCount = byStatus.Interview;
  const offerCount = byStatus.Offer;
  const rejectionCount = byStatus.Rejected;

  const rates = {
    interviewRate: total > 0 ? Math.round(((interviewCount + offerCount) / total) * 100) : 0,
    offerRate: total > 0 ? Math.round((offerCount / total) * 100) : 0,
    rejectionRate: total > 0 ? Math.round((rejectionCount / total) * 100) : 0,
    averageFitScore: fitScoreCount > 0 ? Math.round(totalFitScore / fitScoreCount) : 0
  };

  // Monthly breakdown for last 6 months
  const monthsMap = new Map();
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const now = new Date();

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    monthsMap.set(key, {
      month: monthNames[d.getMonth()],
      year: d.getFullYear(),
      count: 0,
      applications: 0,
      interviews: 0,
      offers: 0
    });
  }

  applications.forEach((app) => {
    const dateVal = app.appliedDate || app.createdAt;
    if (dateVal) {
      const d = new Date(dateVal);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (monthsMap.has(key)) {
        const item = monthsMap.get(key);
        item.count++;
        item.applications++;
        if (app.status === 'Interview') item.interviews++;
        if (app.status === 'Offer') item.offers++;
      }
    }
  });

  const monthly = Array.from(monthsMap.values());

  // Status Distribution for Recharts Donut
  const statusColors = {
    Interview: '#f59e0b',
    Offer: '#10b981',
    Screening: '#a855f7',
    Applied: '#3b82f6',
    Rejected: '#ef4444',
    Withdrawn: '#64748b'
  };

  const statusDistribution = Object.entries(byStatus)
    .filter(([_, count]) => count > 0)
    .map(([statusName, val]) => ({
      name: statusName,
      value: val,
      color: statusColors[statusName] || '#94a3b8'
    }));

  // Fit score correlation buckets
  const fitScoreTrends = [
    { range: '90-100%', applications: 0, interviews: 0, interviewRate: 0, label: '90-100%' },
    { range: '80-89%', applications: 0, interviews: 0, interviewRate: 0, label: '80-89%' },
    { range: '70-79%', applications: 0, interviews: 0, interviewRate: 0, label: '70-79%' },
    { range: '<70%', applications: 0, interviews: 0, interviewRate: 0, label: '<70%' }
  ];

  applications.forEach((app) => {
    const score = app.fitScore || 85;
    const isInterview = app.status === 'Interview' || app.status === 'Offer';
    let bucket = fitScoreTrends[3];
    if (score >= 90) bucket = fitScoreTrends[0];
    else if (score >= 80) bucket = fitScoreTrends[1];
    else if (score >= 70) bucket = fitScoreTrends[2];

    bucket.applications++;
    if (isInterview) bucket.interviews++;
  });

  fitScoreTrends.forEach((b) => {
    b.interviewRate = b.applications > 0 ? Math.round((b.interviews / b.applications) * 100) : 0;
  });

  // Upcoming deadlines and follow-ups
  const upcomingDeadlines = applications
    .filter((a) => a.deadline && new Date(a.deadline) >= new Date())
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
    .slice(0, 5);

  const followUps = applications
    .filter((a) => a.followUpDate)
    .sort((a, b) => new Date(a.followUpDate) - new Date(b.followUpDate))
    .slice(0, 5);

  return {
    total,
    byStatus,
    rates,
    monthly,
    statusDistribution,
    fitScoreTrends,
    upcomingDeadlines,
    followUps
  };
};

/**
 * 4. Interview Analytics
 */
const getInterviewAnalytics = async (userId) => {
  const interviews = await Interview.find({ user: userId }).sort({ scheduledDate: 1, createdAt: -1 });

  const total = interviews.length;

  const byStatus = {
    Upcoming: 0,
    Completed: 0,
    Cancelled: 0
  };

  const byType = {
    HR: 0,
    Technical: 0,
    Behavioral: 0,
    Managerial: 0,
    Mixed: 0
  };

  let totalPrep = 0;

  interviews.forEach((item) => {
    if (byStatus.hasOwnProperty(item.status)) {
      byStatus[item.status]++;
    } else {
      byStatus.Upcoming++;
    }

    if (byType.hasOwnProperty(item.interviewType)) {
      byType[item.interviewType]++;
    } else {
      byType.Mixed++;
    }

    totalPrep += item.preparationProgress || 0;
  });

  const averagePreparationProgress = total > 0 ? Math.round(totalPrep / total) : 0;

  const upcoming = interviews
    .filter((i) => i.status === 'Upcoming')
    .sort((a, b) => new Date(a.scheduledDate || 0) - new Date(b.scheduledDate || 0))
    .slice(0, 5);

  return {
    total,
    byStatus,
    byType,
    averagePreparationProgress,
    upcoming
  };
};

/**
 * 5. Profile & Resume Analytics
 */
const getProfileAndResumeAnalytics = async (userId) => {
  const [profile, resumes] = await Promise.all([
    Profile.findOne({ user: userId }),
    Resume.find({ user: userId }).sort({ updatedAt: -1 })
  ]);

  const profileCompletion = calculateProfileCompletion(profile);

  const activeResume = resumes.find((r) => r.isActive) || resumes[0] || null;

  const profileData = {
    exists: Boolean(profile),
    skills: profile?.skills?.length || 0,
    projects: profile?.projects?.length || 0,
    certifications: activeResume?.certifications?.length || 0,
    achievements: (profile?.achievementSummary ? 1 : 0) + (activeResume?.achievements?.length || 0),
    careerInterests: profile?.careerInterests?.length || 0,
    college: profile?.college || '',
    degree: profile?.degree || '',
    location: profile?.location || '',
    targetRole: profile?.targetRole || ''
  };

  const resumeData = {
    total: resumes.length,
    active: Boolean(activeResume),
    activeResumeId: activeResume ? (activeResume._id || activeResume.id) : null,
    activeResumeTitle: activeResume ? activeResume.title : null
  };

  return {
    profileCompletion,
    profile: profileData,
    resumes: resumeData
  };
};

/**
 * 6. Saved Jobs Analytics
 */
const getSavedJobAnalytics = async (userId) => {
  const savedJobs = await SavedJob.find({ user: userId }).populate('job').sort({ createdAt: -1 });

  const total = savedJobs.length;

  const byWorkMode = {
    'On-site': 0,
    Remote: 0,
    Hybrid: 0
  };

  const byEmploymentType = {
    'Full-time': 0,
    'Part-time': 0,
    Internship: 0,
    Contract: 0
  };

  const byLocation = {};

  savedJobs.forEach((sj) => {
    const job = sj.job;
    if (job) {
      if (job.workMode && byWorkMode.hasOwnProperty(job.workMode)) {
        byWorkMode[job.workMode]++;
      } else {
        byWorkMode['On-site']++;
      }

      if (job.jobType && byEmploymentType.hasOwnProperty(job.jobType)) {
        byEmploymentType[job.jobType]++;
      } else {
        byEmploymentType['Full-time']++;
      }

      if (job.location) {
        const loc = job.location.split(',')[0].trim();
        byLocation[loc] = (byLocation[loc] || 0) + 1;
      }
    }
  });

  const recentlySaved = savedJobs.slice(0, 5).map((sj) => ({
    id: sj._id,
    job: sj.job,
    savedAt: sj.createdAt
  }));

  return {
    total,
    byWorkMode,
    byEmploymentType,
    byLocation,
    recentlySaved
  };
};

/**
 * 7. Career Activity Feed (Chronologically derived from real models)
 */
const getCareerActivity = async (userId, limit = 15) => {
  const [
    applications,
    interviews,
    resumes,
    experiences,
    guidanceSent,
    guidanceReceived,
    savedJobs,
    savedCompanies
  ] = await Promise.all([
    Application.find({ user: userId }).sort({ updatedAt: -1 }).limit(10),
    Interview.find({ user: userId }).sort({ updatedAt: -1 }).limit(10),
    Resume.find({ user: userId }).sort({ updatedAt: -1 }).limit(5),
    InterviewExperience.find({ user: userId }).sort({ createdAt: -1 }).limit(5),
    GuidanceRequest.find({ requester: userId }).sort({ updatedAt: -1 }).limit(5),
    GuidanceRequest.find({ mentor: userId }).sort({ updatedAt: -1 }).limit(5),
    SavedJob.find({ user: userId }).populate('job').sort({ createdAt: -1 }).limit(5),
    SavedCompany.find({ user: userId }).populate('company').sort({ createdAt: -1 }).limit(5)
  ]);

  const activities = [];

  // Application activities
  applications.forEach((app) => {
    activities.push({
      id: `app-${app._id}`,
      type: 'application',
      action: app.status === 'Applied' ? 'applied' : 'status_updated',
      title: `${app.status}: ${app.jobTitle} at ${app.company}`,
      description: `Tracked application in ${app.location || 'pipeline'} with status "${app.status}".`,
      date: app.updatedAt || app.appliedDate || app.createdAt,
      link: `/applications/${app._id}`
    });
  });

  // Interview activities
  interviews.forEach((intvw) => {
    activities.push({
      id: `int-${intvw._id}`,
      type: 'interview',
      action: intvw.status === 'Completed' ? 'completed' : 'scheduled',
      title: `${intvw.interviewType} Interview at ${intvw.company}`,
      description: `Interview for ${intvw.jobTitle} is ${intvw.status.toLowerCase()}.`,
      date: intvw.scheduledDate || intvw.updatedAt || intvw.createdAt,
      link: `/interview/${intvw.application || intvw._id}`
    });
  });

  // Resume activities
  resumes.forEach((res) => {
    activities.push({
      id: `res-${res._id}`,
      type: 'resume',
      action: 'updated',
      title: `Resume Updated: ${res.title}`,
      description: `Targeting role skills with ${res.skills?.length || 0} highlighted skills.`,
      date: res.updatedAt || res.createdAt,
      link: '/resume'
    });
  });

  // Experience activities
  experiences.forEach((exp) => {
    activities.push({
      id: `exp-${exp._id}`,
      type: 'experience',
      action: 'published',
      title: `Shared Interview Experience at ${exp.companyName}`,
      description: `Contributed insights for ${exp.jobTitle} role.`,
      date: exp.createdAt,
      link: `/interviews/${exp._id}`
    });
  });

  // Guidance Sent
  guidanceSent.forEach((g) => {
    activities.push({
      id: `g-sent-${g._id}`,
      type: 'guidance',
      action: 'sent',
      title: `Guidance Request on "${g.topic}"`,
      description: `Status: ${g.status} with mentor.`,
      date: g.updatedAt || g.createdAt,
      link: '/guidance'
    });
  });

  // Guidance Received
  guidanceReceived.forEach((g) => {
    activities.push({
      id: `g-rec-${g._id}`,
      type: 'guidance',
      action: 'received',
      title: `Received Guidance Request on "${g.topic}"`,
      description: `Status: ${g.status}.`,
      date: g.updatedAt || g.createdAt,
      link: '/guidance'
    });
  });

  // Saved Jobs
  savedJobs.forEach((sj) => {
    if (sj.job) {
      activities.push({
        id: `sj-${sj._id}`,
        type: 'saved_job',
        action: 'bookmarked',
        title: `Saved Job: ${sj.job.title} at ${sj.job.company}`,
        description: `Saved for future application.`,
        date: sj.createdAt,
        link: `/jobs/${sj.job._id}`
      });
    }
  });

  // Saved Companies
  savedCompanies.forEach((sc) => {
    if (sc.company) {
      activities.push({
        id: `sc-${sc._id}`,
        type: 'saved_company',
        action: 'bookmarked',
        title: `Saved Company: ${sc.company.name}`,
        description: `Bookmarked company intelligence profile.`,
        date: sc.createdAt,
        link: `/companies/${sc.company._id}`
      });
    }
  });

  // Sort newest first
  activities.sort((a, b) => new Date(b.date) - new Date(a.date));

  return activities.slice(0, limit);
};

/**
 * 8. Career Progress Metrics
 */
const getCareerProgress = async (userId) => {
  const [
    profileAndResume,
    applicationsCount,
    interviewsCount,
    experiencesCount,
    connectionsCount,
    guidanceRequestsCompleted
  ] = await Promise.all([
    getProfileAndResumeAnalytics(userId),
    Application.countDocuments({ user: userId }),
    Interview.countDocuments({ user: userId }),
    InterviewExperience.countDocuments({ user: userId }),
    Connection.countDocuments({
      $or: [{ sender: userId }, { receiver: userId }],
      status: 'Accepted'
    }),
    GuidanceRequest.countDocuments({
      $or: [{ requester: userId }, { mentor: userId }],
      status: 'Completed'
    })
  ]);

  const profileCompletion = profileAndResume.profileCompletion;
  const resumeCompletion = profileAndResume.resumes.active ? 85 : (profileAndResume.resumes.total > 0 ? 50 : 0);

  return {
    profileCompletion,
    resumeCompletion,
    applications: applicationsCount,
    interviews: interviewsCount,
    interviewExperiences: experiencesCount,
    connections: connectionsCount,
    guidanceRequestsCompleted
  };
};

/**
 * 9. Dashboard Summary
 */
const getDashboardSummary = async (userId) => {
  const [
    appAnalytics,
    intvwAnalytics,
    profResumeAnalytics,
    savedJobsCount,
    experiencesCount,
    guidanceSent,
    guidanceReceived,
    guidancePending,
    guidanceAccepted,
    connectionsCount
  ] = await Promise.all([
    getApplicationAnalytics(userId),
    getInterviewAnalytics(userId),
    getProfileAndResumeAnalytics(userId),
    SavedJob.countDocuments({ user: userId }),
    InterviewExperience.countDocuments({ user: userId }),
    GuidanceRequest.countDocuments({ requester: userId }),
    GuidanceRequest.countDocuments({ mentor: userId }),
    GuidanceRequest.countDocuments({ $or: [{ requester: userId }, { mentor: userId }], status: 'Pending' }),
    GuidanceRequest.countDocuments({ $or: [{ requester: userId }, { mentor: userId }], status: 'Accepted' }),
    Connection.countDocuments({ $or: [{ sender: userId }, { receiver: userId }], status: 'Accepted' })
  ]);

  const readinessScore = calculateCareerReadiness(
    profResumeAnalytics.profileCompletion,
    profResumeAnalytics.resumes.active,
    appAnalytics.total,
    intvwAnalytics.total,
    intvwAnalytics.averagePreparationProgress
  );

  return {
    applications: {
      total: appAnalytics.total,
      applied: appAnalytics.byStatus.Applied,
      screening: appAnalytics.byStatus.Screening,
      interview: appAnalytics.byStatus.Interview,
      offer: appAnalytics.byStatus.Offer,
      rejected: appAnalytics.byStatus.Rejected,
      withdrawn: appAnalytics.byStatus.Withdrawn,
      interviewRate: appAnalytics.rates.interviewRate,
      offerRate: appAnalytics.rates.offerRate,
      rejectionRate: appAnalytics.rates.rejectionRate,
      avgFitScore: appAnalytics.rates.averageFitScore
    },
    interviews: {
      total: intvwAnalytics.total,
      upcoming: intvwAnalytics.byStatus.Upcoming,
      completed: intvwAnalytics.byStatus.Completed,
      cancelled: intvwAnalytics.byStatus.Cancelled,
      averagePreparationProgress: intvwAnalytics.averagePreparationProgress
    },
    resumes: {
      total: profResumeAnalytics.resumes.total,
      active: profResumeAnalytics.resumes.active,
      activeResumeId: profResumeAnalytics.resumes.activeResumeId
    },
    savedJobs: savedJobsCount,
    interviewExperiences: experiencesCount,
    guidance: {
      sent: guidanceSent,
      received: guidanceReceived,
      pending: guidancePending,
      accepted: guidanceAccepted
    },
    connections: connectionsCount,
    profileCompletion: profResumeAnalytics.profileCompletion,
    careerReadinessScore: readinessScore,
    readiness: readinessScore
  };
};

/**
 * 10. Analytics Overview (For Career Analytics Page)
 */
const getAnalyticsOverview = async (userId) => {
  const [
    appAnalytics,
    intvwAnalytics,
    profResumeAnalytics,
    savedJobsAnalytics,
    connectionsCount,
    experiencesCount,
    guidanceSent,
    guidanceReceived,
    guidancePending,
    guidanceAccepted
  ] = await Promise.all([
    getApplicationAnalytics(userId),
    getInterviewAnalytics(userId),
    getProfileAndResumeAnalytics(userId),
    getSavedJobAnalytics(userId),
    Connection.countDocuments({ $or: [{ sender: userId }, { receiver: userId }], status: 'Accepted' }),
    InterviewExperience.countDocuments({ user: userId }),
    GuidanceRequest.countDocuments({ requester: userId }),
    GuidanceRequest.countDocuments({ mentor: userId }),
    GuidanceRequest.countDocuments({ $or: [{ requester: userId }, { mentor: userId }], status: 'Pending' }),
    GuidanceRequest.countDocuments({ $or: [{ requester: userId }, { mentor: userId }], status: 'Accepted' })
  ]);

  const readinessScore = calculateCareerReadiness(
    profResumeAnalytics.profileCompletion,
    profResumeAnalytics.resumes.active,
    appAnalytics.total,
    intvwAnalytics.total,
    intvwAnalytics.averagePreparationProgress
  );

  return {
    summary: {
      totalApplications: appAnalytics.total,
      interviews: appAnalytics.byStatus.Interview,
      offers: appAnalytics.byStatus.Offer,
      rejections: appAnalytics.byStatus.Rejected,
      assessments: appAnalytics.byStatus.Screening,
      saved: appAnalytics.byStatus.Withdrawn,
      withdrawn: appAnalytics.byStatus.Withdrawn,
      interviewRate: appAnalytics.rates.interviewRate,
      rejectionRate: appAnalytics.rates.rejectionRate,
      offerRate: appAnalytics.rates.offerRate,
      averageFitScore: appAnalytics.rates.averageFitScore,
      careerReadinessScore: readinessScore
    },
    applications: appAnalytics,
    interviews: intvwAnalytics,
    profile: profResumeAnalytics.profile,
    resumes: profResumeAnalytics.resumes,
    savedJobs: savedJobsAnalytics.total,
    connections: connectionsCount,
    interviewExperiences: experiencesCount,
    guidance: {
      sent: guidanceSent,
      received: guidanceReceived,
      pending: guidancePending,
      accepted: guidanceAccepted
    },
    applicationsOverTime: appAnalytics.monthly,
    statusDistribution: appAnalytics.statusDistribution,
    fitScoreTrends: appAnalytics.fitScoreTrends
  };
};

module.exports = {
  calculateProfileCompletion,
  calculateCareerReadiness,
  getApplicationAnalytics,
  getInterviewAnalytics,
  getProfileAndResumeAnalytics,
  getSavedJobAnalytics,
  getCareerActivity,
  getCareerProgress,
  getDashboardSummary,
  getAnalyticsOverview
};
