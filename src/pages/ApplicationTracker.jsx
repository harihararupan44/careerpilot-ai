import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  LayoutGrid,
  List,
  Search,
  Filter,
  Plus,
  SlidersHorizontal,
  Layers,
  ArrowUpDown,
  X,
  Sparkles,
  ChevronDown
} from 'lucide-react';
import ApplicationKanban from '../components/applications/ApplicationKanban';
import ApplicationTable from '../components/applications/ApplicationTable';
import EmptyState from '../components/common/EmptyState';
import { useApplications } from '../context/ApplicationContext';
import { getStatusConfig } from '../utils/formatters';

export default function ApplicationTracker() {
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' | 'table'
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  
  const {
    applications,
    filteredApplications,
    stats,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    sortBy,
    setSortBy,
    changeStatus,
    deleteApplication
  } = useApplications();

  const { onOpenAddModal } = useOutletContext() || {};

  const statuses = ['All', 'Saved', 'Applied', 'Assessment', 'Interview', 'Offer', 'Rejected', 'Withdrawn'];

  // Summary strip status counts
  const summaryStages = [
    { id: 'Saved', label: 'Saved', count: stats.saved, color: 'bg-slate-400' },
    { id: 'Applied', label: 'Applied', count: stats.applied, color: 'bg-blue-500' },
    { id: 'Assessment', label: 'Assessment', count: stats.assessments, color: 'bg-purple-500' },
    { id: 'Interview', label: 'Interview', count: stats.interviews, color: 'bg-amber-500' },
    { id: 'Offer', label: 'Offer', count: stats.offers, color: 'bg-emerald-500' },
    { id: 'Rejected', label: 'Rejected', count: stats.rejections, color: 'bg-rose-500' },
  ];

  const handleStageClick = (stageId) => {
    if (statusFilter.toLowerCase() === stageId.toLowerCase()) {
      setStatusFilter('All');
    } else {
      setStatusFilter(stageId);
    }
  };

  return (
    <div className="space-y-5">
      {/* 1. Header & Primary CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
            Application Tracker
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track every application from saved job to offer.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* View Toggle (Grid / List) */}
          <div className="flex items-center p-1 bg-slate-200/80 dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'kanban'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
              title="Kanban Board View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Board</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
              title="Table List View"
            >
              <List className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">List</span>
            </button>
          </div>

          {/* Primary Action */}
          <button
            onClick={() => onOpenAddModal?.('Applied')}
            className="flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-all active:scale-98 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Application</span>
          </button>
        </div>
      </div>

      {/* 2. Compact Summary Strip */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-3 shadow-xs">
        <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto scrollbar-none py-0.5">
          <div className="flex items-center gap-1.5 pr-3 border-r border-slate-200 dark:border-slate-800 shrink-0">
            <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
              {stats.total} Applications
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {summaryStages.map((stage) => {
              const isActive = statusFilter.toLowerCase() === stage.id.toLowerCase();
              return (
                <button
                  key={stage.id}
                  onClick={() => handleStageClick(stage.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold ring-1 ring-indigo-300 dark:ring-indigo-700'
                      : 'bg-slate-100/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                  title={`Filter by ${stage.label}`}
                >
                  <span className={`w-2 h-2 rounded-full ${stage.color}`} />
                  <span>{stage.label}</span>
                  <span className="font-bold text-[11px] opacity-90">({stage.count})</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. Search, Filter Pills & Sorting Controls */}
      <div className="space-y-2.5">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search companies, roles, or locations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-9 py-1.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/80 rounded-xl outline-none focus:border-indigo-500 transition-colors"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Desktop Status Pills */}
          <div className="hidden lg:flex items-center gap-1 shrink-0 overflow-x-auto">
            {statuses.map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg shrink-0 transition-colors ${
                  statusFilter.toLowerCase() === s.toLowerCase()
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between md:justify-end gap-2 shrink-0">
            {/* Mobile/Tablet Filter Button */}
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className={`lg:hidden flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border transition-colors ${
                statusFilter !== 'All'
                  ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300'
                  : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Filters</span>
              {statusFilter !== 'All' && (
                <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0" />
              )}
            </button>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl outline-none focus:border-indigo-500 font-medium text-slate-700 dark:text-slate-200"
              >
                <option value="date-desc">Newest First</option>
                <option value="date-asc">Oldest First</option>
                <option value="score-desc">Highest Fit Score</option>
                <option value="score-asc">Lowest Fit Score</option>
                <option value="company">Company Name (A-Z)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Expandable Mobile Filters Panel */}
        {showMobileFilters && (
          <div className="lg:hidden p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-2 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
              <span>Filter by Status</span>
              {statusFilter !== 'All' && (
                <button
                  onClick={() => setStatusFilter('All')}
                  className="text-xs text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
                >
                  Reset
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {statuses.map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setStatusFilter(s);
                    setShowMobileFilters(false);
                  }}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                    statusFilter.toLowerCase() === s.toLowerCase()
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 4. Main Content Area: Kanban or Table */}
      {filteredApplications.length === 0 ? (
        <EmptyState
          title="No applications match your criteria"
          description="Try clearing your search or status filters to view all tracked job applications."
          actionText="Clear Filters"
          onAction={() => {
            setSearchTerm('');
            setStatusFilter('All');
          }}
        />
      ) : viewMode === 'kanban' ? (
        <ApplicationKanban
          applications={filteredApplications}
          onStatusChange={changeStatus}
          onDelete={deleteApplication}
          onOpenAddModal={onOpenAddModal}
        />
      ) : (
        <ApplicationTable
          applications={filteredApplications}
          onStatusChange={changeStatus}
          onDelete={deleteApplication}
        />
      )}
    </div>
  );
}
