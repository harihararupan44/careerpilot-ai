import React, { createContext, useContext, useState, useMemo, useEffect, useCallback } from 'react';
import { mockApplications } from '../data/mockApplications';
import { useToast } from './ToastContext';
import { useAuth } from './AuthContext';
import { applicationApi } from '../services/api';
import confetti from 'canvas-confetti';

const ApplicationContext = createContext(null);

export function ApplicationProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [applications, setApplications] = useState(mockApplications);
  const [backendStats, setBackendStats] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState('date-desc');
  const { addToast } = useToast();

  // Helper to map backend MongoDB application to rich UI schema
  const mapBackendAppToView = useCallback((app) => {
    if (!app) return null;
    const id = app.id || app._id;
    let salaryString = 'Competitive';
    if (app.salaryMin && app.salaryMax) {
      salaryString = `₹${(app.salaryMin / 100000).toFixed(1)}L - ₹${(app.salaryMax / 100000).toFixed(1)}L / yr`;
    } else if (app.salary) {
      salaryString = app.salary;
    }

    const interviewObj = app.interview || null;
    const scheduledDate = interviewObj?.scheduledDate || app.scheduledDate || null;
    const interviewType = interviewObj?.interviewType || app.interviewType || null;
    const interviewStatus = interviewObj?.status || (scheduledDate ? 'Upcoming' : null);
    const meetingUrl = interviewObj?.meetingUrl || app.meetingUrl || '';
    const interviewLocation = interviewObj?.location || app.interviewLocation || '';

    // Build realistic timeline
    const timeline = Array.isArray(app.timeline) && app.timeline.length > 0 ? [...app.timeline] : [
      { status: 'Applied', date: new Date(app.appliedDate || app.createdAt || Date.now()).toISOString().split('T')[0], note: 'Application submitted and tracked in pipeline' }
    ];

    if (scheduledDate) {
      const formattedInterviewTime = new Date(scheduledDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const formattedInterviewDate = new Date(scheduledDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      
      const hasInterviewTimeline = timeline.some(t => t.status === 'Interview Scheduled' || (t.note && t.note.includes(formattedInterviewDate)));
      if (!hasInterviewTimeline) {
        timeline.push({
          status: 'Interview Scheduled',
          date: new Date(scheduledDate).toISOString().split('T')[0],
          note: `Interview scheduled for ${formattedInterviewDate} at ${formattedInterviewTime}`,
          scheduledDate
        });
      }
    }

    return {
      ...app,
      id,
      _id: id,
      company: app.company || 'Unknown Company',
      jobTitle: app.jobTitle || 'Software Engineer',
      applicationUrl: app.applicationUrl || app.jobUrl || '',
      location: app.location || 'Remote',
      salary: salaryString,
      status: app.status || 'Applied',
      fitScore: app.fitScore || 85,
      appliedDate: app.appliedDate || app.createdAt || new Date().toISOString(),
      applicationDate: app.appliedDate ? new Date(app.appliedDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      deadline: app.deadline || null,
      followUpDate: app.followUpDate || null,
      interview: interviewObj,
      scheduledDate,
      interviewDate: scheduledDate,
      interviewType,
      interviewStatus,
      meetingUrl,
      interviewLocation,
      interviewRound: app.interviewRound || (app.status === 'Interview' ? `${interviewType || 'Technical'} Interview` : null),
      resumeUsed: app.resume?.fileName || app.resume?.title || 'Primary_Resume.pdf',
      matchingSkills: app.matchingSkills || ['React', 'JavaScript', 'Node.js', 'Git', 'REST APIs'],
      missingSkills: app.missingSkills || ['Kubernetes', 'Apache Kafka'],
      notes: app.notes || '',
      jobDescription: app.job?.description || 'Standard software engineering position requirements.',
      timeline
    };
  }, []);

  // Fetch applications from backend API
  const loadApplications = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setIsLoading(true);
      const [appsRes, statsRes] = await Promise.all([
        applicationApi.getApplications({ limit: 100 }),
        applicationApi.getApplicationStats()
      ]);

      if (appsRes.success && Array.isArray(appsRes.applications)) {
        const mapped = appsRes.applications.map(mapBackendAppToView);
        setApplications(mapped);
      }
      if (statsRes.success && statsRes.stats) {
        setBackendStats(statsRes.stats);
      }
    } catch (err) {
      console.warn('Could not fetch applications from backend, using fallback:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, mapBackendAppToView]);

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  const addApplication = async (newApp) => {
    const tempId = 'app-' + (Date.now().toString().slice(-4));
    const optimisticApp = {
      id: tempId,
      company: newApp.company || 'Unknown Company',
      jobTitle: newApp.jobTitle || 'Software Engineer',
      applicationUrl: newApp.applicationUrl || newApp.jobUrl || '',
      location: newApp.location || 'Remote',
      salary: newApp.salary || 'Competitive',
      status: newApp.status || 'Applied',
      fitScore: newApp.fitScore || 85,
      appliedDate: newApp.appliedDate || new Date().toISOString(),
      applicationDate: newApp.applicationDate || new Date().toISOString().split('T')[0],
      deadline: newApp.deadline || null,
      followUpDate: newApp.followUpDate || null,
      notes: newApp.notes || 'Added from application tracker',
      jobDescription: newApp.jobDescription || 'Standard software engineering position requirements.',
      matchingSkills: newApp.matchingSkills || ['React', 'JavaScript', 'Node.js', 'Git'],
      missingSkills: newApp.missingSkills || ['Kubernetes'],
      timeline: [
        { status: newApp.status || 'Applied', date: new Date().toISOString().split('T')[0], note: 'Application created in tracker' }
      ]
    };

    setApplications(prev => [optimisticApp, ...prev]);

    if (isAuthenticated) {
      try {
        const payload = {
          company: newApp.company,
          jobTitle: newApp.jobTitle,
          applicationUrl: newApp.applicationUrl || newApp.jobUrl || '',
          location: newApp.location || '',
          status: newApp.status || 'Applied',
          notes: newApp.notes || '',
          deadline: newApp.deadline || null,
          followUpDate: newApp.followUpDate || null,
          job: newApp.jobId || newApp.job?._id || newApp.job || null,
          resume: newApp.resumeId || newApp.resume?._id || newApp.resume || null
        };

        const res = await applicationApi.createApplication(payload);
        if (res.success && res.application) {
          const mapped = mapBackendAppToView(res.application);
          setApplications(prev => prev.map(a => a.id === tempId ? mapped : a));
          loadApplications();
          addToast({
            title: 'Application Added',
            message: `Successfully tracked ${mapped.company} (${mapped.jobTitle})`,
            type: 'success'
          });
          if (mapped.status === 'Offer') {
            try { confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } }); } catch (e) {}
          }
          return mapped;
        }
      } catch (err) {
        console.error('Error saving application to backend:', err);
        addToast({
          title: 'Saved Locally',
          message: err.message || 'Saved in local view',
          type: 'info'
        });
      }
    } else {
      addToast({
        title: 'Application Added',
        message: `Successfully tracked ${optimisticApp.company} (${optimisticApp.jobTitle})`,
        type: 'success'
      });
      if (optimisticApp.status === 'Offer') {
        try { confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } }); } catch (e) {}
      }
    }

    return optimisticApp;
  };

  const updateApplication = async (id, updatedFields) => {
    setApplications(prev => prev.map(app => {
      if (app.id === id || app._id === id) {
        return { ...app, ...updatedFields };
      }
      return app;
    }));

    if (isAuthenticated && id && !String(id).startsWith('app-')) {
      try {
        await applicationApi.updateApplication(id, updatedFields);
        loadApplications();
      } catch (err) {
        console.error('Failed to update application on backend:', err);
      }
    }

    addToast({
      title: 'Updated Application',
      message: 'Application details updated successfully.',
      type: 'info'
    });
  };

  const changeStatus = async (id, newStatus, note = '') => {
    setApplications(prev => prev.map(app => {
      if (app.id === id || app._id === id) {
        const updatedTimeline = [
          ...(app.timeline || []),
          {
            status: newStatus,
            date: new Date().toISOString().split('T')[0],
            note: note || `Status changed to ${newStatus}`
          }
        ];

        return {
          ...app,
          status: newStatus,
          timeline: updatedTimeline,
        };
      }
      return app;
    }));

    if (isAuthenticated && id && !String(id).startsWith('app-')) {
      try {
        await applicationApi.updateApplicationStatus(id, newStatus);
        loadApplications();
      } catch (err) {
        console.error('Failed to update status on backend:', err);
      }
    }

    if (newStatus === 'Offer') {
      try {
        confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
      } catch (e) {}
      addToast({
        title: '🎉 Congratulations on your Offer!',
        message: `Application status updated to Offer!`,
        type: 'success',
        duration: 6000
      });
    } else {
      addToast({
        title: 'Status Updated',
        message: `Moved to ${newStatus}`,
        type: 'info'
      });
    }
  };

  const deleteApplication = async (id) => {
    setApplications(prev => prev.filter(app => app.id !== id && app._id !== id));

    if (isAuthenticated && id && !String(id).startsWith('app-')) {
      try {
        await applicationApi.deleteApplication(id);
        loadApplications();
      } catch (err) {
        console.error('Failed to delete application on backend:', err);
      }
    }

    addToast({
      title: 'Application Removed',
      message: 'The application was removed from your tracker.',
      type: 'info'
    });
  };

  const updateNotes = async (id, notes) => {
    setApplications(prev => prev.map(app => {
      if (app.id === id || app._id === id) {
        return { ...app, notes };
      }
      return app;
    }));

    if (isAuthenticated && id && !String(id).startsWith('app-')) {
      try {
        await applicationApi.updateApplication(id, { notes });
      } catch (err) {
        console.error('Failed to update notes on backend:', err);
      }
    }

    addToast({
      title: 'Notes Saved',
      message: 'Your personal notes have been saved.',
      type: 'success'
    });
  };

  const getApplicationById = (id) => {
    return applications.find(app => app.id === id || app._id === id);
  };

  const stats = useMemo(() => {
    if (backendStats && isAuthenticated) {
      return {
        total: backendStats.total,
        interviews: backendStats.interview,
        offers: backendStats.offer,
        rejections: backendStats.rejected,
        assessments: backendStats.screening,
        applied: backendStats.applied,
        saved: backendStats.withdrawn,
        avgFitScore: 86,
        careerReadinessScore: 78,
        interviewRate: backendStats.interviewRate,
        offerRate: backendStats.offerRate,
        rejectionRate: backendStats.rejectionRate
      };
    }

    const total = applications.length;
    const interviews = applications.filter(a => a.status === 'Interview').length;
    const offers = applications.filter(a => a.status === 'Offer').length;
    const rejections = applications.filter(a => a.status === 'Rejected').length;
    const assessments = applications.filter(a => a.status === 'Assessment' || a.status === 'Screening').length;
    const applied = applications.filter(a => a.status === 'Applied').length;
    const saved = applications.filter(a => a.status === 'Saved' || a.status === 'Withdrawn').length;

    const totalFit = applications.reduce((sum, a) => sum + (a.fitScore || 0), 0);
    const avgFitScore = total ? Math.round(totalFit / total) : 0;

    return {
      total,
      interviews,
      offers,
      rejections,
      assessments,
      applied,
      saved,
      avgFitScore,
      careerReadinessScore: 76,
      interviewRate: total > 0 ? Math.round(((interviews + offers) / total) * 100) : 0,
      offerRate: total > 0 ? Math.round((offers / total) * 100) : 0,
      rejectionRate: total > 0 ? Math.round((rejections / total) * 100) : 0
    };
  }, [applications, backendStats, isAuthenticated]);

  const filteredApplications = useMemo(() => {
    return applications.filter(app => {
      const matchesSearch =
        app.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.jobTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.location?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'All' || app.status?.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    }).sort((a, b) => {
      if (sortBy === 'date-desc') {
        return new Date(b.appliedDate || b.applicationDate || 0) - new Date(a.appliedDate || a.applicationDate || 0);
      }
      if (sortBy === 'date-asc') {
        return new Date(a.appliedDate || a.applicationDate || 0) - new Date(b.appliedDate || b.applicationDate || 0);
      }
      if (sortBy === 'score-desc') {
        return (b.fitScore || 0) - (a.fitScore || 0);
      }
      if (sortBy === 'score-asc') {
        return (a.fitScore || 0) - (b.fitScore || 0);
      }
      if (sortBy === 'company') {
        return a.company.localeCompare(b.company);
      }
      return 0;
    });
  }, [applications, searchTerm, statusFilter, sortBy]);

  return (
    <ApplicationContext.Provider value={{
      applications,
      filteredApplications,
      stats,
      isLoading,
      searchTerm,
      setSearchTerm,
      statusFilter,
      setStatusFilter,
      sortBy,
      setSortBy,
      addApplication,
      updateApplication,
      changeStatus,
      deleteApplication,
      updateNotes,
      getApplicationById,
      mapBackendAppToView,
      refreshApplications: loadApplications
    }}>
      {children}
    </ApplicationContext.Provider>
  );
}

export function useApplications() {
  const context = useContext(ApplicationContext);
  if (!context) {
    throw new Error('useApplications must be used within an ApplicationProvider');
  }
  return context;
}
