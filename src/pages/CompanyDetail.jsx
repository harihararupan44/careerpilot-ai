import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Building2,
  Users,
  MessageSquare,
  Briefcase,
  ArrowLeft,
  MapPin,
  Sparkles,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Award,
  CheckCircle2,
  Clock,
  BookOpen,
  ArrowRight,
  Send,
  UserCheck,
  Calendar,
  Layers,
  HelpCircle,
  BarChart2,
  Info,
  Bookmark,
  Globe,
  Loader2
} from 'lucide-react';
import SkillBadge from '../components/common/SkillBadge';
import RequestGuidanceModal from '../components/people/RequestGuidanceModal';
import { companyApi } from '../services/api';
import { useGuidance } from '../context/GuidanceContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function CompanyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { sendGuidanceRequest } = useGuidance();
  const { isAuthenticated } = useAuth();
  const { addToast } = useToast();

  const [company, setCompany] = useState(null);
  const [people, setPeople] = useState([]);
  const [experiences, setExperiences] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [stats, setStats] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [selectedPersonForGuidance, setSelectedPersonForGuidance] = useState(null);
  const [isGuidanceModalOpen, setIsGuidanceModalOpen] = useState(false);

  const fetchCompanyData = useCallback(async () => {
    if (!id) return;
    console.log("Company ID from URL:", id);
    try {
      setIsLoading(true);
      const compRes = await companyApi.getCompany(id);
      console.log("Fetched company response:", compRes);

      const comp = compRes?.data || compRes?.company || compRes;
      if (comp && (comp.name || comp._id || comp.id)) {
        setCompany(comp);
        const resolvedId = comp._id || comp.id || id;

        // Fetch sub-resources in parallel using confirmed identifier
        const [peopleRes, expRes, jobsRes, statsRes, savedRes] = await Promise.allSettled([
          companyApi.getCompanyPeople(resolvedId),
          companyApi.getCompanyExperiences(resolvedId),
          companyApi.getCompanyJobs(resolvedId),
          companyApi.getCompanyStats(resolvedId),
          isAuthenticated ? (companyApi.checkSaved ? companyApi.checkSaved(resolvedId) : companyApi.checkSavedCompany(resolvedId)) : Promise.resolve({ isSaved: false })
        ]);

        if (peopleRes.status === 'fulfilled' && peopleRes.value?.success) {
          setPeople(peopleRes.value.data || []);
        }
        if (expRes.status === 'fulfilled' && expRes.value?.success) {
          setExperiences(expRes.value.data || []);
        }
        if (jobsRes.status === 'fulfilled' && jobsRes.value?.success) {
          setJobs(jobsRes.value.data || []);
        }
        if (statsRes.status === 'fulfilled' && statsRes.value?.success) {
          setStats(statsRes.value.data || null);
        }
        if (savedRes.status === 'fulfilled' && savedRes.value) {
          setIsSaved(Boolean(savedRes.value.isSaved));
        }
      } else {
        setCompany(null);
      }
    } catch (err) {
      console.warn('Could not load company details:', err.message);
      setCompany(null);
    } finally {
      setIsLoading(false);
    }
  }, [id, isAuthenticated]);

  useEffect(() => {
    fetchCompanyData();
  }, [fetchCompanyData]);

  const handleToggleSave = async () => {
    if (!isAuthenticated) {
      addToast({
        type: 'warning',
        title: 'Authentication required',
        message: 'Please log in to save this company.'
      });
      return;
    }
    if (!company) return;

    try {
      setIsSaving(true);
      const targetId = company._id || company.id || id;
      if (isSaved) {
        const res = await companyApi.unsaveCompany(targetId);
        if (res.success) {
          setIsSaved(false);
          addToast({
            type: 'info',
            title: 'Removed from Saved',
            message: `${company.name} removed from your saved companies.`
          });
        }
      } else {
        const res = await companyApi.saveCompany(targetId);
        if (res.success) {
          setIsSaved(true);
          addToast({
            type: 'success',
            title: 'Company Saved',
            message: `${company.name} added to your saved companies.`
          });
        }
      }
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Bookmark failed',
        message: err.response?.data?.message || 'Could not update bookmark.'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenGuidanceModal = (person) => {
    setSelectedPersonForGuidance(person);
    setIsGuidanceModalOpen(true);
  };

  const handleRequestSubmit = async (newRequestData) => {
    try {
      const mentorUserId = selectedPersonForGuidance?.user?._id || selectedPersonForGuidance?.user || selectedPersonForGuidance?.id || selectedPersonForGuidance?._id;
      await sendGuidanceRequest({
        mentorId: mentorUserId,
        mentorName: selectedPersonForGuidance?.name || selectedPersonForGuidance?.user?.name,
        mentorRole: selectedPersonForGuidance?.role || selectedPersonForGuidance?.headline || selectedPersonForGuidance?.targetRole,
        mentorCompany: selectedPersonForGuidance?.company || selectedPersonForGuidance?.currentCompany || company?.name,
        mentorAvatar: selectedPersonForGuidance?.avatar,
        targetCompany: newRequestData.targetCompany || company?.name,
        targetRole: newRequestData.targetRole || selectedPersonForGuidance?.role,
        topics: newRequestData.topics,
        message: newRequestData.message
      });
      addToast({
        type: 'success',
        title: 'Guidance Request Sent',
        message: `Your request has been sent to ${selectedPersonForGuidance?.name || 'mentor'}.`
      });
      setIsGuidanceModalOpen(false);
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Failed to send request',
        message: err.message || 'Could not send guidance request.'
      });
    }
  };

  const getDifficultyColor = (diff) => {
    switch (diff?.toLowerCase()) {
      case 'hard':
        return 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200/80 dark:border-rose-800';
      case 'medium-hard':
        return 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200/80 dark:border-amber-800';
      case 'medium':
      default:
        return 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800';
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="min-w-0 max-w-5xl mx-auto py-24 text-center">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600 dark:text-indigo-400 mx-auto" />
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-4">
          Loading company intelligence...
        </p>
      </div>
    );
  }

  // Invalid company fallback (only rendered after loading is false and company is null)
  if (!company) {
    return (
      <div className="min-w-0 max-w-5xl mx-auto space-y-6 py-6 p-4">
        <button
          onClick={() => navigate('/companies')}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Companies</span>
        </button>

        <div className="py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-8 text-center shadow-xs">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/50 flex items-center justify-center text-rose-600 dark:text-rose-400">
            <Building2 className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Company Not Found
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-md mx-auto">
            Sorry, we couldn't find the company profile you are looking for.
          </p>
          <div className="mt-6">
            <button
              onClick={() => navigate('/companies')}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-xs"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to All Companies</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const popularRolesList = company.popularRoles || company.specializations || [
    'Software Engineer',
    'Frontend Developer',
    'Backend Developer',
    'Data Analyst'
  ];

  const commonSkillsList = company.skills || company.commonSkills || [
    'Java',
    'DSA',
    'System Design',
    'SQL',
    'OOP',
    'Spring Boot'
  ];

  // Preparation insights tailored to company type and stats
  const prepInsights = {
    topSkills: stats?.topSkills?.length ? stats.topSkills.map((s) => s.skill || s) : commonSkillsList.slice(0, 5),
    prepDuration:
      company.companyType === 'Product-Based' || company.hiringType === 'Product-Based'
        ? '5 - 6 Months'
        : company.companyType === 'Enterprise SaaS' || company.hiringType === 'Enterprise SaaS'
        ? '4 - 5 Months'
        : '3 - 4 Months',
    rounds: [
      { step: 1, name: 'Online Assessment', desc: 'Coding problems (DSA), Aptitude & Core CS fundamentals.' },
      { step: 2, name: 'Technical Round 1', desc: 'Data Structures, Algorithms (Trees/Graphs/DP) & Problem Solving.' },
      { step: 3, name: 'Technical Round 2', desc: 'System Design / LLD, Projects, Database Optimization & OOP.' },
      { step: 4, name: 'Managerial / HR', desc: 'Behavioral questions, Cultural alignment & Role expectations.' }
    ],
    commonTopics: [
      'Data Structures & Algorithms',
      'Object-Oriented Design & LLD',
      'Database Design & SQL Queries',
      'Operating Systems & Concurrency',
      'STAR Behavioral Scenarios'
    ]
  };

  const totalPeopleCount = stats?.peopleCount ?? company.peopleCount ?? people.length;
  const totalExpCount = stats?.experienceCount ?? company.interviewExperienceCount ?? experiences.length;
  const totalJobCount = stats?.jobCount ?? company.jobCount ?? jobs.length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Back Button & Actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/companies')}
          className="inline-flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Companies</span>
        </button>

        <div className="flex items-center gap-2">
          {company.website && (
            <a
              href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors shadow-xs"
            >
              <Globe className="w-3.5 h-3.5 text-slate-500" />
              <span>Visit Website</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>
          )}

          <button
            onClick={handleToggleSave}
            disabled={isSaving}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl transition-all shadow-xs border ${
              isSaved
                ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-indigo-600 dark:fill-indigo-400' : ''}`} />
            <span>{isSaved ? 'Saved' : 'Save Company'}</span>
          </button>
        </div>
      </div>

      {/* 1. COMPANY HEADER */}
      <div className="p-6 sm:p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-20 h-20 rounded-3xl bg-slate-50 dark:bg-slate-800 p-2 border border-slate-200/80 dark:border-slate-700 shrink-0 flex items-center justify-center overflow-hidden shadow-xs">
              {company.logo ? (
                <img
                  src={company.logo}
                  alt={company.name}
                  className="w-full h-full object-cover rounded-2xl"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div
                className={`w-full h-full rounded-2xl bg-indigo-600 text-white font-extrabold text-2xl items-center justify-center ${
                  company.logo ? 'hidden' : 'flex'
                }`}
              >
                {company.name?.slice(0, 2).toUpperCase()}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
                  {company.name}
                </h1>
                <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  {company.companyType || company.hiringType || 'Tech'}
                </span>
                <span
                  className={`px-2.5 py-0.5 text-xs font-bold rounded-full border ${getDifficultyColor(
                    company.difficulty
                  )}`}
                >
                  {company.difficulty || 'Medium'} Difficulty
                </span>
                {company.companySize && (
                  <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {company.companySize}
                  </span>
                )}
              </div>
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mt-1">
                {company.industry}
              </p>
              {company.headquarters && (
                <p className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{company.headquarters}</span>
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="p-3 bg-indigo-50/60 dark:bg-indigo-950/40 rounded-2xl border border-indigo-100/70 dark:border-indigo-900/40 text-center min-w-24">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Alumni / People
              </span>
              <strong className="text-base font-extrabold text-indigo-600 dark:text-indigo-400">
                {totalPeopleCount}+
              </strong>
            </div>

            <div className="p-3 bg-violet-50/60 dark:bg-violet-950/40 rounded-2xl border border-violet-100/70 dark:border-violet-900/40 text-center min-w-24">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Experiences
              </span>
              <strong className="text-base font-extrabold text-violet-600 dark:text-violet-400">
                {totalExpCount}+
              </strong>
            </div>

            <div className="p-3 bg-emerald-50/60 dark:bg-emerald-950/40 rounded-2xl border border-emerald-100/70 dark:border-emerald-900/40 text-center min-w-24">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Active Jobs
              </span>
              <strong className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                {totalJobCount}
              </strong>
            </div>
          </div>
        </div>

        {/* Company Description */}
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-4xl">
          {company.description}
        </p>
      </div>

      {/* 2 & 3. POPULAR ROLES & COMMON SKILLS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Popular Roles */}
        <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Popular Roles
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Roles frequently hired for at {company.name}:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {popularRolesList.map((role, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200"
              >
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                  <span>{role}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Common Skills */}
        <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Common Skills
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Skills evaluated during technical interviews and assessments at {company.name}:
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            {commonSkillsList.map((skill) => (
              <SkillBadge key={skill} name={skill} type="specialized" />
            ))}
          </div>
        </div>
      </div>

      {/* 4. PREPARATION INSIGHTS (Aggregated from real platform data) */}
      <div className="p-6 sm:p-7 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <BarChart2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                Preparation Insights
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Interview trends, timelines, and candidate strategies.
              </p>
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-bold border border-indigo-200/80 dark:border-indigo-800/80 self-start sm:self-auto">
            <Info className="w-3.5 h-3.5" />
            <span>Based on platform data & interview experiences</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Top Skills & Duration */}
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Top Skills Evaluated
              </span>
              <div className="flex flex-wrap gap-1.5">
                {prepInsights.topSkills.map((s) => (
                  <SkillBadge key={typeof s === 'string' ? s : s.skill} name={typeof s === 'string' ? s : s.skill} type="neutral" />
                ))}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Average Preparation Duration
              </span>
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-extrabold text-lg">
                <Clock className="w-5 h-5" />
                <span>{prepInsights.prepDuration}</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Recommended consistent daily practice on DSA, system design, and core CS fundamentals.
              </p>
            </div>
          </div>

          {/* Common Interview Rounds */}
          <div className="lg:col-span-2 space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Common Interview Rounds
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {prepInsights.rounds.map((rnd) => (
                <div
                  key={rnd.step}
                  className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-1"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                      {rnd.step}
                    </span>
                    <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100">
                      {rnd.name}
                    </h4>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed pl-7">
                    {rnd.desc}
                  </p>
                </div>
              ))}
            </div>

            {/* Common Topics */}
            <div className="pt-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                Common Topics Asked
              </span>
              <div className="flex flex-wrap gap-1.5">
                {prepInsights.commonTopics.map((topic) => (
                  <span
                    key={topic}
                    className="px-2.5 py-1 rounded-xl text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5. OPEN JOBS AT THIS COMPANY */}
      {jobs.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Open Jobs at {company.name} ({jobs.length})
              </h2>
            </div>
            <button
              onClick={() => navigate('/jobs')}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1"
            >
              <span>Explore All Jobs</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {jobs.map((job) => (
              <div
                key={job._id || job.id}
                className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3
                      onClick={() => navigate(`/jobs/${job._id || job.id}`)}
                      className="font-bold text-sm text-slate-900 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition-colors"
                    >
                      {job.title}
                    </h3>
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      {job.jobType || 'Full-time'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    <span>{job.location || 'Multiple Locations'}</span>
                    {job.salary && <span>• {job.salary}</span>}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                    {job.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex flex-wrap gap-1">
                    {job.skills?.slice(0, 3).map((s) => (
                      <SkillBadge key={s} name={s} type="neutral" />
                    ))}
                  </div>
                  <button
                    onClick={() => navigate(`/jobs/${job._id || job.id}`)}
                    className="flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    <span>View Job</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. PEOPLE WHO GOT HIRED */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              People Who Work at / Got Hired at {company.name} ({people.length})
            </h2>
          </div>
          <button
            onClick={() => navigate('/explore')}
            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1"
          >
            <span>Explore All Alumni</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {people.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800">
            <Users className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              No alumni found yet for {company.name}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Be the first CareerPilot member to share your career profile with this company!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {people.map((person) => {
              const personId = person._id || person.id || (person.user?._id || person.user);
              const displayName = person.name || person.user?.name || 'CareerPilot Member';
              const displayRole = person.targetRole || person.headline || person.role || 'Software Engineer';
              const displayCollege = person.education?.[0]?.institution || person.college || 'Engineering Alumni';

              return (
                <div
                  key={personId}
                  className="flex flex-col justify-between p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-all space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="relative shrink-0">
                        {person.avatar ? (
                          <img
                            src={person.avatar}
                            alt={displayName}
                            className="w-13 h-13 rounded-2xl object-cover ring-2 ring-slate-100 dark:ring-slate-800"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div
                          className={`w-13 h-13 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white font-bold text-sm items-center justify-center ${
                            person.avatar ? 'hidden' : 'flex'
                          }`}
                        >
                          {getInitials(displayName)}
                        </div>
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3
                          onClick={() => navigate(`/people/${personId}`)}
                          className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition-colors"
                        >
                          {displayName}
                        </h3>
                        <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate mt-0.5">
                          {displayRole} <span className="text-indigo-600 dark:text-indigo-400">@ {company.name}</span>
                        </p>
                        <p className="text-[11px] text-slate-400 truncate mt-0.5">
                          {displayCollege}
                        </p>
                      </div>
                    </div>

                    {/* Skills */}
                    <div className="flex flex-wrap gap-1">
                      {person.skills?.slice(0, 4).map((s) => (
                        <SkillBadge key={typeof s === 'string' ? s : s.name} name={typeof s === 'string' ? s : s.name} type="neutral" />
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons: View Profile & Request Guidance */}
                  <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => navigate(`/people/${personId}`)}
                      className="flex items-center justify-center gap-1 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition-colors"
                    >
                      <span>View Profile</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                    </button>

                    <button
                      onClick={() => handleOpenGuidanceModal(person)}
                      className="flex items-center justify-center gap-1 px-3 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-98 rounded-xl transition-all shadow-xs"
                    >
                      <Send className="w-3 h-3" />
                      <span>Request Guidance</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 7. INTERVIEW EXPERIENCES */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Interview Experiences at {company.name} ({experiences.length})
            </h2>
          </div>
          <button
            onClick={() => navigate('/interviews')}
            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1"
          >
            <span>View All Experiences</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {experiences.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800">
            <MessageSquare className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              No interview experiences yet for {company.name}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Have you interviewed at {company.name}? Share your experience with the community!
            </p>
            <div className="mt-4">
              <button
                onClick={() => navigate('/interviews')}
                className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-xs"
              >
                Share Interview Experience
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {experiences.map((exp) => {
              const expId = exp._id || exp.id;
              return (
                <div
                  key={expId}
                  className="p-5 sm:p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3
                          onClick={() => navigate(`/interviews/${expId}`)}
                          className="font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition-colors"
                        >
                          {exp.role}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {exp.company} · {exp.year || (exp.createdAt ? new Date(exp.createdAt).getFullYear() : '2024')}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${getDifficultyColor(
                          exp.difficulty
                        )}`}
                      >
                        {exp.difficulty || 'Medium'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {exp.summary || exp.overallExperience}
                    </p>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {(exp.technologies || exp.topicsCovered || []).slice(0, 5).map((tech) => (
                        <SkillBadge key={tech} name={tech} type="neutral" />
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-xs text-slate-400">
                      {exp.rounds?.length ? `${exp.rounds.length} Rounds` : (exp.numberOfRounds ? `${exp.numberOfRounds} Rounds` : 'Multiple Rounds')} · {exp.preparationDuration || 'Preparation shared'}
                    </span>
                    <button
                      onClick={() => navigate(`/interviews/${expId}`)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 rounded-xl transition-colors"
                    >
                      <span>Read Experience</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Request Guidance Modal */}
      <RequestGuidanceModal
        isOpen={isGuidanceModalOpen}
        onClose={() => setIsGuidanceModalOpen(false)}
        person={selectedPersonForGuidance}
        onSubmitRequest={handleRequestSubmit}
      />
    </div>
  );
}
