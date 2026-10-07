import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Sparkles,
  ArrowUpDown,
  X,
  Filter,
  Layers,
  Building2,
  FileQuestion,
  BookOpen,
  Plus,
  Loader2,
  RotateCcw
} from 'lucide-react';
import { mockInterviewExperiences } from '../data/mockInterviewExperiences';
import ExperienceCard from '../components/interviews/ExperienceCard';
import ExperienceFilters from '../components/interviews/ExperienceFilters';
import CreateExperienceModal from '../components/interviews/CreateExperienceModal';
import EmptyState from '../components/common/EmptyState';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { interviewExperiencesApi } from '../services/api';

export default function InterviewExperiences() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addToast } = useToast();

  // API State
  const [dbExperiences, setDbExperiences] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Search, Filters & Sorting State
  const [searchTerm, setSearchTerm] = useState('');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [filters, setFilters] = useState({
    company: 'All',
    role: 'All',
    difficulty: 'All',
    year: 'All',
    rounds: 'All'
  });
  const [sortBy, setSortBy] = useState('recent'); // 'recent', 'helpful', 'difficulty'

  const quickSearchChips = [
    'Amazon',
    'Google',
    'Microsoft',
    'Software Engineer',
    'Java',
    'DSA',
    'React',
    'System Design'
  ];

  // Fetch experiences from API
  const fetchExperiences = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await interviewExperiencesApi.getExperiences({ limit: 50 });
      if (res.success && Array.isArray(res.data)) {
        setDbExperiences(res.data);
      }
    } catch (err) {
      console.warn('Could not load experiences from API, using fallback data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExperiences();
  }, [fetchExperiences]);

  // Combined dataset: API data prioritized, merged with mockInterviewExperiences
  const allExperiences = useMemo(() => {
    if (dbExperiences.length > 0) {
      const dbIds = new Set(dbExperiences.map((e) => e._id || e.id));
      const filteredMock = mockInterviewExperiences.filter((m) => !dbIds.has(m.id));
      return [...dbExperiences, ...filteredMock];
    }
    return mockInterviewExperiences;
  }, [dbExperiences]);

  // Extract unique options for filter dropdowns
  const companies = useMemo(() => {
    const list = [...new Set(allExperiences.map((e) => e.company || e.companyName).filter(Boolean))];
    return list.sort();
  }, [allExperiences]);

  const roles = useMemo(() => {
    const list = [...new Set(allExperiences.map((e) => e.role || e.jobTitle).filter(Boolean))];
    return list.sort();
  }, [allExperiences]);

  const years = useMemo(() => {
    const list = [...new Set(allExperiences.map((e) => e.year).filter(Boolean))];
    return list.sort().reverse();
  }, [allExperiences]);

  // Filter change handler
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  // Reset all filters & search
  const handleResetFilters = () => {
    setSearchTerm('');
    setFilters({
      company: 'All',
      role: 'All',
      difficulty: 'All',
      year: 'All',
      rounds: 'All'
    });
    setSortBy('recent');
  };

  // Active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.company !== 'All') count++;
    if (filters.role !== 'All') count++;
    if (filters.difficulty !== 'All') count++;
    if (filters.year !== 'All') count++;
    if (filters.rounds !== 'All') count++;
    return count;
  }, [filters]);

  // Filtered & Sorted Experiences
  const filteredExperiences = useMemo(() => {
    return allExperiences
      .filter((exp) => {
        const comp = exp.company || exp.companyName || '';
        const roleStr = exp.role || exp.jobTitle || '';
        const authorName = exp.author?.name || '';
        const techs = exp.technologies || exp.skills || [];
        const tops = exp.topics || [];
        const summaryText = exp.summary || exp.overallExperience || exp.experienceTitle || '';

        // Search across: Company, Role, Author Name, Technologies, Topics, Summary
        if (searchTerm.trim()) {
          const query = searchTerm.toLowerCase().trim();
          const matchCompany = comp.toLowerCase().includes(query);
          const matchRole = roleStr.toLowerCase().includes(query);
          const matchAuthor = authorName.toLowerCase().includes(query);
          const matchTech = techs.some((t) => t.toLowerCase().includes(query));
          const matchTopics = tops.some((top) => top.toLowerCase().includes(query));
          const matchSummary = summaryText.toLowerCase().includes(query);

          if (!matchCompany && !matchRole && !matchAuthor && !matchTech && !matchTopics && !matchSummary) {
            return false;
          }
        }

        // Dropdown Filters
        if (filters.company !== 'All' && comp !== filters.company) return false;
        if (filters.role !== 'All' && roleStr !== filters.role) return false;

        const diff = exp.difficulty || exp.overallDifficulty || '';
        if (filters.difficulty !== 'All' && diff.toLowerCase() !== filters.difficulty.toLowerCase()) {
          return false;
        }

        if (filters.year !== 'All' && exp.year !== filters.year) return false;

        const numRounds = exp.numberOfRounds || (exp.rounds && exp.rounds.length) || 0;
        if (filters.rounds !== 'All') {
          if (filters.rounds === '2 Rounds' && numRounds !== 2) return false;
          if (filters.rounds === '3 Rounds' && numRounds !== 3) return false;
          if (filters.rounds === '4 Rounds' && numRounds !== 4) return false;
          if (filters.rounds === '5+ Rounds' && numRounds < 5) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'helpful') {
          return (b.helpfulCount || 0) - (a.helpfulCount || 0);
        }
        if (sortBy === 'difficulty') {
          const diffWeight = { 'Very Hard': 4, Hard: 3, Medium: 2, Easy: 1 };
          const diffA = a.difficulty || a.overallDifficulty || 'Medium';
          const diffB = b.difficulty || b.overallDifficulty || 'Medium';
          return (diffWeight[diffB] || 0) - (diffWeight[diffA] || 0);
        }
        return new Date(b.createdAt || b.date || `${b.year}-01-01`) - new Date(a.createdAt || a.date || `${a.year}-01-01`);
      });
  }, [allExperiences, searchTerm, filters, sortBy]);

  // Handle Create Experience
  const handleOpenShareModal = () => {
    if (!isAuthenticated) {
      addToast({
        title: 'Sign in Required',
        message: 'Please log in to share your interview experience.',
        type: 'info'
      });
      return;
    }
    setIsModalOpen(true);
  };

  const handleCreateSubmit = async (payload) => {
    try {
      const res = await interviewExperiencesApi.createExperience(payload);
      if (res.success) {
        addToast({
          title: 'Interview Experience Shared!',
          message: 'Your experience has been published for the community.',
          type: 'success'
        });
        fetchExperiences();
      }
    } catch (err) {
      addToast({
        title: 'Error',
        message: err.message || 'Could not share interview experience.',
        type: 'error'
      });
      throw err;
    }
  };

  return (
    <div className="space-y-5">
      {/* 1. Page Header with Share Experience Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
            Interview Experiences
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Learn how candidates prepared, what they were asked, and what helped them succeed.
          </p>
        </div>

        <button
          onClick={handleOpenShareModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-98 rounded-xl shadow-xs transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Share Experience</span>
        </button>
      </div>

      {/* 2. Prominent Search Bar & Quick Chips */}
      <div className="space-y-2.5">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search company, role, skill, or interview topic..."
            className="w-full pl-12 pr-10 py-3 text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-slate-900 dark:text-slate-100 font-medium transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Quick-Search Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 mr-1 shrink-0">
            Quick search:
          </span>
          {quickSearchChips.map((chip) => {
            const isSelected = searchTerm.toLowerCase() === chip.toLowerCase();
            return (
              <button
                key={chip}
                onClick={() => setSearchTerm(isSelected ? '' : chip)}
                className={`px-3 py-1 rounded-xl text-xs font-medium shrink-0 transition-all ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-2xs font-semibold'
                    : 'bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {chip}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Compact Desktop Filters */}
      <div className="hidden lg:block">
        <ExperienceFilters
          filters={filters}
          onChange={handleFilterChange}
          onReset={handleResetFilters}
          companies={companies}
          roles={roles}
          years={years}
          activeFilterCount={activeFilterCount}
        />
      </div>

      {/* Mobile Filter Toggle & Controls */}
      <div className="lg:hidden flex items-center justify-between gap-2">
        <button
          onClick={() => setShowMobileFilters(!showMobileFilters)}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border transition-colors ${
            activeFilterCount > 0
              ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 shadow-2xs'
          }`}
        >
          <Filter className="w-3.5 h-3.5" />
          <span>Filters</span>
          {activeFilterCount > 0 && (
            <span className="w-2 h-2 rounded-full bg-indigo-600" />
          )}
        </button>

        <div className="flex items-center gap-1.5">
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none font-semibold text-slate-800 dark:text-slate-200 shadow-2xs"
          >
            <option value="recent">Most Recent</option>
            <option value="helpful">Most Helpful</option>
            <option value="difficulty">Difficulty</option>
          </select>
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      {showMobileFilters && (
        <div className="lg:hidden p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
            <span>Filter Experiences</span>
            {activeFilterCount > 0 && (
              <button
                onClick={handleResetFilters}
                className="text-xs text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
              >
                Reset
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <select
              value={filters.company}
              onChange={(e) => handleFilterChange('company', e.target.value)}
              className="px-2.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
            >
              <option value="All">All Companies</option>
              {companies.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <select
              value={filters.role}
              onChange={(e) => handleFilterChange('role', e.target.value)}
              className="px-2.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
            >
              <option value="All">All Roles</option>
              {roles.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
            <select
              value={filters.difficulty}
              onChange={(e) => handleFilterChange('difficulty', e.target.value)}
              className="px-2.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
            >
              <option value="All">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
              <option value="Very Hard">Very Hard</option>
            </select>
          </div>
          <button
            onClick={() => setShowMobileFilters(false)}
            className="w-full py-2 text-xs font-bold text-white bg-indigo-600 rounded-xl mt-2"
          >
            Apply Filters
          </button>
        </div>
      )}

      {/* 4. Results Counter & Sorting (Desktop) */}
      <div className="hidden lg:flex items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
          <span>Showing</span>
          <strong className="font-bold text-slate-900 dark:text-slate-100">
            {filteredExperiences.length}
          </strong>
          <span>
            {filteredExperiences.length === 1 ? 'interview experience' : 'interview experiences'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-indigo-500 font-semibold text-slate-800 dark:text-slate-200 shadow-2xs"
          >
            <option value="recent">Most Recent</option>
            <option value="helpful">Most Helpful</option>
            <option value="difficulty">Difficulty</option>
          </select>
        </div>
      </div>

      {/* 5. Loading / Experiences Grid */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
            Loading interview experiences...
          </p>
        </div>
      ) : filteredExperiences.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredExperiences.map((experience) => {
            const expId = experience._id || experience.id;
            return (
              <ExperienceCard
                key={expId}
                experience={experience}
                onReadExperience={() => navigate(`/interviews/${expId}`)}
              />
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={FileQuestion}
          title="No interview experiences found"
          description="Try changing your search or filters to discover candidate transcripts, or be the first to share one!"
          actionText="Clear Filters"
          onAction={handleResetFilters}
        />
      )}

      {/* 6. Share Experience Modal */}
      <CreateExperienceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateSubmit}
      />
    </div>
  );
}

