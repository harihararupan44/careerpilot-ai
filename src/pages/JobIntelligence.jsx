import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Plus,
  ArrowRight,
  Search,
  BookOpen,
  Code2,
  FileCheck,
  TrendingUp,
  Cpu,
  Users,
  Send,
  Bookmark,
  BookmarkCheck,
  MapPin,
  DollarSign,
  Calendar,
  Filter,
  SlidersHorizontal,
  X,
  ChevronRight,
  ExternalLink,
  Layers,
  Zap,
  Check
} from 'lucide-react';
import Card from '../components/common/Card';
import FitScore from '../components/common/FitScore';
import SkillBadge from '../components/common/SkillBadge';
import ProgressBar from '../components/common/ProgressBar';
import EmptyState from '../components/common/EmptyState';
import RequestGuidanceModal from '../components/people/RequestGuidanceModal';
import { useApplications } from '../context/ApplicationContext';
import { useGuidance } from '../context/GuidanceContext';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { jobApi, aiApi, peopleApi, interviewExperienceApi } from '../services/api';
import { formatDate } from '../utils/formatters';

const SAMPLE_JOB_TEMPLATES = [
  {
    id: 'sample-fullstack',
    title: 'Full Stack Software Engineer',
    company: 'FinTech Innovations',
    location: 'Bangalore, India (Hybrid)',
    salary: '₹18L - ₹24L / yr',
    description: `We are looking for a Full Stack Software Engineer to build scalable microservices and intuitive web interfaces.
Requirements:
- 2+ years of experience with React, Node.js, and Express.
- Strong knowledge of MongoDB, PostgreSQL, and Redis caching.
- Experience writing RESTful APIs, unit tests, and CI/CD pipelines.
- Solid understanding of data structures, algorithms, and system design principles.`
  },
  {
    id: 'sample-backend',
    title: 'Backend Engineer - Distributed Systems',
    company: 'CloudScale Technologies',
    location: 'Remote, India',
    salary: '₹22L - ₹30L / yr',
    description: `Join our core infrastructure engineering team designing high-throughput distributed systems.
Requirements:
- Strong proficiency in Node.js, TypeScript, and Go.
- In-depth experience with Kafka, Docker, Kubernetes, and AWS cloud architecture.
- Expertise in database indexing, concurrency control, and low-latency API design.`
  },
  {
    id: 'sample-frontend',
    title: 'Frontend Engineer (React / Next.js)',
    company: 'DesignWorks Studio',
    location: 'Hyderabad, India (Hybrid)',
    salary: '₹14L - ₹20L / yr',
    description: `We are looking for a talented Frontend Engineer passionate about crafting seamless digital experiences.
Requirements:
- Strong command of React 19, JavaScript (ES6+), TypeScript, and Tailwind CSS.
- Experience with state management, web performance optimization, and responsive design.`
  }
];

export default function JobIntelligence() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addApplication } = useApplications();
  const { sendGuidanceRequest } = useGuidance();
  const { addToast } = useToast();

  // Tab: 'browse' | 'analyzer' | 'saved'
  const [activeTab, setActiveTab] = useState('browse');

  // Backend Jobs State
  const [backendJobs, setBackendJobs] = useState([]);
  const [savedJobsList, setSavedJobsList] = useState([]);
  const [isLoadingJobs, setIsLoadingJobs] = useState(false);
  const [communityPeople, setCommunityPeople] = useState([]);
  const [communityExperiences, setCommunityExperiences] = useState([]);

  // Browse State
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [workModeFilter, setWorkModeFilter] = useState('All');
  const [experienceFilter, setExperienceFilter] = useState('All');
  const [minMatchFilter, setMinMatchFilter] = useState('All');
  const [sortBy, setSortBy] = useState('match-desc');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [savedJobIds, setSavedJobIds] = useState(new Set());
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [isMobileDetailOpen, setIsMobileDetailOpen] = useState(false);

  // Custom JD Analyzer State
  const [selectedTemplate, setSelectedTemplate] = useState('sample-fullstack');
  const [jobText, setJobText] = useState(SAMPLE_JOB_TEMPLATES[0].description);
  const [customJobTitle, setCustomJobTitle] = useState(SAMPLE_JOB_TEMPLATES[0].title);
  const [customCompany, setCustomCompany] = useState(SAMPLE_JOB_TEMPLATES[0].company);
  const [customLocation, setCustomLocation] = useState(SAMPLE_JOB_TEMPLATES[0].location);
  const [customSalary, setCustomSalary] = useState(SAMPLE_JOB_TEMPLATES[0].salary);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  // Guidance Modal State
  const [selectedPersonForGuidance, setSelectedPersonForGuidance] = useState(null);
  const [isGuidanceModalOpen, setIsGuidanceModalOpen] = useState(false);

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Format backend job to frontend schema
  const mapJobToView = useCallback((job) => {
    const id = job.id || job._id;
    let salaryDisplay = 'Competitive';
    if (job.salaryMin && job.salaryMax) {
      salaryDisplay = `₹${(job.salaryMin / 100000).toFixed(1)}L - ₹${(job.salaryMax / 100000).toFixed(1)}L / yr`;
    } else if (job.salary) {
      salaryDisplay = job.salary;
    }

    return {
      id,
      _id: id,
      title: job.title,
      company: job.company,
      logo: job.companyLogo || job.logo || 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=100&auto=format&fit=crop&q=80',
      location: job.location || 'Remote',
      workMode: job.workMode || 'On-site',
      jobType: job.employmentType || job.jobType || 'Full-time',
      experience: job.experience || '0-2 years',
      salary: salaryDisplay,
      postedDate: job.postedDate || new Date().toISOString(),
      fitScore: job.fitScore || 88,
      skills: Array.isArray(job.skills) ? job.skills : [],
      matchingSkills: job.matchingSkills || (job.skills ? job.skills.slice(0, 4) : []),
      missingSkills: job.missingSkills || (job.skills ? job.skills.slice(4, 7) : []),
      description: job.description || 'Join our engineering team to build scalable full-stack applications.',
      applicationUrl: job.applicationUrl || '',
      insights: job.insights || {
        whyMatch: `Your technical skills align well with ${job.company}'s engineering stack.`,
        potentialGap: 'Familiarize yourself with high-throughput cloud architectures.',
        suggestedAction: 'Review past project designs and STAR behavioral stories.'
      }
    };
  }, []);

  // Fetch jobs from backend API
  const fetchBackendJobs = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setIsLoadingJobs(true);
      const params = {};
      if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
      if (workModeFilter !== 'All') params.workMode = workModeFilter;
      if (experienceFilter !== 'All') params.experience = experienceFilter;

      let backendSort = 'latest';
      if (sortBy === 'date-desc') backendSort = 'latest';
      if (sortBy === 'salary') backendSort = 'salary';
      params.sort = backendSort;

      const res = await jobApi.getJobs(params);
      if (res.success && Array.isArray(res.jobs)) {
        const mapped = res.jobs.map(mapJobToView);
        setBackendJobs(mapped);
      }
    } catch (err) {
      console.warn('Could not fetch jobs from backend, using mock data:', err);
    } finally {
      setIsLoadingJobs(false);
    }
  }, [isAuthenticated, debouncedSearch, workModeFilter, experienceFilter, sortBy, mapJobToView]);

  // Fetch saved jobs from backend
  const fetchSavedJobs = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res = await jobApi.getSavedJobs();
      if (res.success && Array.isArray(res.jobs)) {
        const mapped = res.jobs.map(mapJobToView);
        setSavedJobsList(mapped);
        const ids = new Set(mapped.map(j => j.id));
        setSavedJobIds(ids);
      }
    } catch (err) {
      console.warn('Could not fetch saved jobs from backend:', err);
    }
  }, [isAuthenticated, mapJobToView]);

  useEffect(() => {
    fetchBackendJobs();
  }, [fetchBackendJobs]);

  useEffect(() => {
    fetchSavedJobs();
  }, [fetchSavedJobs]);

  // Fetch community people & experiences for alumni/interview insights
  useEffect(() => {
    const fetchCommunityData = async () => {
      try {
        const [peopleRes, expRes] = await Promise.all([
          peopleApi.getPeople({ limit: 10 }),
          interviewExperienceApi.getExperiences({ limit: 10 })
        ]);
        if (peopleRes && Array.isArray(peopleRes.data)) {
          setCommunityPeople(peopleRes.data);
        }
        if (expRes && Array.isArray(expRes.data)) {
          setCommunityExperiences(expRes.data);
        }
      } catch (e) {
        console.warn('Could not load community suggestions:', e.message);
      }
    };
    fetchCommunityData();
  }, []);

  // Effective job dataset (Backend jobs from MongoDB)
  const currentDataset = backendJobs;

  // Filter & sort jobs list
  const filteredJobs = useMemo(() => {
    const listToFilter = activeTab === 'saved' && savedJobsList.length > 0
      ? savedJobsList
      : currentDataset;

    return listToFilter.filter((job) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        job.title?.toLowerCase().includes(q) ||
        job.company?.toLowerCase().includes(q) ||
        job.location?.toLowerCase().includes(q) ||
        job.skills?.some((s) => s.toLowerCase().includes(q));

      const matchesWorkMode =
        workModeFilter === 'All' || job.workMode?.toLowerCase() === workModeFilter.toLowerCase();

      const matchesExperience =
        experienceFilter === 'All' || job.experience?.toLowerCase().includes(experienceFilter.toLowerCase());

      const matchesMatch =
        minMatchFilter === 'All' ||
        (minMatchFilter === '80+' && job.fitScore >= 80) ||
        (minMatchFilter === '90+' && job.fitScore >= 90);

      const matchesSavedTab = activeTab !== 'saved' || savedJobIds.has(job.id || job._id);

      return matchesQuery && matchesWorkMode && matchesExperience && matchesMatch && matchesSavedTab;
    }).sort((a, b) => {
      if (sortBy === 'match-desc') return (b.fitScore || 0) - (a.fitScore || 0);
      if (sortBy === 'date-desc') return new Date(b.postedDate || 0) - new Date(a.postedDate || 0);
      if (sortBy === 'company') return (a.company || '').localeCompare(b.company || '');
      return 0;
    });
  }, [currentDataset, savedJobsList, searchQuery, workModeFilter, experienceFilter, minMatchFilter, sortBy, activeTab, savedJobIds]);

  // Selected job for right-pane / modal details
  const selectedJob = useMemo(() => {
    if (selectedJobId) {
      const found = filteredJobs.find((j) => (j.id === selectedJobId || j._id === selectedJobId)) ||
                    currentDataset.find((j) => (j.id === selectedJobId || j._id === selectedJobId));
      if (found) return found;
    }
    return filteredJobs[0] || currentDataset[0] || null;
  }, [selectedJobId, filteredJobs, currentDataset]);

  // Relevant alumni matching selected job
  const relevantPeople = useMemo(() => {
    if (!selectedJob) return communityPeople.slice(0, 3);
    const directMatches = communityPeople.filter(
      (p) =>
        p.company?.toLowerCase().includes(selectedJob.company?.toLowerCase()) ||
        p.role?.toLowerCase().includes(selectedJob.title?.toLowerCase().split(' ')[0])
    );
    if (directMatches.length > 0) return directMatches.slice(0, 3);
    return communityPeople.slice(0, 3);
  }, [selectedJob, communityPeople]);

  // Related interview experiences for selected job
  const relatedExperiences = useMemo(() => {
    if (!selectedJob) return communityExperiences.slice(0, 3);
    const directMatches = communityExperiences.filter(
      (e) =>
        e.company?.toLowerCase().includes(selectedJob.company?.toLowerCase()) ||
        e.role?.toLowerCase().includes(selectedJob.title?.toLowerCase().split(' ')[0])
    );
    if (directMatches.length > 0) return directMatches.slice(0, 3);
    return communityExperiences.slice(0, 3);
  }, [selectedJob, communityExperiences]);

  // Toggle Save Job
  const handleToggleSave = async (jobId) => {
    const isCurrentlySaved = savedJobIds.has(jobId);

    // Optimistic UI update
    setSavedJobIds((prev) => {
      const next = new Set(prev);
      if (isCurrentlySaved) {
        next.delete(jobId);
      } else {
        next.add(jobId);
      }
      return next;
    });

    if (isAuthenticated) {
      try {
        if (isCurrentlySaved) {
          await jobApi.unsaveJob(jobId);
          addToast({ title: 'Removed from Saved', message: 'Job unbookmarked', type: 'info' });
        } else {
          await jobApi.saveJob(jobId);
          addToast({ title: 'Job Saved!', message: 'Bookmarked to your saved list', type: 'success' });
        }
        fetchSavedJobs();
      } catch (err) {
        console.warn('Saved job API error, state updated locally:', err);
      }
    } else {
      if (isCurrentlySaved) {
        addToast({ title: 'Removed from Saved', message: 'Job unbookmarked', type: 'info' });
      } else {
        addToast({ title: 'Job Saved!', message: 'Bookmarked to your saved list', type: 'success' });
      }
    }
  };

  // Track Application in tracker
  const handleTrackJob = (job) => {
    const newApp = addApplication({
      company: job.company,
      jobTitle: job.title,
      location: job.location,
      salary: job.salary,
      status: 'Saved',
      fitScore: job.fitScore || 85,
      matchingSkills: job.matchingSkills || job.skills?.slice(0, 4) || [],
      missingSkills: job.missingSkills || [],
      jobDescription: job.description,
      notes: `Discovered and tracked from Job Intelligence (${job.title} at ${job.company})`
    });
    navigate(`/applications/${newApp.id}`);
  };

  // Custom JD Analyzer handlers
  const handleSelectTemplate = (id) => {
    setSelectedTemplate(id);
    const tmpl = SAMPLE_JOB_TEMPLATES.find((t) => t.id === id);
    if (tmpl) {
      setJobText(tmpl.description);
      setCustomJobTitle(tmpl.title);
      setCustomCompany(tmpl.company);
      setCustomLocation(tmpl.location);
      setCustomSalary(tmpl.salary);
      setAnalysisResult(null);
    }
  };

  const handleAnalyze = async () => {
    if (!jobText.trim()) return;
    setIsAnalyzing(true);
    try {
      const res = await aiApi.matchResumeJob({
        jobDescription: jobText,
        jobTitle: customJobTitle,
        company: customCompany
      });
      if (res && res.success && res.data) {
        const d = res.data;
        const normalized = {
          fitScore: d.matchScore ?? d.fitScore ?? 85,
          matchingSkills: d.matchedSkills || d.matchingSkills || [],
          missingSkills: d.missingSkills || [],
          roleFitVerdict: d.fitVerdict || d.roleFitVerdict || 'Strong Candidate',
          recommendation: d.recommendation || d.summary || 'Solid candidate match with core requirements.',
          strengths: d.matchingStrengths || d.strengths || [],
          skillGaps: d.missingSkills || d.gaps || [],
          actionableAdvice: d.recommendations || d.actionableAdvice || []
        };
        setAnalysisResult(normalized);
        addToast({
          title: 'JD Analysis Complete',
          message: `Fit Score calculated: ${normalized.fitScore}%`,
          type: 'success'
        });
      } else {
        throw new Error(res?.message || 'Failed to analyze job description');
      }
    } catch (e) {
      console.error('JD analysis error:', e);
      addToast({
        title: 'Analysis Failed',
        message: e.message || 'Could not evaluate job description',
        type: 'error'
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveCustomToTracker = () => {
    const newApp = addApplication({
      company: customCompany,
      jobTitle: customJobTitle,
      location: customLocation,
      salary: customSalary,
      status: 'Saved',
      fitScore: analysisResult?.fitScore || 82,
      matchingSkills: analysisResult?.matchingSkills || ['React', 'TypeScript', 'Node.js'],
      missingSkills: analysisResult?.missingSkills || ['Kubernetes'],
      jobDescription: jobText,
      notes: 'Added from Job Intelligence Analyzer',
    });
    navigate(`/applications/${newApp.id}`);
  };

  const handleOpenGuidance = (person) => {
    setSelectedPersonForGuidance(person);
    setIsGuidanceModalOpen(true);
  };

  const handleGuidanceSubmit = (newRequestData) => {
    sendGuidanceRequest({
      mentorId: selectedPersonForGuidance?.id,
      mentorName: selectedPersonForGuidance?.name,
      mentorRole: selectedPersonForGuidance?.role,
      mentorCompany: selectedPersonForGuidance?.company || selectedJob?.company,
      mentorAvatar: selectedPersonForGuidance?.avatar,
      targetCompany: newRequestData.targetCompany || selectedJob?.company,
      targetRole: newRequestData.targetRole || selectedJob?.title,
      topics: newRequestData.topics,
      message: newRequestData.message
    });
  };

  const getDifficultyColor = (diff) => {
    switch (diff?.toLowerCase()) {
      case 'hard':
        return 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800';
      case 'medium-hard':
        return 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'medium':
      default:
        return 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & Navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
            Find Your Next Opportunity
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Discover roles that match your skills, experience, and career goals.
          </p>
        </div>

        {/* Primary View Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-200/80 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700/80 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('browse')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'browse'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Discover Roles</span>
          </button>

          <button
            onClick={() => setActiveTab('saved')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'saved'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Saved ({savedJobIds.size})</span>
          </button>

          <button
            onClick={() => setActiveTab('analyzer')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'analyzer'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>Paste JD Analyzer</span>
          </button>
        </div>
      </div>

      {/* DISCOVER & SAVED JOBS TABS */}
      {(activeTab === 'browse' || activeTab === 'saved') && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* 2. Prominent Search & Filter Bar */}
          <div className="space-y-2.5">
            <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              {/* Search input */}
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search jobs, companies, skills, locations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-9 py-1.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl outline-none focus:border-indigo-500 transition-colors font-medium text-slate-900 dark:text-slate-100"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Desktop Filters */}
              <div className="hidden lg:flex items-center gap-2 shrink-0">
                {/* Work Mode */}
                <select
                  value={workModeFilter}
                  onChange={(e) => setWorkModeFilter(e.target.value)}
                  className="px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-medium text-slate-700 dark:text-slate-300"
                >
                  <option value="All">All Work Modes</option>
                  <option value="Remote">Remote</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="Onsite">Onsite</option>
                </select>

                {/* Experience */}
                <select
                  value={experienceFilter}
                  onChange={(e) => setExperienceFilter(e.target.value)}
                  className="px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-medium text-slate-700 dark:text-slate-300"
                >
                  <option value="All">All Experience</option>
                  <option value="New Grad">New Grad 2026</option>
                  <option value="0-2">0-2 years</option>
                  <option value="Junior">Junior / Mid</option>
                </select>

                {/* Min Match */}
                <select
                  value={minMatchFilter}
                  onChange={(e) => setMinMatchFilter(e.target.value)}
                  className="px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-medium text-slate-700 dark:text-slate-300"
                >
                  <option value="All">All Match Scores</option>
                  <option value="80+">80%+ Match</option>
                  <option value="90+">90%+ Match</option>
                </select>
              </div>

              {/* Sorting & Mobile Filter Button */}
              <div className="flex items-center justify-between md:justify-end gap-2 shrink-0">
                <button
                  onClick={() => setShowMobileFilters(!showMobileFilters)}
                  className={`lg:hidden flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border transition-colors ${
                    workModeFilter !== 'All' || experienceFilter !== 'All' || minMatchFilter !== 'All'
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300'
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <Filter className="w-3.5 h-3.5" />
                  <span>Filters</span>
                </button>

                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-slate-400 hidden sm:inline">Sort:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl outline-none focus:border-indigo-500 font-semibold text-slate-700 dark:text-slate-200"
                  >
                    <option value="match-desc">Best Match</option>
                    <option value="date-desc">Newest First</option>
                    <option value="company">Company (A-Z)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Mobile Filters Panel */}
            {showMobileFilters && (
              <div className="lg:hidden p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-3 animate-in fade-in">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span>Filter Roles</span>
                  <button
                    onClick={() => {
                      setWorkModeFilter('All');
                      setExperienceFilter('All');
                      setMinMatchFilter('All');
                    }}
                    className="text-xs text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
                  >
                    Reset All
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <select
                    value={workModeFilter}
                    onChange={(e) => setWorkModeFilter(e.target.value)}
                    className="px-2.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  >
                    <option value="All">All Work Modes</option>
                    <option value="Remote">Remote</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="Onsite">Onsite</option>
                  </select>

                  <select
                    value={experienceFilter}
                    onChange={(e) => setExperienceFilter(e.target.value)}
                    className="px-2.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  >
                    <option value="All">All Experience</option>
                    <option value="New Grad">New Grad 2026</option>
                    <option value="0-2">0-2 years</option>
                    <option value="Junior">Junior / Mid</option>
                  </select>

                  <select
                    value={minMatchFilter}
                    onChange={(e) => setMinMatchFilter(e.target.value)}
                    className="px-2.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  >
                    <option value="All">All Match Scores</option>
                    <option value="80+">80%+ Match</option>
                    <option value="90+">90%+ Match</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Results Counter Strip */}
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
            <span>
              <strong className="text-slate-900 dark:text-slate-100 font-bold">{filteredJobs.length}</strong>{' '}
              {filteredJobs.length === 1 ? 'opportunity' : 'opportunities'} found
            </span>
            <span className="text-[11px] text-slate-400">
              Personalized for your technical profile & resume
            </span>
          </div>

          {/* 3. Master-Detail Layout (Desktop: 7 cols cards / 5 cols sticky details) */}
          {filteredJobs.length === 0 ? (
            <EmptyState
              icon={Briefcase}
              title={activeTab === 'saved' ? 'No saved jobs yet' : 'No matching jobs found'}
              description={
                activeTab === 'saved'
                  ? 'Bookmark jobs from the Discover tab to save them for later review.'
                  : 'Try clearing your search query or relaxing your filter constraints.'
              }
              actionText="Reset Filters"
              onAction={() => {
                setSearchQuery('');
                setWorkModeFilter('All');
                setExperienceFilter('All');
                setMinMatchFilter('All');
                if (activeTab === 'saved') setActiveTab('browse');
              }}
            />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Job Cards Feed (7 cols) */}
              <div className="lg:col-span-7 space-y-3">
                {filteredJobs.map((job) => {
                  const isSelected = selectedJob?.id === job.id;
                  const isSaved = savedJobIds.has(job.id);

                  return (
                    <div
                      key={job.id}
                      onClick={() => {
                        setSelectedJobId(job.id);
                        if (window.innerWidth < 1024) {
                          setIsMobileDetailOpen(true);
                        }
                      }}
                      className={`group p-4 bg-white dark:bg-slate-900 rounded-2xl border transition-all duration-200 cursor-pointer ${
                        isSelected
                          ? 'border-indigo-500 dark:border-indigo-500 ring-2 ring-indigo-500/10 shadow-md'
                          : 'border-slate-200/80 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 shadow-xs'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 min-w-0">
                          <img
                            src={job.logo}
                            alt={job.company}
                            className="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-200 dark:ring-slate-700 shrink-0"
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src =
                                'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=100&auto=format&fit=crop&q=80';
                            }}
                          />
                          <div className="min-w-0">
                            <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                              {job.title}
                            </h3>
                            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 truncate">
                              {job.company}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                          <FitScore score={job.fitScore} size="compact" />
                          <button
                            onClick={() => handleToggleSave(job.id)}
                            className={`p-1.5 rounded-lg border transition-colors ${
                              isSaved
                                ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-200 text-amber-600 dark:text-amber-400'
                                : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-600'
                            }`}
                            title={isSaved ? 'Unsave job' : 'Save job'}
                          >
                            {isSaved ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>

                      {/* Location, Salary & Metadata */}
                      <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>{job.location} ({job.workMode})</span>
                        </span>
                        <span>•</span>
                        <span className="font-medium text-slate-700 dark:text-slate-300">
                          {job.salary}
                        </span>
                        <span>•</span>
                        <span className="text-[11px] text-slate-400">{job.experience}</span>
                      </div>

                      {/* Skills Tags */}
                      <div className="mt-3 flex flex-wrap gap-1">
                        {job.skills?.slice(0, 4).map((s) => {
                          const isMatched = job.matchingSkills?.includes(s);
                          return (
                            <SkillBadge
                              key={s}
                              name={s}
                              type={isMatched ? 'matched' : 'neutral'}
                            />
                          );
                        })}
                        {job.skills?.length > 4 && (
                          <span className="text-[10px] font-semibold text-slate-400 self-center px-1">
                            +{job.skills.length - 4} more
                          </span>
                        )}
                      </div>

                      {/* Card Footer: Quick Actions */}
                      <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                        <span className="text-[11px] text-slate-400">
                          Posted {formatDate(job.postedDate)}
                        </span>

                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => handleTrackJob(job)}
                            className="px-3 py-1 text-xs font-semibold rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors"
                          >
                            Track Application
                          </button>
                          <button
                            onClick={() => navigate(`/jobs/${job._id || job.id}`)}
                            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5"
                          >
                            <span>View Details</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Right Column: Sticky Job Intelligence & Community Pane (5 cols, Desktop) */}
              <div className="hidden lg:block lg:col-span-5 sticky top-6 space-y-4">
                {selectedJob && (
                  <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-5">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        <img
                          src={selectedJob.logo}
                          alt={selectedJob.company}
                          className="w-12 h-12 rounded-2xl object-cover ring-1 ring-slate-200 dark:ring-slate-700 shrink-0"
                        />
                        <div className="min-w-0">
                          <h2 className="font-extrabold text-base text-slate-900 dark:text-slate-100 truncate">
                            {selectedJob.title}
                          </h2>
                          <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                            {selectedJob.company} • {selectedJob.location}
                          </p>
                        </div>
                      </div>

                      <FitScore score={selectedJob.fitScore} size="circle" />
                    </div>

                    {/* Salary & Meta Box */}
                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Compensation</span>
                        <span className="font-bold text-slate-900 dark:text-slate-100">{selectedJob.salary}</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Work Mode</span>
                        <span className="font-bold text-slate-900 dark:text-slate-100">{selectedJob.workMode} ({selectedJob.experience})</span>
                      </div>
                    </div>

                    {/* CareerPilot Match Intelligence */}
                    <div className="space-y-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                        CareerPilot Fit Intelligence
                      </span>

                      <div className="space-y-2 text-xs">
                        <div className="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50 space-y-1">
                          <span className="font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                            <span>Why This Job Matches You</span>
                          </span>
                          <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                            {selectedJob.insights?.whyMatch}
                          </p>
                        </div>

                        {selectedJob.insights?.potentialGap && (
                          <div className="p-3 rounded-xl bg-amber-50/50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/50 space-y-1">
                            <span className="font-bold text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
                              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                              <span>Potential Gap</span>
                            </span>
                            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                              {selectedJob.insights?.potentialGap}
                            </p>
                          </div>
                        )}

                        {selectedJob.insights?.suggestedAction && (
                          <div className="p-3 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 space-y-1">
                            <span className="font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
                              <Zap className="w-3.5 h-3.5 shrink-0" />
                              <span>Suggested Prep Action</span>
                            </span>
                            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                              {selectedJob.insights?.suggestedAction}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Matching Skills vs Missing Skills */}
                    <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <div>
                        <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block mb-1.5">
                          Matching Skills ({selectedJob.matchingSkills?.length || 0})
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {selectedJob.matchingSkills?.map((s) => (
                            <SkillBadge key={s} name={s} type="matched" />
                          ))}
                        </div>
                      </div>

                      {selectedJob.missingSkills?.length > 0 && (
                        <div>
                          <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider block mb-1.5">
                            Skills to Highlight / Brush Up ({selectedJob.missingSkills?.length || 0})
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {selectedJob.missingSkills?.map((s) => (
                              <SkillBadge key={s} name={s} type="missing" />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Community Section: People Who Got Similar Roles */}
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                          <Users className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                          <span>People Who Got Similar Roles</span>
                        </span>
                        <button
                          onClick={() => navigate('/explore')}
                          className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                        >
                          Explore more →
                        </button>
                      </div>

                      <div className="space-y-2">
                        {relevantPeople.slice(0, 2).map((person) => (
                          <div
                            key={person.id}
                            className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <img
                                src={person.avatar}
                                alt={person.name}
                                className="w-8 h-8 rounded-xl object-cover ring-1 ring-slate-200 dark:ring-slate-700 shrink-0"
                              />
                              <div className="min-w-0">
                                <h4
                                  onClick={() => navigate(`/people/${person.id}`)}
                                  className="font-bold text-xs text-slate-900 dark:text-slate-100 hover:text-indigo-600 cursor-pointer truncate"
                                >
                                  {person.name}
                                </h4>
                                <p className="text-[10px] text-slate-500 truncate">
                                  {person.role} @ {person.company}
                                </p>
                              </div>
                            </div>

                            <button
                              onClick={() => handleOpenGuidance(person)}
                              className="px-2 py-1 text-[10px] font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shrink-0 shadow-xs"
                            >
                              Request Guidance
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Community Section: Interview Experiences */}
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                          <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                          <span>Learn From Previous Candidates</span>
                        </span>
                        <button
                          onClick={() => navigate('/interviews')}
                          className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                        >
                          View all →
                        </button>
                      </div>

                      {relatedExperiences.slice(0, 1).map((exp) => (
                        <div
                          key={exp.id}
                          className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1.5"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-slate-900 dark:text-slate-100">
                              {exp.company} • {exp.role}
                            </span>
                            <span
                              className={`px-2 py-0.2 text-[10px] font-bold rounded-full border ${getDifficultyColor(
                                exp.difficulty
                              )}`}
                            >
                              {exp.difficulty}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                            {exp.summary}
                          </p>
                          <button
                            onClick={() => navigate(`/interviews/${exp.id}`)}
                            className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1"
                          >
                            <span>Read Experience</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Primary Action Buttons */}
                    <div className="pt-2 flex flex-col gap-2">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleTrackJob(selectedJob)}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs sm:text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-xs active:scale-98"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Track Application</span>
                        </button>
                        <button
                          onClick={() => navigate(`/jobs/${selectedJob._id || selectedJob.id}`)}
                          className="px-3.5 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors shadow-2xs flex items-center gap-1 shrink-0"
                          title="Open Full Details Page"
                        >
                          <span>Full Details</span>
                          <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                        </button>
                      </div>

                      {selectedJob.applicationUrl && (
                        <a
                          href={selectedJob.applicationUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full flex items-center justify-center gap-2 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl transition-colors"
                        >
                          <span>Apply on Official Website</span>
                          <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Mobile Detail Modal / Sheet */}
          {isMobileDetailOpen && selectedJob && (
            <div className="lg:hidden fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
              <div className="bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={selectedJob.logo}
                      alt={selectedJob.company}
                      className="w-9 h-9 rounded-xl object-cover ring-1 ring-slate-200 dark:ring-slate-700 shrink-0"
                    />
                    <div className="min-w-0">
                      <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate">
                        {selectedJob.title}
                      </h3>
                      <p className="text-xs text-slate-500 truncate">{selectedJob.company}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsMobileDetailOpen(false)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Mobile Fit & Details */}
                <div className="flex items-center justify-between p-3 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50">
                  <div>
                    <span className="text-xs text-slate-500 block">Calculated Fit Score</span>
                    <span className="text-lg font-extrabold text-indigo-600 dark:text-indigo-400">
                      {selectedJob.fitScore}% Match
                    </span>
                  </div>
                  <button
                    onClick={() => handleToggleSave(selectedJob.id)}
                    className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  >
                    {savedJobIds.has(selectedJob.id) ? 'Saved ★' : 'Save Job'}
                  </button>
                </div>

                <div className="space-y-2 text-xs">
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                    {selectedJob.description}
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="font-bold text-xs text-slate-900 dark:text-slate-100 block">
                    CareerPilot Fit Insights
                  </span>
                  <div className="p-3 rounded-xl bg-emerald-50/40 dark:bg-emerald-950/20 text-xs text-slate-700 dark:text-slate-300">
                    {selectedJob.insights?.whyMatch}
                  </div>
                </div>

                <div className="pt-3 flex gap-2">
                  <button
                    onClick={() => {
                      setIsMobileDetailOpen(false);
                      navigate(`/jobs/${selectedJob._id || selectedJob.id}`);
                    }}
                    className="flex-1 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl"
                  >
                    View Full Details
                  </button>
                  <button
                    onClick={() => {
                      setIsMobileDetailOpen(false);
                      handleTrackJob(selectedJob);
                    }}
                    className="px-3.5 py-2.5 text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 rounded-xl"
                  >
                    Track
                  </button>
                  <button
                    onClick={() => setIsMobileDetailOpen(false)}
                    className="px-3.5 py-2.5 text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* CUSTOM JD ANALYZER TAB */}
      {activeTab === 'analyzer' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Preset Job Selector */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">
              Load Sample JD:
            </span>
            {SAMPLE_JOB_TEMPLATES.map((t) => (
              <button
                key={t.id}
                onClick={() => handleSelectTemplate(t.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  selectedTemplate === t.id
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                }`}
              >
                {t.company} — {t.title.split(' ')[0]} {t.title.split(' ')[1]}
              </button>
            ))}
          </div>

          {/* Two Column Layout: Editor on Left, Analysis on Right */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Input Textarea (6 cols) */}
            <div className="lg:col-span-6 space-y-4">
              <Card title="Job Description Details">
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Company
                      </label>
                      <input
                        type="text"
                        value={customCompany}
                        onChange={(e) => setCustomCompany(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-indigo-500 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Job Title
                      </label>
                      <input
                        type="text"
                        value={customJobTitle}
                        onChange={(e) => setCustomJobTitle(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-indigo-500 font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Full Job Description Text
                    </label>
                    <textarea
                      rows="10"
                      value={jobText}
                      onChange={(e) => setJobText(e.target.value)}
                      placeholder="Paste complete Job Description with requirements, tech stack and responsibilities..."
                      className="w-full p-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-indigo-500 font-mono leading-relaxed"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      onClick={handleAnalyze}
                      disabled={isAnalyzing || !jobText.trim()}
                      className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-98 rounded-xl shadow-xs disabled:opacity-50 transition-all"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>{isAnalyzing ? 'Evaluating Fit Score...' : 'Analyze Match with Resume'}</span>
                    </button>
                  </div>
                </div>
              </Card>
            </div>

            {/* Right: AI Match Analysis (6 cols) */}
            <div className="lg:col-span-6 space-y-4">
              {!analysisResult ? (
                <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center min-h-[320px]">
                  <Cpu className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-3" />
                  <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                    Ready to Analyze Fit Score
                  </h3>
                  <p className="text-xs text-slate-400 max-w-sm mt-1">
                    Click "Analyze Match with Resume" to extract keywords, compare required skills, and generate tailored resume bullet suggestions.
                  </p>
                </div>
              ) : (
                <div className="space-y-4 animate-in fade-in">
                  {/* Top Banner: Fit Score & Action */}
                  <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <FitScore score={analysisResult.fitScore} size="circle" />
                      <div>
                        <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100">
                          Overall Match Score: {analysisResult.fitScore}%
                        </h3>
                        <p className="text-xs text-slate-500">
                          {analysisResult.fitScore >= 80 ? '🔥 High probability of interview callback' : '⚡ Moderate match. Tailor resume keywords.'}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={handleSaveCustomToTracker}
                      className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-xs shrink-0"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Save to Tracker</span>
                    </button>
                  </div>

                  {/* Match Breakdown Bars */}
                  <Card title="Match Breakdown">
                    <div className="space-y-2.5">
                      <ProgressBar label="Skill Match" value={analysisResult.skillMatchScore} color="indigo" size="sm" />
                      <ProgressBar label="Experience Match" value={analysisResult.experienceMatchScore} color="emerald" size="sm" />
                      <ProgressBar label="Education Match" value={analysisResult.educationMatchScore} color="blue" size="sm" />
                      <ProgressBar label="Project Relevance" value={analysisResult.projectMatchScore} color="purple" size="sm" />
                      <ProgressBar label="ATS Keyword Density" value={analysisResult.atsKeywordScore} color="amber" size="sm" />
                    </div>
                  </Card>

                  {/* Skills Comparison */}
                  <Card title="Skills Compatibility Breakdown">
                    <div className="space-y-3">
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block mb-2">
                          Matching Skills Found on Your Resume ({analysisResult.matchingSkills.length})
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {analysisResult.matchingSkills.map((s) => (
                            <SkillBadge key={s} name={s} type="matched" />
                          ))}
                        </div>
                      </div>

                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 block mb-2">
                          Missing / Recommended Skills to Add ({analysisResult.missingSkills.length})
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {analysisResult.missingSkills.map((s) => (
                            <SkillBadge key={s} name={s} type="missing" />
                          ))}
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* AI Strategic Recommendations */}
                  <Card title="AI Strategic Tailoring Suggestions">
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
                      {analysisResult.aiSummary}
                    </p>
                    <div className="space-y-2">
                      {analysisResult.customResumeBullets.map((bullet, idx) => (
                        <div key={idx} className="p-2.5 rounded-lg bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 text-xs">
                          <span className="font-semibold text-indigo-700 dark:text-indigo-300 block mb-0.5">Suggested Resume Bullet #{idx + 1}:</span>
                          <p className="text-slate-800 dark:text-slate-200">{bullet}</p>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

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
