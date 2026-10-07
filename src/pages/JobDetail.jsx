import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Briefcase,
  ArrowLeft,
  MapPin,
  Calendar,
  DollarSign,
  ExternalLink,
  Bookmark,
  BookmarkCheck,
  Plus,
  Users,
  BookOpen,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Clock,
  Building2,
  Share2,
  ShieldCheck,
  Zap,
  Check
} from 'lucide-react';
import SkillBadge from '../components/common/SkillBadge';
import FitScore from '../components/common/FitScore';
import Card from '../components/common/Card';
import EmptyState from '../components/common/EmptyState';
import RequestGuidanceModal from '../components/people/RequestGuidanceModal';
import { mockJobsList } from '../data/mockJobs';
import { mockPeople } from '../data/mockPeople';
import { mockInterviewExperiences } from '../data/mockInterviewExperiences';
import { useApplications } from '../context/ApplicationContext';
import { useGuidance } from '../context/GuidanceContext';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { jobApi } from '../services/api';
import { formatDate } from '../utils/formatters';

export default function JobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addApplication } = useApplications();
  const { sendGuidanceRequest } = useGuidance();
  const { addToast } = useToast();

  const [job, setJob] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaved, setIsSaved] = useState(false);

  // Guidance Modal State
  const [selectedPersonForGuidance, setSelectedPersonForGuidance] = useState(null);
  const [isGuidanceModalOpen, setIsGuidanceModalOpen] = useState(false);

  // Helper to normalize salary display
  const formatSalary = (jobObj) => {
    if (!jobObj) return 'Competitive';
    if (jobObj.salaryMin && jobObj.salaryMax) {
      return `₹${(jobObj.salaryMin / 100000).toFixed(1)}L - ₹${(jobObj.salaryMax / 100000).toFixed(1)}L / yr`;
    }
    if (jobObj.salary) return jobObj.salary;
    return 'Competitive';
  };

  // Fetch job details from backend API
  const fetchJobDetails = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);

    try {
      if (isAuthenticated) {
        // 1. Fetch Job from API
        const res = await jobApi.getJobById(id);
        if (res.success && res.job) {
          setJob(res.job);
        } else {
          throw new Error('Job not found');
        }

        // 2. Check if job is saved
        try {
          const savedRes = await jobApi.checkSavedJob(id);
          if (savedRes.success) {
            setIsSaved(!!savedRes.saved);
          }
        } catch (savedErr) {
          console.warn('Could not verify saved state:', savedErr);
        }
      } else {
        // Fallback to mock data for unauthenticated browsing
        const fallback = mockJobsList.find((j) => j.id === id || j._id === id);
        if (fallback) {
          setJob(fallback);
        } else {
          setError('Job not found');
        }
      }
    } catch (err) {
      console.warn('Backend job fetch failed, checking mock fallback:', err);
      const fallback = mockJobsList.find((j) => j.id === id || j._id === id);
      if (fallback) {
        setJob(fallback);
      } else {
        setError(err.message || 'Unable to load job details');
      }
    } finally {
      setIsLoading(false);
    }
  }, [id, isAuthenticated]);

  useEffect(() => {
    fetchJobDetails();
  }, [fetchJobDetails]);

  // Save / Bookmark Toggle
  const handleToggleSave = async () => {
    if (!job) return;
    const jobId = job._id || job.id;
    const nextState = !isSaved;

    setIsSaved(nextState);

    if (isAuthenticated) {
      try {
        if (nextState) {
          await jobApi.saveJob(jobId);
          addToast({ title: 'Job Saved!', message: 'Bookmarked to your saved jobs.', type: 'success' });
        } else {
          await jobApi.unsaveJob(jobId);
          addToast({ title: 'Removed from Saved', message: 'Job unbookmarked.', type: 'info' });
        }
      } catch (err) {
        console.error('Error updating saved state:', err);
      }
    } else {
      addToast({
        title: nextState ? 'Job Saved (Local)' : 'Removed from Saved',
        message: nextState ? 'Job bookmarked.' : 'Job unbookmarked.',
        type: nextState ? 'success' : 'info'
      });
    }
  };

  // Track Application in Tracker
  const handleTrackApplication = () => {
    if (!job) return;
    const newApp = addApplication({
      company: job.company,
      jobTitle: job.title,
      location: job.location,
      salary: formatSalary(job),
      status: 'Saved',
      fitScore: job.fitScore || 88,
      matchingSkills: job.skills ? job.skills.slice(0, 4) : [],
      missingSkills: job.skills ? job.skills.slice(4, 7) : [],
      jobDescription: job.description,
      notes: `Discovered from CareerPilot Job Details (${job.title} at ${job.company})`
    });
    addToast({ title: 'Application Added', message: 'Tracked in your pipeline!', type: 'success' });
    navigate(`/applications/${newApp.id}`);
  };

  // Relevant Alumni
  const relevantPeople = useMemo(() => {
    if (!job) return mockPeople.slice(0, 3);
    const directMatches = mockPeople.filter(
      (p) =>
        p.company?.toLowerCase().includes(job.company?.toLowerCase()) ||
        p.role?.toLowerCase().includes(job.title?.toLowerCase().split(' ')[0])
    );
    if (directMatches.length > 0) return directMatches.slice(0, 3);
    return mockPeople.slice(0, 3);
  }, [job]);

  // Related Interview Experiences
  const relatedExperiences = useMemo(() => {
    if (!job) return mockInterviewExperiences.slice(0, 2);
    const directMatches = mockInterviewExperiences.filter(
      (e) =>
        e.company?.toLowerCase().includes(job.company?.toLowerCase()) ||
        e.role?.toLowerCase().includes(job.title?.toLowerCase().split(' ')[0])
    );
    if (directMatches.length > 0) return directMatches.slice(0, 2);
    return mockInterviewExperiences.slice(0, 2);
  }, [job]);

  const handleOpenGuidance = (person) => {
    setSelectedPersonForGuidance(person);
    setIsGuidanceModalOpen(true);
  };

  const handleGuidanceSubmit = (newRequestData) => {
    sendGuidanceRequest({
      mentorId: selectedPersonForGuidance?.id,
      mentorName: selectedPersonForGuidance?.name,
      mentorRole: selectedPersonForGuidance?.role,
      mentorCompany: selectedPersonForGuidance?.company || job?.company,
      mentorAvatar: selectedPersonForGuidance?.avatar,
      targetCompany: newRequestData.targetCompany || job?.company,
      targetRole: newRequestData.targetRole || job?.title,
      topics: newRequestData.topics,
      message: newRequestData.message
    });
  };

  // 1. Loading State
  if (isLoading) {
    return (
      <div className="min-w-0 max-w-5xl mx-auto space-y-6 py-6 p-4 animate-pulse">
        <div className="h-6 w-32 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
        <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
            <div className="space-y-2 flex-1">
              <div className="h-5 w-64 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
              <div className="h-4 w-40 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
            </div>
          </div>
          <div className="h-20 bg-slate-100 dark:bg-slate-800/50 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  // 2. Error / Not Found State
  if (error || !job) {
    return (
      <div className="min-w-0 max-w-5xl mx-auto space-y-6 py-6 p-4">
        <button
          onClick={() => navigate('/jobs')}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Jobs</span>
        </button>

        <div className="py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-8 text-center shadow-xs">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/50 flex items-center justify-center text-rose-600 dark:text-rose-400">
            <Briefcase className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Job Not Found
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-md mx-auto">
            {error || "We couldn't find the job opportunity you are looking for. It may have expired or been deactivated."}
          </p>
          <div className="mt-6">
            <button
              onClick={() => navigate('/jobs')}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-xs"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Explore Active Jobs</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const logoSrc = job.companyLogo || job.logo || 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=100&auto=format&fit=crop&q=80';
  const salaryString = formatSalary(job);

  return (
    <div className="min-w-0 max-w-5xl mx-auto space-y-6 py-4 sm:py-6 p-3 sm:p-6 animate-in fade-in duration-200">
      {/* 1. Back Navigation & Actions Bar */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={() => navigate('/jobs')}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Jobs</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleSave}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all shadow-2xs ${
              isSaved
                ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
            }`}
          >
            {isSaved ? <BookmarkCheck className="w-4 h-4 text-amber-600" /> : <Bookmark className="w-4 h-4 text-slate-400" />}
            <span>{isSaved ? 'Saved' : 'Save Job'}</span>
          </button>
        </div>
      </div>

      {/* 2. Hero Job Banner */}
      <div className="p-5 sm:p-7 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-start gap-4 min-w-0">
            <img
              src={logoSrc}
              alt={job.company}
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover ring-1 ring-slate-200 dark:ring-slate-700 shrink-0 shadow-2xs"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=100&auto=format&fit=crop&q=80';
              }}
            />
            <div className="min-w-0 space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
                  {job.title}
                </h1>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  Active
                </span>
              </div>
              <div className="flex items-center gap-2 flex-wrap text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                <span className="font-bold text-slate-900 dark:text-slate-200">{job.company}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{job.location || 'Remote'}</span>
                </span>
                <span>•</span>
                <span className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-semibold text-xs">
                  {job.workMode || 'On-site'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-center shrink-0">
            <button
              onClick={handleTrackApplication}
              className="flex items-center gap-1.5 px-4 py-2.5 text-xs sm:text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-xs active:scale-98"
            >
              <Plus className="w-4 h-4" />
              <span>Track Application</span>
            </button>

            {job.applicationUrl ? (
              <a
                href={job.applicationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors shadow-2xs"
              >
                <span>Apply on Official Site</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              </a>
            ) : (
              <span className="text-xs text-slate-400 italic px-2">Application link unavailable</span>
            )}
          </div>
        </div>

        {/* Metadata Strip */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Compensation</span>
            <span className="font-bold text-slate-900 dark:text-slate-100">{salaryString}</span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Employment Type</span>
            <span className="font-bold text-slate-900 dark:text-slate-100">{job.employmentType || 'Full-time'}</span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Experience</span>
            <span className="font-bold text-slate-900 dark:text-slate-100">{job.experience || '0-2 years'}</span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Posted Date</span>
            <span className="font-bold text-slate-900 dark:text-slate-100">{formatDate(job.postedDate || job.createdAt)}</span>
          </div>
        </div>
      </div>

      {/* 3. Main Content Grid (8 cols Details / 4 cols Sidebar) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Job Description & Skills (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Job Description Card */}
          <Card title="About the Role">
            <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line space-y-3">
              {job.description || (
                <p>
                  Join our technical engineering organization to architect, build, and deploy reliable software products and APIs at scale.
                </p>
              )}
            </div>
          </Card>

          {/* Key Required Skills */}
          <Card title="Required Technical Skills">
            <div className="space-y-3">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Core technologies and competencies highlighted for this position:
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                {(job.skills || []).map((skill, idx) => (
                  <SkillBadge key={idx} name={skill} type="matched" />
                ))}
              </div>
            </div>
          </Card>

          {/* Interview Preparation Insights */}
          <Card title="Interview & Career Preparation">
            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 space-y-1">
                <span className="font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                  <span>Role Preparation Tips</span>
                </span>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  Focus on Data Structures, Algorithms, API Design, and behavioral questions structured in STAR format.
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Community & Alumni (4 cols) */}
        <div className="lg:col-span-4 space-y-5">
          {/* Alumni Who Got Similar Roles */}
          <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>People Who Got Similar Roles</span>
              </h3>
            </div>

            <div className="space-y-2.5">
              {relevantPeople.map((person) => (
                <div
                  key={person.id}
                  className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-2.5"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={person.avatar}
                      alt={person.name}
                      className="w-9 h-9 rounded-xl object-cover ring-1 ring-slate-200 dark:ring-slate-700 shrink-0"
                    />
                    <div className="min-w-0">
                      <h4
                        onClick={() => navigate(`/people/${person.id}`)}
                        className="font-bold text-xs text-slate-900 dark:text-slate-100 hover:text-indigo-600 cursor-pointer truncate"
                      >
                        {person.name}
                      </h4>
                      <p className="text-[11px] text-slate-500 truncate">
                        {person.role} @ {person.company}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-1.5 pt-1">
                    <button
                      onClick={() => navigate(`/people/${person.id}`)}
                      className="flex-1 py-1 text-[10px] font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 hover:bg-slate-100 rounded-lg text-center border border-slate-200 dark:border-slate-600"
                    >
                      Profile
                    </button>
                    <button
                      onClick={() => handleOpenGuidance(person)}
                      className="flex-1 py-1 text-[10px] font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg text-center shadow-xs"
                    >
                      Guidance
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Related Interview Experiences */}
          <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Interview Insights</span>
              </h3>
              <button
                onClick={() => navigate('/interviews')}
                className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                All →
              </button>
            </div>

            <div className="space-y-2">
              {relatedExperiences.map((exp) => (
                <div
                  key={exp.id}
                  className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1.5"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900 dark:text-slate-100 truncate">{exp.company}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                      {exp.difficulty}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-2">{exp.summary}</p>
                  <button
                    onClick={() => navigate(`/interviews/${exp.id}`)}
                    className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1"
                  >
                    <span>Read Interview Story</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Guidance Modal */}
      <RequestGuidanceModal
        isOpen={isGuidanceModalOpen}
        onClose={() => setIsGuidanceModalOpen(false)}
        person={selectedPersonForGuidance}
        onSubmitRequest={handleGuidanceSubmit}
      />
    </div>
  );
}
