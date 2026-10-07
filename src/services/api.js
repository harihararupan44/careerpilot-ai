import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Reusable Axios Client configured for CareerPilot AI
 */
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000 // 10s request timeout
});

/**
 * Request Interceptor to attach Authorization Bearer token automatically
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('careerpilot_token');
    if (
      token &&
      token !== 'undefined' &&
      token !== 'null' &&
      !token.startsWith('demo_jwt_token_')
    ) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Response Interceptor for centralized API error normalization
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle network / connection errors
    if (!error.response) {
      const customError = new Error(
        'Unable to connect to the CareerPilot server. Please ensure the backend is running.'
      );
      return Promise.reject(customError);
    }

    // Auto-clean invalid tokens on 401 Unauthorized
    if (error.response.status === 401) {
      const currentToken = localStorage.getItem('careerpilot_token');
      if (currentToken) {
        localStorage.removeItem('careerpilot_token');
        localStorage.removeItem('careerpilot_user');
      }
    }

    // Extract message from backend response
    const message =
      error.response.data?.message ||
      error.response.data?.error ||
      'An unexpected error occurred. Please try again.';

    const customError = new Error(message);
    customError.statusCode = error.response.status;
    customError.data = error.response.data;

    return Promise.reject(customError);
  }
);

/**
 * Authentication API Service
 */
export const authApi = {
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  }
};

/**
 * User & Career Profile API Service
 */
export const profileApi = {
  getProfile: async () => {
    const response = await api.get('/users/profile');
    return response.data;
  },

  updateProfile: async (profileData) => {
    const response = await api.put('/users/profile', profileData);
    return response.data;
  }
};

/**
 * Resume Management API Service
 */
export const resumeApi = {
  getResumes: async () => {
    const response = await api.get('/resumes');
    return response.data;
  },

  getResumeById: async (id) => {
    const response = await api.get(`/resumes/${id}`);
    return response.data;
  },

  createResume: async (resumeData) => {
    const response = await api.post('/resumes', resumeData);
    return response.data;
  },

  updateResume: async (id, resumeData) => {
    const response = await api.put(`/resumes/${id}`, resumeData);
    return response.data;
  },

  deleteResume: async (id) => {
    const response = await api.delete(`/resumes/${id}`);
    return response.data;
  },

  setActiveResume: async (id) => {
    const response = await api.put(`/resumes/${id}/active`);
    return response.data;
  }
};

/**
 * Jobs & Job Intelligence API Service
 */
export const jobApi = {
  getJobs: async (params = {}) => {
    const response = await api.get('/jobs', { params });
    return response.data;
  },

  getJobById: async (id) => {
    const response = await api.get(`/jobs/${id}`);
    return response.data;
  },

  getSavedJobs: async () => {
    const response = await api.get('/jobs/saved');
    return response.data;
  },

  checkSavedJob: async (id) => {
    const response = await api.get(`/jobs/${id}/saved`);
    return response.data;
  },

  saveJob: async (id) => {
    const response = await api.post(`/jobs/${id}/save`);
    return response.data;
  },

  unsaveJob: async (id) => {
    const response = await api.delete(`/jobs/${id}/save`);
    return response.data;
  },

  createJob: async (jobData) => {
    const response = await api.post('/jobs', jobData);
    return response.data;
  },

  updateJob: async (id, jobData) => {
    const response = await api.put(`/jobs/${id}`, jobData);
    return response.data;
  },

  deleteJob: async (id) => {
    const response = await api.delete(`/jobs/${id}`);
    return response.data;
  }
};

/**
 * Application Tracker API Service
 */
export const applicationApi = {
  getApplications: async (params = {}) => {
    const response = await api.get('/applications', { params });
    return response.data;
  },

  getApplicationById: async (id) => {
    const response = await api.get(`/applications/${id}`);
    return response.data;
  },

  getApplicationStats: async () => {
    const response = await api.get('/applications/stats');
    return response.data;
  },

  createApplication: async (applicationData) => {
    const response = await api.post('/applications', applicationData);
    return response.data;
  },

  updateApplication: async (id, applicationData) => {
    const response = await api.put(`/applications/${id}`, applicationData);
    return response.data;
  },

  updateApplicationStatus: async (id, status) => {
    const response = await api.patch(`/applications/${id}/status`, { status });
    return response.data;
  },

  deleteApplication: async (id) => {
    const response = await api.delete(`/applications/${id}`);
    return response.data;
  }
};

/**
 * Interview Preparation API Service
 */
export const interviewApi = {
  getInterviews: async (params = {}) => {
    const response = await api.get('/interviews', { params });
    return response.data;
  },

  getInterviewById: async (id) => {
    const response = await api.get(`/interviews/${id}`);
    return response.data;
  },

  createInterview: async (interviewData) => {
    const response = await api.post('/interviews', interviewData);
    return response.data;
  },

  updateInterview: async (id, interviewData) => {
    const response = await api.put(`/interviews/${id}`, interviewData);
    return response.data;
  },

  updateInterviewStatus: async (id, status) => {
    const response = await api.patch(`/interviews/${id}/status`, { status });
    return response.data;
  },

  updatePreparationProgress: async (id, preparationProgress) => {
    const response = await api.patch(`/interviews/${id}/progress`, { preparationProgress });
    return response.data;
  },

  deleteInterview: async (id) => {
    const response = await api.delete(`/interviews/${id}`);
    return response.data;
  }
};

/**
 * Interview Question Bank API Service
 */
export const interviewQuestionApi = {
  getQuestions: async (params = {}) => {
    const response = await api.get('/interview-questions', { params });
    return response.data;
  },

  getQuestionById: async (id) => {
    const response = await api.get(`/interview-questions/${id}`);
    return response.data;
  },

  createQuestion: async (questionData) => {
    const response = await api.post('/interview-questions', questionData);
    return response.data;
  },

  updateQuestion: async (id, questionData) => {
    const response = await api.put(`/interview-questions/${id}`, questionData);
    return response.data;
  },

  deleteQuestion: async (id) => {
    const response = await api.delete(`/interview-questions/${id}`);
    return response.data;
  }
};

/**
 * Mock Interview API Service
 */
export const mockInterviewApi = {
  getMockInterviews: async (params = {}) => {
    const response = await api.get('/mock-interviews', { params });
    return response.data;
  },

  getMockInterviewById: async (id) => {
    const response = await api.get(`/mock-interviews/${id}`);
    return response.data;
  },

  createMockInterview: async (sessionData) => {
    const response = await api.post('/mock-interviews', sessionData);
    return response.data;
  },

  startMockInterview: async (id) => {
    const response = await api.post(`/mock-interviews/${id}/start`);
    return response.data;
  },

  submitMockAnswer: async (id, answerData) => {
    const response = await api.patch(`/mock-interviews/${id}/answer`, answerData);
    return response.data;
  },

  completeMockInterview: async (id, completionData = {}) => {
    const response = await api.post(`/mock-interviews/${id}/complete`, completionData);
    return response.data;
  },

  deleteMockInterview: async (id) => {
    const response = await api.delete(`/mock-interviews/${id}`);
    return response.data;
  }
};

/**
 * Community & Public People API Service
 */
export const peopleApi = {
  getPeople: async (params = {}) => {
    const response = await api.get('/people', { params });
    return response.data;
  },

  getPublicProfile: async (id) => {
    const response = await api.get(`/people/${id}`);
    return response.data;
  },

  getConnectionStatus: async (id) => {
    const response = await api.get(`/people/${id}/connection-status`);
    return response.data;
  },

  connect: async (id) => {
    const response = await api.post(`/people/${id}/connect`);
    return response.data;
  },

  getRequests: async (params = {}) => {
    const response = await api.get('/people/requests', { params });
    return response.data;
  },

  acceptRequest: async (id) => {
    const response = await api.patch(`/people/requests/${id}/accept`);
    return response.data;
  },

  rejectRequest: async (id) => {
    const response = await api.patch(`/people/requests/${id}/reject`);
    return response.data;
  },

  cancelRequest: async (id) => {
    const response = await api.delete(`/people/requests/${id}/cancel`);
    return response.data;
  },

  getConnections: async (params = {}) => {
    const response = await api.get('/people/connections', { params });
    return response.data;
  },

  removeConnection: async (id) => {
    const response = await api.delete(`/people/connections/${id}`);
    return response.data;
  }
};

/**
 * Interview Experiences API Service (Module 9)
 */
export const interviewExperiencesApi = {
  getExperiences: async (params = {}) => {
    const response = await api.get('/interview-experiences', { params });
    return response.data;
  },

  getExperience: async (id) => {
    const response = await api.get(`/interview-experiences/${id}`);
    return response.data;
  },

  createExperience: async (data) => {
    const response = await api.post('/interview-experiences', data);
    return response.data;
  },

  updateExperience: async (id, data) => {
    const response = await api.put(`/interview-experiences/${id}`, data);
    return response.data;
  },

  deleteExperience: async (id) => {
    const response = await api.delete(`/interview-experiences/${id}`);
    return response.data;
  },

  toggleHelpful: async (id) => {
    const response = await api.post(`/interview-experiences/${id}/helpful`);
    return response.data;
  },

  getMyExperiences: async (params = {}) => {
    const response = await api.get('/interview-experiences/me', { params });
    return response.data;
  }
};

export const communityApi = peopleApi;
export const interviewExperienceApi = interviewExperiencesApi;

/**
 * Career Guidance & Guidance Requests API Service (Module 10)
 */
export const guidanceApi = {
  getGuidancePeople: async (params = {}) => {
    const response = await api.get('/guidance/people', { params });
    return response.data;
  },

  getGuidanceProfile: async (id) => {
    const response = await api.get(`/guidance/people/${id}`);
    return response.data;
  },

  sendGuidanceRequest: async (data) => {
    const response = await api.post('/guidance/requests', data);
    return response.data;
  },

  getSentGuidanceRequests: async (params = {}) => {
    const response = await api.get('/guidance/requests/sent', { params });
    return response.data;
  },

  getReceivedGuidanceRequests: async (params = {}) => {
    const response = await api.get('/guidance/requests/received', { params });
    return response.data;
  },

  getGuidanceRequest: async (id) => {
    const response = await api.get(`/guidance/requests/${id}`);
    return response.data;
  },

  acceptGuidanceRequest: async (id, data = {}) => {
    const response = await api.patch(`/guidance/requests/${id}/accept`, data);
    return response.data;
  },

  rejectGuidanceRequest: async (id, data = {}) => {
    const response = await api.patch(`/guidance/requests/${id}/reject`, data);
    return response.data;
  },

  cancelGuidanceRequest: async (id) => {
    const response = await api.delete(`/guidance/requests/${id}/cancel`);
    return response.data;
  },

  completeGuidanceRequest: async (id) => {
    const response = await api.patch(`/guidance/requests/${id}/complete`);
    return response.data;
  }
};

/**
 * Companies & Company Intelligence API Service (Module 11)
 */
export const companyApi = {
  getCompanies: async (params = {}) => {
    const response = await api.get('/companies', { params });
    return response.data;
  },

  getCompany: async (id) => {
    const response = await api.get(`/companies/${id}`);
    return response.data;
  },

  getCompanyJobs: async (id, params = {}) => {
    const response = await api.get(`/companies/${id}/jobs`, { params });
    return response.data;
  },

  getCompanyExperiences: async (id, params = {}) => {
    const response = await api.get(`/companies/${id}/interview-experiences`, { params });
    return response.data;
  },

  getCompanyPeople: async (id, params = {}) => {
    const response = await api.get(`/companies/${id}/people`, { params });
    return response.data;
  },

  getCompanyStats: async (id) => {
    const response = await api.get(`/companies/${id}/stats`);
    return response.data;
  },

  saveCompany: async (id) => {
    const response = await api.post(`/companies/${id}/save`);
    return response.data;
  },

  unsaveCompany: async (id) => {
    const response = await api.delete(`/companies/${id}/save`);
    return response.data;
  },

  getSavedCompanies: async () => {
    const response = await api.get('/companies/saved');
    return response.data;
  },

  checkSavedCompany: async (id) => {
    const response = await api.get(`/companies/${id}/saved`);
    return response.data;
  },

  checkSaved: async (id) => {
    const response = await api.get(`/companies/${id}/saved`);
    return response.data;
  },

  createCompany: async (data) => {
    const response = await api.post('/companies', data);
    return response.data;
  },

  updateCompany: async (id, data) => {
    const response = await api.put(`/companies/${id}`, data);
    return response.data;
  },

  deactivateCompany: async (id) => {
    const response = await api.delete(`/companies/${id}`);
    return response.data;
  }
};

/**
 * Dashboard API Service (Module 12)
 */
export const dashboardApi = {
  getSummary: async () => {
    const response = await api.get('/dashboard/summary');
    return response.data;
  },

  getActivity: async (params = {}) => {
    const response = await api.get('/dashboard/activity', { params });
    return response.data;
  },

  getProgress: async () => {
    const response = await api.get('/dashboard/progress');
    return response.data;
  }
};

/**
 * Analytics API Service (Module 12)
 */
export const analyticsApi = {
  getOverview: async () => {
    const response = await api.get('/analytics/overview');
    return response.data;
  },

  getApplicationAnalytics: async () => {
    const response = await api.get('/analytics/applications');
    return response.data;
  },

  getInterviewAnalytics: async () => {
    const response = await api.get('/analytics/interviews');
    return response.data;
  },

  getProfileAnalytics: async () => {
    const response = await api.get('/analytics/profile');
    return response.data;
  },

  getSavedJobAnalytics: async () => {
    const response = await api.get('/analytics/saved-jobs');
    return response.data;
  }
};

/**
 * AI Career Intelligence API Service (Module 13)
 */
export const aiApi = {
  analyzeResume: async (data) => {
    const response = await api.post('/ai/resume/analyze', data);
    return response.data;
  },

  improveResume: async (data) => {
    const response = await api.post('/ai/resume/improve', data);
    return response.data;
  },

  analyzeJob: async (data) => {
    const response = await api.post('/ai/job/analyze', data);
    return response.data;
  },

  matchResumeJob: async (data) => {
    const response = await api.post('/ai/job/match', data);
    return response.data;
  },

  analyzeSkillGap: async (data) => {
    const response = await api.post('/ai/career/skill-gap', data);
    return response.data;
  },

  getCareerRecommendations: async (data = {}) => {
    const response = await api.post('/ai/career/recommendations', data);
    return response.data;
  },

  generateInterviewQuestions: async (data) => {
    const response = await api.post('/ai/interview/questions', data);
    return response.data;
  },

  evaluateInterviewFeedback: async (data) => {
    const response = await api.post('/ai/interview/feedback', data);
    return response.data;
  },

  evaluateMockInterviewSession: async (data) => {
    const response = await api.post('/ai/mock-interview/feedback', data);
    return response.data;
  }
};

/**
 * Notifications & Reminders API Service (Module 14)
 */
export const notificationApi = {
  getNotifications: async (params = {}) => {
    const response = await api.get('/notifications', { params });
    return response.data;
  },

  getUnreadCount: async () => {
    const response = await api.get('/notifications/unread-count');
    return response.data;
  },

  markAsRead: async (id) => {
    const response = await api.patch(`/notifications/${id}/read`);
    return response.data;
  },

  markAllAsRead: async () => {
    const response = await api.patch('/notifications/read-all');
    return response.data;
  },

  deleteNotification: async (id) => {
    const response = await api.delete(`/notifications/${id}`);
    return response.data;
  },

  deleteAllRead: async () => {
    const response = await api.delete('/notifications/read');
    return response.data;
  }
};

export default api;



