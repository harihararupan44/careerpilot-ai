const express = require('express');
const router = express.Router();

const healthRoutes = require('./healthRoutes');
const authRoutes = require('./authRoutes');
const profileRoutes = require('./profileRoutes');
const resumeRoutes = require('./resumeRoutes');
const jobRoutes = require('./jobRoutes');
const applicationRoutes = require('./applicationRoutes');
const interviewRoutes = require('./interviewRoutes');
const interviewQuestionRoutes = require('./interviewQuestionRoutes');
const mockInterviewRoutes = require('./mockInterviewRoutes');
const communityRoutes = require('./communityRoutes');
const interviewExperienceRoutes = require('./interviewExperienceRoutes');
const guidanceRoutes = require('./guidanceRoutes');
const companyRoutes = require('./companyRoutes');
const dashboardRoutes = require('./dashboardRoutes');
const analyticsRoutes = require('./analyticsRoutes');
const aiRoutes = require('./aiRoutes');
const notificationRoutes = require('./notificationRoutes');

// Mount health check route
router.use('/health', healthRoutes);

// Mount authentication routes
router.use('/auth', authRoutes);

// Mount AI career intelligence routes (Module 13)
router.use('/ai', aiRoutes);

// Mount user and career profile routes
router.use('/users', profileRoutes);

// Mount resume routes
router.use('/resumes', resumeRoutes);

// Mount job and saved job routes
router.use('/jobs', jobRoutes);

// Mount application tracker routes
router.use('/applications', applicationRoutes);

// Mount interview preparation routes
router.use('/interviews', interviewRoutes);

// Mount interview question bank routes
router.use('/interview-questions', interviewQuestionRoutes);

// Mount mock interview session routes
router.use('/mock-interviews', mockInterviewRoutes);

// Mount community & people routes
router.use('/people', communityRoutes);

// Mount interview experiences routes
router.use('/interview-experiences', interviewExperienceRoutes);

// Mount career guidance & guidance requests routes
router.use('/guidance', guidanceRoutes);

// Mount companies & company intelligence routes
router.use('/companies', companyRoutes);

// Mount dashboard routes (Module 12)
router.use('/dashboard', dashboardRoutes);

// Mount analytics routes (Module 12)
router.use('/analytics', analyticsRoutes);

// Mount notifications & reminders routes (Module 14)
router.use('/notifications', notificationRoutes);

// Root /api info route
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to CareerPilot AI REST API',
    documentation: '/api/health',
    endpoints: {
      health: '/api/health',
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        me: 'GET /api/auth/me (Protected)'
      },
      dashboard: {
        summary: 'GET /api/dashboard/summary (Protected)',
        activity: 'GET /api/dashboard/activity (Protected)',
        progress: 'GET /api/dashboard/progress (Protected)'
      },
      analytics: {
        overview: 'GET /api/analytics/overview (Protected)',
        applications: 'GET /api/analytics/applications (Protected)',
        interviews: 'GET /api/analytics/interviews (Protected)',
        profile: 'GET /api/analytics/profile (Protected)',
        savedJobs: 'GET /api/analytics/saved-jobs (Protected)'
      },
      users: {
        getProfile: 'GET /api/users/profile (Protected)',
        updateProfile: 'PUT /api/users/profile (Protected)'
      },
      resumes: {
        createResume: 'POST /api/resumes (Protected)',
        getResumes: 'GET /api/resumes (Protected)',
        getResumeById: 'GET /api/resumes/:id (Protected)',
        updateResume: 'PUT /api/resumes/:id (Protected)',
        deleteResume: 'DELETE /api/resumes/:id (Protected)',
        setActiveResume: 'PUT /api/resumes/:id/active (Protected)'
      },
      jobs: {
        getJobs: 'GET /api/jobs (Protected)',
        getJobById: 'GET /api/jobs/:id (Protected)',
        getSavedJobs: 'GET /api/jobs/saved (Protected)',
        checkSavedJob: 'GET /api/jobs/:id/saved (Protected)',
        saveJob: 'POST /api/jobs/:id/save (Protected)',
        unsaveJob: 'DELETE /api/jobs/:id/save (Protected)',
        createJob: 'POST /api/jobs (Admin Only)',
        updateJob: 'PUT /api/jobs/:id (Admin Only)',
        deleteJob: 'DELETE /api/jobs/:id (Admin Only)'
      },
      applications: {
        createApplication: 'POST /api/applications (Protected)',
        getApplications: 'GET /api/applications (Protected)',
        getApplicationStats: 'GET /api/applications/stats (Protected)',
        getApplicationById: 'GET /api/applications/:id (Protected)',
        updateApplication: 'PUT /api/applications/:id (Protected)',
        updateApplicationStatus: 'PATCH /api/applications/:id/status (Protected)',
        deleteApplication: 'DELETE /api/applications/:id (Protected)'
      },
      interviews: {
        createInterview: 'POST /api/interviews (Protected)',
        getInterviews: 'GET /api/interviews (Protected)',
        getInterviewById: 'GET /api/interviews/:id (Protected)',
        updateInterview: 'PUT /api/interviews/:id (Protected)',
        deleteInterview: 'DELETE /api/interviews/:id (Protected)',
        updateInterviewStatus: 'PATCH /api/interviews/:id/status (Protected)',
        updatePreparationProgress: 'PATCH /api/interviews/:id/progress (Protected)'
      },
      interviewQuestions: {
        getQuestions: 'GET /api/interview-questions (Protected)',
        getQuestionById: 'GET /api/interview-questions/:id (Protected)',
        createQuestion: 'POST /api/interview-questions (Admin Only)',
        updateQuestion: 'PUT /api/interview-questions/:id (Admin Only)',
        deleteQuestion: 'DELETE /api/interview-questions/:id (Admin Only)'
      },
      mockInterviews: {
        createMockInterview: 'POST /api/mock-interviews (Protected)',
        getMockInterviews: 'GET /api/mock-interviews (Protected)',
        getMockInterviewById: 'GET /api/mock-interviews/:id (Protected)',
        startMockInterview: 'POST /api/mock-interviews/:id/start (Protected)',
        submitMockAnswer: 'PATCH /api/mock-interviews/:id/answer (Protected)',
        completeMockInterview: 'POST /api/mock-interviews/:id/complete (Protected)',
        deleteMockInterview: 'DELETE /api/mock-interviews/:id (Protected)'
      },
      people: {
        getPeople: 'GET /api/people (Protected)',
        getPublicProfile: 'GET /api/people/:id (Protected)',
        getConnectionStatus: 'GET /api/people/:id/connection-status (Protected)',
        connect: 'POST /api/people/:id/connect (Protected)',
        getRequests: 'GET /api/people/requests (Protected)',
        acceptRequest: 'PATCH /api/people/requests/:id/accept (Protected)',
        rejectRequest: 'PATCH /api/people/requests/:id/reject (Protected)',
        cancelRequest: 'DELETE /api/people/requests/:id/cancel (Protected)',
        getConnections: 'GET /api/people/connections (Protected)',
        removeConnection: 'DELETE /api/people/connections/:id (Protected)'
      },
      guidance: {
        getMentors: 'GET /api/guidance/people (Protected)',
        getMentorById: 'GET /api/guidance/people/:id (Protected)',
        sendRequest: 'POST /api/guidance/requests (Protected)',
        getSentRequests: 'GET /api/guidance/requests/sent (Protected)',
        getReceivedRequests: 'GET /api/guidance/requests/received (Protected)'
      },
      companies: {
        getCompanies: 'GET /api/companies (Public/Protected)',
        getCompanyById: 'GET /api/companies/:id (Public/Protected)',
        getCompanyJobs: 'GET /api/companies/:id/jobs (Public/Protected)',
        getCompanyExperiences: 'GET /api/companies/:id/interview-experiences (Public/Protected)',
        getCompanyPeople: 'GET /api/companies/:id/people (Public/Protected)',
        getCompanyStats: 'GET /api/companies/:id/stats (Public/Protected)'
      }
    }
  });
});

module.exports = router;
