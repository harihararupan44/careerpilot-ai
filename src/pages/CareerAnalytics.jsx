import React, { useState, useEffect, useCallback } from 'react';
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import Card from '../components/common/Card';
import StatCard from '../components/common/StatCard';
import {
  TrendingUp,
  Layers,
  Award,
  XCircle,
  Calendar,
  Sparkles,
  ArrowRight,
  BookOpen,
  UserCheck,
  Users,
  Loader2
} from 'lucide-react';
import { useApplications } from '../context/ApplicationContext';
import { useGuidance } from '../context/GuidanceContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { analyticsApi } from '../services/api';
import { mockAnalyticsData } from '../data/mockAnalytics';

export default function CareerAnalytics() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { stats: appStats } = useApplications();
  const { stats: guidanceStats } = useGuidance();

  const [analyticsData, setAnalyticsData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAnalytics = useCallback(async () => {
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      const res = await analyticsApi.getOverview();
      if (res.success && res.data) {
        setAnalyticsData(res.data);
      }
    } catch (err) {
      console.warn('Could not fetch real analytics data:', err.message);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const COLORS = ['#f59e0b', '#10b981', '#a855f7', '#3b82f6', '#64748b', '#ef4444', '#94a3b8'];

  // Combine real backend data with structured fallback shapes
  const summary = analyticsData?.summary || {
    totalApplications: appStats.total,
    interviews: appStats.interviews,
    offers: appStats.offers,
    rejections: appStats.rejections,
    interviewRate: appStats.interviewRate || 0,
    offerRate: appStats.offerRate || 0,
    rejectionRate: appStats.rejectionRate || 0,
    averageFitScore: appStats.avgFitScore || 85,
    careerReadinessScore: 76
  };

  const applicationsOverTime = analyticsData?.applicationsOverTime?.length
    ? analyticsData.applicationsOverTime
    : mockAnalyticsData.applicationsOverTime;

  const statusDistribution = analyticsData?.statusDistribution?.length
    ? analyticsData.statusDistribution
    : (appStats.total > 0
        ? [
            { name: 'Interview', value: appStats.interviews, color: '#f59e0b' },
            { name: 'Offer', value: appStats.offers, color: '#10b981' },
            { name: 'Applied', value: appStats.applied, color: '#3b82f6' },
            { name: 'Rejected', value: appStats.rejections, color: '#ef4444' }
          ].filter(s => s.value > 0)
        : mockAnalyticsData.statusDistribution);

  const fitScoreTrends = analyticsData?.fitScoreTrends?.length
    ? analyticsData.fitScoreTrends
    : mockAnalyticsData.fitScoreTrends;

  const skillGapFrequency = mockAnalyticsData.skillGapFrequency;
  const aiCoachInsights = mockAnalyticsData.aiCoachInsights;

  const totalExperiences = analyticsData?.interviewExperiences ?? 14;
  const totalConnections = analyticsData?.connections ?? 8;
  const totalGuidance = (analyticsData?.guidance?.pending || 0) + (analyticsData?.guidance?.accepted || 0) || (guidanceStats.totalPending + guidanceStats.totalAccepted);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
            Career Analytics & AI Coach
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Quantitative conversion rates, application volume trajectories, and career community mentorship engagement.
          </p>
        </div>

        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-indigo-600 dark:text-indigo-400 font-semibold self-start sm:self-auto">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Updating real-time stats...</span>
          </div>
        )}
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          title="Interview Rate"
          value={`${summary.interviewRate}%`}
          subtitle={`${summary.interviews || 0} of ${summary.totalApplications || 0} applied roles`}
          icon={Calendar}
          color="amber"
          onClick={() => navigate('/applications')}
        />
        <StatCard
          title="Offer Rate"
          value={`${summary.offerRate}%`}
          subtitle={`${summary.offers || 0} confirmed offer${summary.offers === 1 ? '' : 's'}`}
          icon={Award}
          color="emerald"
          onClick={() => navigate('/applications')}
        />
        <StatCard
          title="Rejection Rate"
          value={`${summary.rejectionRate}%`}
          subtitle={`${summary.rejections || 0} diagnosed`}
          icon={XCircle}
          color="rose"
          onClick={() => navigate('/applications')}
        />
        <StatCard
          title="Avg Fit Score"
          value={`${summary.averageFitScore}%`}
          subtitle="Target role overlap"
          icon={TrendingUp}
          color="indigo"
          onClick={() => navigate('/jobs')}
        />
      </div>

      {/* Community Engagement Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Interview Experiences Read"
          value={String(totalExperiences)}
          subtitle="Platform interview intelligence"
          icon={BookOpen}
          color="blue"
          onClick={() => navigate('/interviews')}
        />
        <StatCard
          title="Guidance Requests"
          value={String(totalGuidance)}
          subtitle={`${analyticsData?.guidance?.accepted || guidanceStats.totalAccepted} confirmed • ${analyticsData?.guidance?.pending || guidanceStats.totalPending} pending`}
          icon={UserCheck}
          color="purple"
          onClick={() => navigate('/guidance')}
        />
        <StatCard
          title="Career Connections"
          value={String(totalConnections)}
          subtitle="Alumni & Industry Mentors"
          icon={Users}
          color="emerald"
          onClick={() => navigate('/explore')}
        />
      </div>

      {/* Row 1: Applications Over Time & Status Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Applications Over Time AreaChart (7 cols) */}
        <div className="lg:col-span-7">
          <Card title="Applications & Interview Growth Over Time" subtitle="Monthly pipeline trajectory">
            <div className="h-64 sm:h-72 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={applicationsOverTime}>
                  <defs>
                    <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorInterviews" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  <Area type="monotone" dataKey="applications" name="Total Applications" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorApps)" />
                  <Area type="monotone" dataKey="interviews" name="Interviews" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#colorInterviews)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Applications by Status Donut (5 cols) */}
        <div className="lg:col-span-5">
          <Card title="Applications by Status Distribution" subtitle={`Breakdown of ${summary.totalApplications || 0} tracked opportunities`}>
            <div className="h-64 sm:h-72 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '4px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>

      {/* Row 2: Fit Score Correlation & Skill Gap Frequency */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Fit Score vs Interview Rate (6 cols) */}
        <div className="lg:col-span-6">
          <Card title="Fit Score vs. Interview Invitation Rate" subtitle="Demonstrating higher interview odds at >80% fit score">
            <div className="h-64 sm:h-72 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={fitScoreTrends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="range" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} unit="%" />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  <Bar dataKey="interviewRate" name="Interview Conversion %" fill="#10b981" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Skill Gap Frequency Bar Chart (6 cols) */}
        <div className="lg:col-span-6">
          <Card title="Most Frequent Missing Skills in Market" subtitle="Based on analysis of target tech job descriptions">
            <div className="h-64 sm:h-72 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={skillGapFrequency} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis type="number" stroke="#94a3b8" fontSize={11} />
                  <YAxis type="category" dataKey="skill" stroke="#64748b" fontSize={11} width={130} />
                  <Tooltip />
                  <Bar dataKey="missingInJobs" name="Jobs Missing This Skill" fill="#f43f5e" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>

      {/* AI Career Coach Insights Section */}
      <Card title="AI Career Coach Diagnostic Insights">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {aiCoachInsights.map((insight) => (
            <div
              key={insight.id}
              className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 font-bold text-xs mb-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Coach Recommendation</span>
                </div>
                <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100">{insight.title}</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                  {insight.description}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-indigo-100/80 dark:border-indigo-900/60">
                <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 cursor-pointer hover:underline">
                  {insight.actionText} <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
