import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import {
  Layers,
  Calendar,
  Award,
  XCircle,
  TrendingUp,
  Sparkles,
  ArrowRight,
  Clock,
  Briefcase,
  Bot,
  FileCheck,
  CheckCircle2,
  AlertCircle,
  UserCheck,
  BookOpen,
  Users,
  Send,
  Plus,
  ArrowUpRight,
  FileText,
  ChevronRight,
  Target,
  Loader2
} from 'lucide-react';
import StatCard from '../components/common/StatCard';
import FitScore from '../components/common/FitScore';
import StatusBadge from '../components/common/StatusBadge';
import Card from '../components/common/Card';
import ProgressBar from '../components/common/ProgressBar';
import SkillBadge from '../components/common/SkillBadge';
import RequestGuidanceModal from '../components/people/RequestGuidanceModal';
import ReadinessRadar from '../components/analytics/ReadinessRadar';
import { useApplications } from '../context/ApplicationContext';
import { useAuth } from '../context/AuthContext';
import { useGuidance } from '../context/GuidanceContext';
import { dashboardApi, peopleApi, interviewExperienceApi } from '../services/api';
import { formatDate } from '../utils/formatters';

export default function Dashboard() {
  const { stats, applications, setStatusFilter } = useApplications();
  const { user, isAuthenticated } = useAuth();
  const { sendGuidanceRequest } = useGuidance();
  const navigate = useNavigate();
  const { onOpenAddModal } = useOutletContext() || {};

  const [selectedPersonForGuidance, setSelectedPersonForGuidance] = useState(null);
  const [isGuidanceModalOpen, setIsGuidanceModalOpen] = useState(false);
  const [showRadarChart, setShowRadarChart] = useState(false);

  const [dashboardSummary, setDashboardSummary] = useState(null);
  const [recentActivities, setRecentActivities] = useState([]);
  const [recommendedPeople, setRecommendedPeople] = useState([]);
  const [recommendedExperiences, setRecommendedExperiences] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch real Dashboard summary & recommendations
  const fetchDashboardData = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setIsLoading(true);
      const [summaryRes, actRes, peopleRes, expRes] = await Promise.allSettled([
        dashboardApi.getSummary(),
        dashboardApi.getActivity({ limit: 8 }),
        peopleApi.getPeople({ limit: 3 }),
        interviewExperienceApi.getExperiences({ limit: 3 })
      ]);

      if (summaryRes.status === 'fulfilled' && summaryRes.value?.success) {
        setDashboardSummary(summaryRes.value.data);
      }
      if (actRes.status === 'fulfilled' && actRes.value?.success) {
        setRecentActivities(actRes.value.data || []);
      }
      if (peopleRes.status === 'fulfilled' && peopleRes.value?.success) {
        const pList = Array.isArray(peopleRes.value.data) ? peopleRes.value.data : (Array.isArray(peopleRes.value.people) ? peopleRes.value.people : []);
        setRecommendedPeople(pList.slice(0, 3));
      }
      if (expRes.status === 'fulfilled' && expRes.value?.success && Array.isArray(expRes.value.data)) {
        setRecommendedExperiences(expRes.value.data.slice(0, 3));
      }
    } catch (err) {
      console.warn('Could not load dashboard data from backend:', err.message);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Top upcoming interviews
  const upcomingInterviews = applications
    .filter((a) => a.status === 'Interview' || a.interviewDate)
    .slice(0, 3);

  // Readiness calculation
  const readinessScore = dashboardSummary?.careerReadinessScore ?? dashboardSummary?.readiness ?? (applications.length > 0 ? 76 : 30);
  const profilePercent = dashboardSummary?.profileCompletion ?? (user?.profile?.college ? 80 : 25);

  // Pipeline stages calculation
  const appCounts = dashboardSummary?.applications || {};
  const pipelineStages = [
    { key: 'Saved', label: 'Saved', count: appCounts.withdrawn ?? applications.filter(a => a.status === 'Saved' || a.status === 'Withdrawn').length, color: 'text-slate-600 bg-slate-100 dark:bg-slate-800' },
    { key: 'Applied', label: 'Applied', count: appCounts.applied ?? applications.filter(a => a.status === 'Applied').length, color: 'text-blue-700 bg-blue-50 dark:bg-blue-950/60' },
    { key: 'Assessment', label: 'Assessment', count: appCounts.screening ?? applications.filter(a => a.status === 'Assessment' || a.status === 'Screening').length, color: 'text-purple-700 bg-purple-50 dark:bg-purple-950/60' },
    { key: 'Interview', label: 'Interview', count: appCounts.interview ?? applications.filter(a => a.status === 'Interview').length, color: 'text-amber-700 bg-amber-50 dark:bg-amber-950/60' },
    { key: 'Offer', label: 'Offer', count: appCounts.offer ?? applications.filter(a => a.status === 'Offer').length, color: 'text-emerald-700 bg-emerald-50 dark:bg-emerald-950/60' },
  ];

  // Actionable Attention Items
  const attentionItems = [
    {
      id: 'att-1',
      icon: Calendar,
      color: 'amber',
      tag: upcomingInterviews.length > 0 ? `Upcoming: ${upcomingInterviews[0].company}` : 'Interview Scheduled',
      title: upcomingInterviews.length > 0 ? `${upcomingInterviews[0].company} — ${upcomingInterviews[0].jobTitle}` : 'Technical Virtual Onsite',
      description: upcomingInterviews.length > 0 ? `Scheduled round for ${upcomingInterviews[0].jobTitle}. Practice with mock prep.` : 'Practice mock interviews to maximize your callback odds.',
      actionText: 'Prepare now',
      onAction: () => navigate(upcomingInterviews.length > 0 ? `/interview/${upcomingInterviews[0].id || upcomingInterviews[0]._id}` : '/interviews'),
    },
    {
      id: 'att-2',
      icon: Clock,
      color: 'indigo',
      tag: 'Application Pipeline',
      title: `${applications.length} Tracked Positions`,
      description: 'Keep your applications and recruiter follow-ups updated on the tracker board.',
      actionText: 'View applications',
      onAction: () => navigate('/applications'),
    },
    {
      id: 'att-3',
      icon: FileText,
      color: 'purple',
      tag: 'Resume Profile',
      title: `Profile ${profilePercent}% Complete`,
      description: profilePercent < 100 ? 'Complete your skills, projects, and target role to boost visibility.' : 'Your profile is well-rounded and ready for recruiters.',
      actionText: 'Update profile',
      onAction: () => navigate('/profile'),
    },
    {
      id: 'att-4',
      icon: Users,
      color: 'emerald',
      tag: 'Community Mentorship',
      title: 'Connect with Alumni',
      description: 'Explore verified company alumni and request guidance on interview rounds.',
      actionText: 'Explore people',
      onAction: () => navigate('/explore'),
    }
  ];

  const handleStageClick = (stageKey) => {
    setStatusFilter(stageKey);
    navigate('/applications');
  };

  const handleOpenGuidance = (person) => {
    setSelectedPersonForGuidance(person);
    setIsGuidanceModalOpen(true);
  };

  const handleGuidanceSubmit = (newRequestData) => {
    const personId = selectedPersonForGuidance?._id || selectedPersonForGuidance?.id || (selectedPersonForGuidance?.user?._id || selectedPersonForGuidance?.user);
    sendGuidanceRequest({
      mentorId: personId,
      mentorName: selectedPersonForGuidance?.name || selectedPersonForGuidance?.user?.name,
      mentorRole: selectedPersonForGuidance?.role || selectedPersonForGuidance?.headline || selectedPersonForGuidance?.targetRole,
      mentorCompany: selectedPersonForGuidance?.company || selectedPersonForGuidance?.currentCompany,
      mentorAvatar: selectedPersonForGuidance?.avatar,
      targetCompany: newRequestData.targetCompany || selectedPersonForGuidance?.company,
      targetRole: newRequestData.targetRole || selectedPersonForGuidance?.role,
      topics: newRequestData.topics,
      message: newRequestData.message
    });
  };

  const getDifficultyBadge = (diff) => {
    switch (diff?.toLowerCase()) {
      case 'hard':
      case 'very hard':
        return 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/60';
      case 'medium-hard':
      case 'medium':
        return 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/60';
      case 'easy':
      default:
        return 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60';
    }
  };

  const totalAppCount = dashboardSummary?.applications?.total ?? stats.total;
  const interviewCount = dashboardSummary?.interviews?.total ?? stats.interviews;
  const offerCount = dashboardSummary?.applications?.offer ?? stats.offers;
  const rejectionCount = dashboardSummary?.applications?.rejected ?? stats.rejections;
  const avgFit = dashboardSummary?.applications?.avgFitScore ?? stats.avgFitScore ?? 85;

  return (
    <div className="space-y-6 pb-12">
      {/* ========================================================================= */}
      {/* 1. WELCOME HERO SECTION */}
      {/* ========================================================================= */}
      <div className="p-5 sm:p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          {/* Welcome Text & Readiness Bar */}
          <div className="space-y-2 max-w-xl">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Good morning, {user?.name?.split(' ')[0] || 'Member'} 👋
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Here's what needs your attention today across your career pipeline.
            </p>

            {/* Compact Career Readiness Bar */}
            <div className="pt-2 flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>Career Readiness:</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">{readinessScore}/100</span>
              </div>
              <div className="w-32 bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-indigo-600 dark:bg-indigo-500 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min(100, Math.max(5, readinessScore))}%` }} 
                />
              </div>
            </div>
          </div>

          {/* Primary & Secondary Action Buttons */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => onOpenAddModal?.('Applied')}
              className="flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-98 rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Application</span>
            </button>
            <button
              onClick={() => navigate('/interviews')}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 rounded-xl transition-all cursor-pointer"
            >
              <Bot className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Prepare for Interview</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. WHAT NEEDS YOUR ATTENTION */}
      {/* ========================================================================= */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            What Needs Your Attention
          </h2>
          <span className="text-[11px] text-slate-400 font-medium">Active insights</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {attentionItems.map((item) => {
            const Icon = item.icon;
            const colorClasses = {
              amber: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-200/70 dark:border-amber-900/50',
              indigo: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border-indigo-200/70 dark:border-indigo-900/50',
              purple: 'bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border-purple-200/70 dark:border-purple-900/50',
              emerald: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200/70 dark:border-emerald-900/50',
            }[item.color];

            return (
              <div
                key={item.id}
                onClick={item.onAction}
                className="p-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/70 dark:border-slate-800/80 shadow-xs hover:border-indigo-300 dark:hover:border-indigo-700/60 transition-all flex flex-col justify-between cursor-pointer group"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${colorClasses}`}>
                      {item.tag}
                    </span>
                    <Icon className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                      {item.title}
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>

                <div className="pt-2.5 mt-2 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                  <span>{item.actionText}</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. COMPACT STATISTICS ROW */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard
          title="Applications"
          value={totalAppCount}
          subtitle="Pipeline active"
          icon={Layers}
          color="indigo"
          onClick={() => navigate('/applications')}
        />
        <StatCard
          title="Interviews"
          value={interviewCount}
          subtitle="Scheduled / Prep"
          icon={Calendar}
          color="amber"
          onClick={() => navigate('/applications')}
        />
        <StatCard
          title="Offers"
          value={offerCount}
          subtitle="Confirmed offers"
          icon={Award}
          color="emerald"
          onClick={() => navigate('/applications')}
        />
        <StatCard
          title="Rejections"
          value={rejectionCount}
          subtitle="Diagnosed"
          icon={XCircle}
          color="rose"
          onClick={() => navigate('/applications')}
        />
        <StatCard
          title="Avg Fit Score"
          value={`${avgFit}%`}
          subtitle="Role overlap"
          icon={TrendingUp}
          color="blue"
          onClick={() => navigate('/jobs')}
        />
        <StatCard
          title="Readiness"
          value={`${readinessScore}/100`}
          subtitle="Career score"
          icon={Sparkles}
          color="purple"
          onClick={() => navigate('/analytics')}
        />
      </div>

      {/* ========================================================================= */}
      {/* 4. TWO-COLUMN: UPCOMING INTERVIEWS & CAREER READINESS */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Upcoming Interviews (7 cols) */}
        <div className="lg:col-span-7">
          <Card
            title="Upcoming Interviews"
            subtitle="Scheduled rounds and preparation shortcuts"
            action={
              <button
                onClick={() => navigate('/applications')}
                className="flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                <span>View all ({upcomingInterviews.length})</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            }
          >
            <div className="space-y-3">
              {upcomingInterviews.length === 0 ? (
                <div className="py-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/60 dark:border-slate-800/60">
                  <Calendar className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
                    No upcoming interviews scheduled
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Track new interview rounds from your application tracker.
                  </p>
                </div>
              ) : (
                upcomingInterviews.map((app) => (
                  <div
                    key={app.id || app._id}
                    className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-indigo-300 dark:hover:border-indigo-700/60 transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-bold text-sm flex items-center justify-center shrink-0">
                        {app.company?.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100 truncate">
                            {app.company}
                          </h4>
                          <span className="px-1.5 py-0.2 rounded-md text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60">
                            {app.fitScore || 85}% Match
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 truncate mt-0.5">
                          {app.jobTitle}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5 font-medium flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{app.interviewDate ? formatDate(app.interviewDate) : 'Scheduled'} • {app.interviewRound || 'Technical Round'}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200/60 dark:border-slate-700">
                      <button
                        onClick={() => navigate(`/applications/${app.id || app._id}`)}
                        className="px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 hover:bg-slate-100 rounded-lg border border-slate-200 dark:border-slate-600 transition-colors cursor-pointer"
                      >
                        Details
                      </button>
                      <button
                        onClick={() => navigate(`/interview/${app.id || app._id}`)}
                        className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-98 rounded-lg transition-all shadow-xs cursor-pointer"
                      >
                        Prepare
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Right: Career Readiness (5 cols) */}
        <div className="lg:col-span-5">
          <Card
            title="Career Readiness Breakdown"
            subtitle={`Overall Score: ${readinessScore} / 100`}
            action={
              <button
                onClick={() => navigate('/analytics')}
                className="flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
              >
                <span>View analysis</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            }
          >
            <div className="space-y-2.5 pt-1">
              <ProgressBar label="Profile & Portfolio" value={profilePercent} color="purple" size="sm" />
              <ProgressBar label="Active Pipeline" value={Math.min(100, totalAppCount * 15)} color="indigo" size="sm" />
              <ProgressBar label="Interview Preparation" value={Math.min(100, (dashboardSummary?.interviews?.averagePreparationProgress || 70))} color="amber" size="sm" />
              <ProgressBar label="Overall Readiness" value={readinessScore} color="emerald" size="sm" />
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <button
                onClick={() => setShowRadarChart(!showRadarChart)}
                className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-medium cursor-pointer"
              >
                {showRadarChart ? 'Hide radar chart' : 'Show radar breakdown'}
              </button>
              <button
                onClick={() => navigate('/resume')}
                className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline cursor-pointer"
              >
                Optimize Resume →
              </button>
            </div>

            {showRadarChart && (
              <div className="mt-3 pt-2">
                <ReadinessRadar data={user?.careerReadiness?.breakdown} />
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. APPLICATION PIPELINE PROGRESSION */}
      {/* ========================================================================= */}
      <Card
        title="Application Progress Pipeline"
        subtitle="Current status distribution across your tracked positions"
        action={
          <button
            onClick={() => {
              setStatusFilter('All');
              navigate('/applications');
            }}
            className="flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
          >
            <span>Open Tracker ({totalAppCount})</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        }
      >
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1">
          {pipelineStages.map((stage, idx) => (
            <React.Fragment key={stage.key}>
              <div
                onClick={() => handleStageClick(stage.key)}
                className="flex-1 min-w-[110px] p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 hover:border-indigo-300 dark:hover:border-indigo-600 cursor-pointer transition-all text-center group"
              >
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">
                  {stage.label}
                </span>
                <span className="text-lg font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 transition-colors">
                  {stage.count}
                </span>
              </div>
              {idx < pipelineStages.length - 1 && (
                <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 shrink-0" />
              )}
            </React.Fragment>
          ))}
        </div>
      </Card>

      {/* ========================================================================= */}
      {/* 6. TWO-COLUMN: COMMUNITY (PEOPLE WHO CAN HELP & CANDIDATE EXPERIENCES) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: People Who Can Help You */}
        <Card
          title="People Who Can Help You"
          subtitle="Discover alumni & mentors who cracked similar roles"
          action={
            <button
              onClick={() => navigate('/explore')}
              className="flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
            >
              <span>Explore more people</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          }
        >
          <div className="space-y-3">
            {recommendedPeople.map((person) => {
              const personId = person._id || person.id || (person.user?._id || person.user);
              const displayName = person.name || person.user?.name || 'CareerPilot Member';
              const displayRole = person.targetRole || person.headline || person.role || 'Software Engineer';
              const displayCompany = person.company || person.currentCompany || 'Tech Company';

              return (
                <div
                  key={personId}
                  className="p-3.5 bg-slate-50/70 dark:bg-slate-800/50 rounded-xl border border-slate-200/60 dark:border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-indigo-300 dark:hover:border-indigo-700/60 transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white font-bold text-xs flex items-center justify-center shrink-0">
                      {displayName.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <h4
                        onClick={() => navigate(`/people/${personId}`)}
                        className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer truncate"
                      >
                        {displayName}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {displayRole} <span className="font-semibold text-indigo-600 dark:text-indigo-400">@ {displayCompany}</span>
                      </p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {(person.skills || []).slice(0, 3).map((s) => (
                          <SkillBadge key={typeof s === 'string' ? s : s.name} name={typeof s === 'string' ? s : s.name} type="neutral" />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200/60 dark:border-slate-700">
                    <button
                      onClick={() => navigate(`/people/${personId}`)}
                      className="px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 hover:bg-slate-100 rounded-lg border border-slate-200 dark:border-slate-600 transition-colors cursor-pointer"
                    >
                      View profile
                    </button>
                    <button
                      onClick={() => handleOpenGuidance(person)}
                      className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-98 rounded-lg transition-all shadow-xs cursor-pointer"
                    >
                      Request guidance
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Right: Learn From Previous Candidates (Interview Experiences) */}
        <Card
          title="Learn From Previous Candidates"
          subtitle="Real interview questions and candidate preparation roadmaps"
          action={
            <button
              onClick={() => navigate('/interviews')}
              className="flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
            >
              <span>View all experiences</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          }
        >
          <div className="space-y-3">
            {recommendedExperiences.map((exp) => {
              const expId = exp._id || exp.id;
              const companyName = exp.companyName || exp.company || 'Tech Company';
              const roleTitle = exp.jobTitle || exp.role || 'Software Engineer';

              return (
                <div
                  key={expId}
                  className="p-3.5 bg-slate-50/70 dark:bg-slate-800/50 rounded-xl border border-slate-200/60 dark:border-slate-700/60 flex flex-col justify-between space-y-2 hover:border-indigo-300 dark:hover:border-indigo-700/60 transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h4
                        onClick={() => navigate(`/interviews/${expId}`)}
                        className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer truncate"
                      >
                        {companyName} — {roleTitle}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Prep Duration: {exp.preparationDuration || '4 Months'} • {exp.year || 'Recent'}
                      </p>
                    </div>
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md border shrink-0 ${getDifficultyBadge(exp.difficulty || exp.overallDifficulty)}`}>
                      {exp.difficulty || exp.overallDifficulty || 'Medium'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1 text-xs border-t border-slate-200/40 dark:border-slate-700/40">
                    <span className="text-[11px] text-slate-400">
                      {exp.rounds?.length || exp.numberOfRounds || 4} Rounds Evaluated
                    </span>
                    <button
                      onClick={() => navigate(`/interviews/${expId}`)}
                      className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>Read experience</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* ========================================================================= */}
      {/* GUIDANCE REQUEST MODAL */}
      {/* ========================================================================= */}
      <RequestGuidanceModal
        isOpen={isGuidanceModalOpen}
        onClose={() => setIsGuidanceModalOpen(false)}
        person={selectedPersonForGuidance}
        onSubmitRequest={handleGuidanceSubmit}
      />
    </div>
  );
}
